// =============================================================
// lumapse-audit — Auditor concurrente de código fuente
// Script #35 del toolchain de Lumapse
//
// Unifica tres verificaciones que antes corrían por separado
// (check-file-size.sh, check-docs.sh/TODOs, check-offline.sh)
// en un solo pase concurrente sobre el filesystem.
//
// Ventaja: lee cada archivo UNA sola vez y aplica las 3 reglas
// en paralelo usando threads nativos de Rust.
//
// Uso:
//   cargo run --release
//   cargo run --release -- --json
//   cargo run --release -- --help
//
// O compilar y copiar el binario:
//   cargo build --release
//   cp target/release/lumapse-audit ../../lumapse-audit
// =============================================================

use std::env;
use std::fs;
use std::io::{self, BufRead};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Instant;

// --- Configuración ---

const LOC_WARN: usize = 250;
const LOC_DANGER: usize = 400;

/// Extensiones que nos interesan auditar
const EXTENSIONS: &[&str] = &["js", "css", "html"];

/// Directorios a excluir del escaneo
const EXCLUDED_DIRS: &[&str] = &[
    "node_modules", "dist", "android", ".git", "tmp",
    "docs", "scripts", "analisis-relevamiento", "target",
];

/// Patrones de URL externa (offline-first check)
const URL_PATTERNS: &[&str] = &["http://", "https://"];

/// Patrones de tareas pendientes
const TODO_PATTERNS: &[&str] = &["TODO", "FIXME", "HACK", "XXX"];

// --- Modelo de datos ---

#[derive(Debug, Clone)]
struct FileReport {
    path: String,
    loc: usize,
    loc_status: LocStatus,
    todos: Vec<TodoEntry>,
    external_urls: Vec<UrlEntry>,
}

#[derive(Debug, Clone)]
enum LocStatus {
    Ok,
    Warning,
    Danger,
}

#[derive(Debug, Clone)]
struct TodoEntry {
    line_num: usize,
    line_content: String,
    pattern: String,
}

#[derive(Debug, Clone)]
struct UrlEntry {
    line_num: usize,
    line_content: String,
    is_comment: bool,
}

// --- Escaneo del filesystem ---

/// Recolecta recursivamente archivos con extensiones válidas,
/// excluyendo directorios no relevantes.
fn collect_files(base: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    collect_files_recursive(base, &mut files);
    files
}

fn collect_files_recursive(dir: &Path, files: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            let dir_name = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");
            if !EXCLUDED_DIRS.contains(&dir_name) {
                collect_files_recursive(&path, files);
            }
        } else if path.is_file() {
            let ext = path.extension()
                .and_then(|e| e.to_str())
                .unwrap_or("");
            if EXTENSIONS.contains(&ext) {
                files.push(path);
            }
        }
    }
}

// --- Análisis de un archivo (single-pass) ---

/// Lee el archivo UNA sola vez y ejecuta las 3 auditorías simultáneamente.
fn analyze_file(path: &Path, base: &Path) -> io::Result<FileReport> {
    let relative = path.strip_prefix(base).unwrap_or(path);
    let rel_str = relative.to_string_lossy().to_string();

    let file = fs::File::open(path)?;
    let reader = io::BufReader::new(file);

    let mut loc: usize = 0;
    let mut todos: Vec<TodoEntry> = Vec::new();
    let mut external_urls: Vec<UrlEntry> = Vec::new();

    for (idx, line_result) in reader.lines().enumerate() {
        let line = match line_result {
            Ok(l) => l,
            Err(_) => continue,
        };
        let line_num = idx + 1;
        let trimmed = line.trim();

        // 1) LOC: contar líneas no vacías
        if !trimmed.is_empty() {
            loc += 1;
        }

        // 2) TODOs/FIXMEs (solo si aparece como palabra completa,
        //    ej. "TODO:", "TODO ", "FIXME(" — no como substring de "todos")
        let upper = trimmed.to_uppercase();
        for pat in TODO_PATTERNS {
            if let Some(pos) = upper.find(pat) {
                let after = pos + pat.len();
                let char_after = upper.chars().nth(after);
                let char_before = if pos > 0 { upper.chars().nth(pos - 1) } else { None };
                // Verificar word boundary en ambos lados
                let boundary_after = char_after.is_none()
                    || !char_after.unwrap().is_alphanumeric();
                let boundary_before = char_before.is_none()
                    || !char_before.unwrap().is_alphanumeric();
                if boundary_before && boundary_after {
                    todos.push(TodoEntry {
                        line_num,
                        line_content: trimmed.to_string(),
                        pattern: pat.to_string(),
                    });
                    break;
                }
            }
        }

        // 3) URLs externas (offline-first)
        for pat in URL_PATTERNS {
            if trimmed.contains(pat) {
                let is_comment = trimmed.starts_with("//")
                    || trimmed.starts_with("/*")
                    || trimmed.starts_with('*')
                    || trimmed.starts_with("<!--");
                external_urls.push(UrlEntry {
                    line_num,
                    line_content: trimmed.to_string(),
                    is_comment,
                });
                break;
            }
        }
    }

    let loc_status = if loc > LOC_DANGER {
        LocStatus::Danger
    } else if loc > LOC_WARN {
        LocStatus::Warning
    } else {
        LocStatus::Ok
    };

    Ok(FileReport {
        path: rel_str,
        loc,
        loc_status,
        todos,
        external_urls,
    })
}

// --- Ejecución concurrente ---

fn run_audit(src_dir: &Path) -> Vec<FileReport> {
    let files = collect_files(src_dir);
    let results: Arc<Mutex<Vec<FileReport>>> = Arc::new(Mutex::new(Vec::new()));

    // Dividir archivos en chunks para N threads
    let num_threads = thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
        .min(files.len().max(1));

    let chunk_size = (files.len() + num_threads - 1) / num_threads.max(1);
    let file_chunks: Vec<Vec<PathBuf>> = files
        .chunks(chunk_size.max(1))
        .map(|c| c.to_vec())
        .collect();

    let base = Arc::new(src_dir.to_path_buf());

    let handles: Vec<_> = file_chunks.into_iter().map(|chunk| {
        let results = Arc::clone(&results);
        let base = Arc::clone(&base);
        thread::spawn(move || {
            let mut local_results = Vec::new();
            for file_path in &chunk {
                match analyze_file(file_path, &base) {
                    Ok(report) => local_results.push(report),
                    Err(e) => eprintln!("⚠️  Error leyendo {}: {}", file_path.display(), e),
                }
            }
            let mut global = results.lock().unwrap();
            global.extend(local_results);
        })
    }).collect();

    for h in handles {
        let _ = h.join();
    }

    let mut reports = Arc::try_unwrap(results).unwrap().into_inner().unwrap();
    reports.sort_by(|a, b| a.path.cmp(&b.path));
    reports
}

// --- Salida formateada ---

fn print_report(reports: &[FileReport], elapsed_us: u128) {
    println!("🔍 Lumapse — Auditor Concurrente (Rust)");
    println!("==================================================");
    println!();

    // ---- Sección 1: Tamaño de archivos ----
    println!("📏 Guardia de Tamaño de Archivos");
    println!("--------------------------------------------------");

    let mut ok_count = 0usize;
    let mut warn_count = 0usize;
    let mut danger_count = 0usize;

    for r in reports {
        match r.loc_status {
            LocStatus::Ok => ok_count += 1,
            LocStatus::Warning => {
                warn_count += 1;
                println!("  [AVISO]    {:>4} LOC  {}", r.loc, r.path);
            }
            LocStatus::Danger => {
                danger_count += 1;
                println!("  [PELIGRO]  {:>4} LOC  {}", r.loc, r.path);
            }
        }
    }

    println!();
    println!("  OK: {} archivos dentro del límite", ok_count);
    if warn_count > 0 {
        println!("  AVISOS: {} archivos superan {} LOC", warn_count, LOC_WARN);
    }
    if danger_count > 0 {
        println!("  PELIGRO: {} archivos superan {} LOC", danger_count, LOC_DANGER);
    }
    println!();

    // ---- Sección 2: TODOs/FIXMEs ----
    println!("📝 Tareas Técnicas Pendientes (TODO/FIXME)");
    println!("--------------------------------------------------");

    let all_todos: Vec<_> = reports.iter()
        .flat_map(|r| r.todos.iter().map(move |t| (&r.path, t)))
        .collect();

    if all_todos.is_empty() {
        println!("  ✅ No se encontraron tareas técnicas pendientes.");
    } else {
        for (path, todo) in &all_todos {
            println!("  [{}] {}:{} → {}", todo.pattern, path, todo.line_num, todo.line_content);
        }
        println!();
        println!("  ⚠️  {} tarea(s) técnica(s) encontrada(s)", all_todos.len());
    }
    println!();

    // ---- Sección 3: Offline-First ----
    println!("🌐 Auditoría Offline-First");
    println!("--------------------------------------------------");

    let all_urls: Vec<_> = reports.iter()
        .flat_map(|r| r.external_urls.iter().map(move |u| (&r.path, u)))
        .collect();

    if all_urls.is_empty() {
        println!("  ✅ No se encontraron referencias a URLs externas.");
    } else {
        let mut real_problems = 0usize;
        let mut comments = 0usize;

        for (path, url) in &all_urls {
            let tag = if url.is_comment { "(comentario?)" } else { "⚠️  POSIBLE PROBLEMA" };
            if url.is_comment {
                comments += 1;
            } else {
                real_problems += 1;
            }
            println!("  {}:{}: {} {}", path, url.line_num, tag, url.line_content);
        }

        println!();
        println!("  Total: {} referencia(s) externa(s)", all_urls.len());
        println!("   ⚠️  {} posible(s) problema(s) real(es)", real_problems);
        println!("   💬 {} probable(s) comentario(s)", comments);
    }

    println!();
    println!("==================================================");
    println!("⚡ Completado en {:.2}ms ({} archivos escaneados)",
        elapsed_us as f64 / 1000.0,
        reports.len()
    );
    println!("==================================================");
}

fn print_json(reports: &[FileReport], elapsed_us: u128) {
    println!("{{");
    println!("  \"elapsed_ms\": {:.2},", elapsed_us as f64 / 1000.0);
    println!("  \"files_scanned\": {},", reports.len());
    println!("  \"loc\": {{");

    let warnings: Vec<_> = reports.iter()
        .filter(|r| matches!(r.loc_status, LocStatus::Warning | LocStatus::Danger))
        .collect();

    println!("    \"warnings\": [");
    for (i, r) in warnings.iter().enumerate() {
        let status = match r.loc_status {
            LocStatus::Warning => "warning",
            LocStatus::Danger => "danger",
            LocStatus::Ok => "ok",
        };
        let comma = if i < warnings.len() - 1 { "," } else { "" };
        println!("      {{ \"path\": \"{}\", \"loc\": {}, \"status\": \"{}\" }}{}", r.path, r.loc, status, comma);
    }
    println!("    ]");
    println!("  }},");

    let all_todos: Vec<_> = reports.iter()
        .flat_map(|r| r.todos.iter().map(move |t| (&r.path, t)))
        .collect();
    println!("  \"todos\": {},", all_todos.len());

    let all_urls: Vec<_> = reports.iter()
        .flat_map(|r| r.external_urls.iter().map(move |u| (&r.path, u)))
        .collect();
    let real_problems = all_urls.iter().filter(|(_, u)| !u.is_comment).count();
    println!("  \"external_urls\": {{ \"total\": {}, \"problems\": {} }}", all_urls.len(), real_problems);

    println!("}}");
}

mod traceability;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.iter().any(|a| a == "--help" || a == "-h") {
        println!("lumapse-audit — Auditor concurrente de código fuente");
        println!();
        println!("Uso: lumapse-audit [opciones]");
        println!();
        println!("Opciones:");
        println!("  --json         Salida en formato JSON (para integración con otros scripts)");
        println!("  --traceability Ejecuta la auditoría de trazabilidad (RF, HU, ADR)");
        println!("  --code         Ejecuta la auditoría de código (LOC, TODOs, Offline)");
        println!("  --all          Ejecuta todo (por defecto si no se especifica --traceability ni --code)");
        println!("  --help         Muestra esta ayuda");
        println!();
        return;
    }

    let json_mode = args.iter().any(|a| a == "--json");
    let mut run_trace = args.iter().any(|a| a == "--traceability");
    let mut run_code = args.iter().any(|a| a == "--code");
    
    // Si no se pasa ni --traceability ni --code, o se pasa --all, corremos todo
    if args.iter().any(|a| a == "--all") || (!run_trace && !run_code) {
        run_trace = true;
        run_code = true;
    }

    // Detectar la raíz del proyecto buscando hacia arriba el package.json
    let cwd = env::current_dir().expect("No se pudo obtener el directorio actual");
    let src_dir = find_src_dir(&cwd).unwrap_or_else(|| {
        eprintln!("❌ No se encontró la carpeta src/ en el árbol de directorios.");
        eprintln!("   Ejecutá este comando desde la raíz del proyecto Lumapse.");
        std::process::exit(1);
    });

    let project_root = src_dir.parent().unwrap();
    let mut exit_code = 0;

    if run_code {
        let start = Instant::now();
        let reports = run_audit(&src_dir);
        let elapsed = start.elapsed().as_micros();

        if json_mode {
            print_json(&reports, elapsed);
        } else {
            print_report(&reports, elapsed);
        }

        let has_danger = reports.iter().any(|r| matches!(r.loc_status, LocStatus::Danger));
        let has_offline_problem = reports.iter()
            .flat_map(|r| r.external_urls.iter())
            .any(|u| !u.is_comment);

        if has_danger || has_offline_problem {
            exit_code = 1;
        }
    }

    if run_trace {
        if run_code {
            println!(); // Espacio entre reportes
        }
        match traceability::collect_context(project_root) {
            Ok(ctx) => {
                let warnings = traceability::run_traceability_checks(&ctx);
                if warnings > 0 {
                    exit_code = 1;
                }
            }
            Err(e) => {
                eprintln!("❌ Error en auditoría de trazabilidad: {}", e);
                exit_code = 1;
            }
        }
    }

    if exit_code != 0 {
        std::process::exit(exit_code);
    }
}

/// Busca la carpeta src/ subiendo desde el directorio actual
fn find_src_dir(start: &Path) -> Option<PathBuf> {
    let mut current = start.to_path_buf();
    loop {
        let candidate = current.join("src");
        if candidate.is_dir() && current.join("package.json").is_file() {
            return Some(candidate);
        }
        if !current.pop() {
            return None;
        }
    }
}
