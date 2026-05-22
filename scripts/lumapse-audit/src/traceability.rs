use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use regex::Regex;

#[derive(Debug, Clone)]
pub struct RfData {
    pub id: String,
    pub estado: String,
}

pub struct TraceabilityContext {
    pub rf_data: HashMap<String, RfData>,
    pub historias: HashMap<String, HashSet<String>>, // HU -> Set of RFs
    pub backlog_hito: Option<String>,
    pub changelog_rf: HashSet<String>,
    pub readme_hito: Option<String>,
    pub files_by_rf: HashMap<String, HashSet<String>>, // RF -> Set of File Paths
    pub existing_adrs: HashSet<String>,
    pub adr_references: HashMap<String, HashSet<String>>, // ADR -> Set of File Paths
}

pub fn collect_context(project_root: &Path) -> Result<TraceabilityContext, String> {
    let rf_re = Regex::new(r"\bRF-\d{3}\b").unwrap();
    let hu_re = Regex::new(r"\bHU-\d{3}\b").unwrap();
    let adr_re = Regex::new(r"\bADR-\d{3}\b").unwrap();

    let mut ctx = TraceabilityContext {
        rf_data: HashMap::new(),
        historias: HashMap::new(),
        backlog_hito: None,
        changelog_rf: HashSet::new(),
        readme_hito: None,
        files_by_rf: HashMap::new(),
        existing_adrs: HashSet::new(),
        adr_references: HashMap::new(),
    };

    // 1. Requisitos
    let req_path = project_root.join("docs/producto/requisitos-funcionales.md");
    if let Ok(text) = fs::read_to_string(&req_path) {
        for line in text.lines() {
            let line = line.trim();
            if !line.starts_with("| RF-") {
                continue;
            }
            let cells: Vec<&str> = line.trim_matches('|').split('|').map(|s| s.trim()).collect();
            if cells.len() >= 6 && rf_re.is_match(cells[0]) {
                let id = cells[0].to_string();
                let estado = cells[5].replace("  ", " ").trim().to_string();
                let estado = if estado.starts_with("Obsoleto") { "Obsoleto".to_string() } else { estado };
                ctx.rf_data.insert(id.clone(), RfData { id, estado });
            }
        }
    }

    // 2. Historias
    let hu_path = project_root.join("docs/producto/historias-de-usuario.md");
    if let Ok(text) = fs::read_to_string(&hu_path) {
        let mut current_hu: Option<String> = None;
        let hu_heading_re = Regex::new(r"^###\s+(HU-\d{3})\b").unwrap();
        
        for line in text.lines() {
            let line = line.trim();
            if let Some(caps) = hu_heading_re.captures(line) {
                let hu = caps.get(1).unwrap().as_str().to_string();
                ctx.historias.insert(hu.clone(), HashSet::new());
                current_hu = Some(hu);
                continue;
            }
            if let Some(ref hu) = current_hu {
                if line.contains("| **RF asociados** |") {
                    let rfs: HashSet<String> = rf_re.find_iter(line).map(|m| m.as_str().to_string()).collect();
                    ctx.historias.get_mut(hu).unwrap().extend(rfs);
                }
            }
        }
    }

    // 3. Backlog Hito
    let backlog_path = project_root.join("BACKLOG.md");
    if let Ok(text) = fs::read_to_string(&backlog_path) {
        let active_match = Regex::new(r"Hito activo:\*\*\s*([0-9]{2})\b").unwrap();
        if let Some(caps) = active_match.captures(&text) {
            ctx.backlog_hito = Some(caps.get(1).unwrap().as_str().to_string());
        }
    }

    // 4. Changelog
    let changelog_path = project_root.join("CHANGELOG.md");
    if let Ok(text) = fs::read_to_string(&changelog_path) {
        ctx.changelog_rf = rf_re.find_iter(&text).map(|m| m.as_str().to_string()).collect();
    }

    // 5. README Hito
    let readme_path = project_root.join("README.md");
    if let Ok(text) = fs::read_to_string(&readme_path) {
        for line in text.lines() {
            if !line.contains("Hito") { continue; }
            if !line.contains("🔄") && !line.contains("En curso") { continue; }
            if let Some(caps) = Regex::new(r"Hito\s+([0-9]{2})\b").unwrap().captures(line) {
                ctx.readme_hito = Some(caps.get(1).unwrap().as_str().to_string());
                break;
            }
        }
    }

    // 6. SRC JS Comments
    let src_dir = project_root.join("src");
    let mut js_files = Vec::new();
    collect_js_files(&src_dir, &mut js_files);
    let js_block_re = Regex::new(r"(?s)/\*.*?\*/").unwrap();
    let js_line_re = Regex::new(r"//[^\n\r]*").unwrap();
    let html_comment_re = Regex::new(r"(?s)<!--.*?-->").unwrap();

    for path in js_files {
        if let Ok(text) = fs::read_to_string(&path) {
            let rel_path = path.strip_prefix(project_root).unwrap_or(&path).to_string_lossy().to_string();
            let mut all_comments = String::new();
            for m in js_block_re.find_iter(&text) { all_comments.push_str(m.as_str()); all_comments.push('\n'); }
            for m in js_line_re.find_iter(&text) { all_comments.push_str(m.as_str()); all_comments.push('\n'); }
            for m in html_comment_re.find_iter(&text) { all_comments.push_str(m.as_str()); all_comments.push('\n'); }
            
            let rfs: HashSet<String> = rf_re.find_iter(&all_comments).map(|m| m.as_str().to_string()).collect();
            for rf in rfs {
                ctx.files_by_rf.entry(rf).or_insert_with(HashSet::new).insert(rel_path.clone());
            }
        }
    }

    // 7. ADRs y Refs en docs/
    let docs_dir = project_root.join("docs");
    let mut md_files = Vec::new();
    collect_md_files(&docs_dir, &mut md_files);

    for path in md_files {
        let rel_path = path.strip_prefix(project_root).unwrap_or(&path).to_string_lossy().to_string();
        let filename = path.file_name().unwrap_or_default().to_string_lossy();
        
        if let Some(caps) = Regex::new(r"^(ADR-\d{3})(?:-|\.md$)").unwrap().captures(&filename) {
            ctx.existing_adrs.insert(caps.get(1).unwrap().as_str().to_string());
        }

        if let Ok(text) = fs::read_to_string(&path) {
            let adrs: HashSet<String> = adr_re.find_iter(&text).map(|m| m.as_str().to_string()).collect();
            for adr in adrs {
                ctx.adr_references.entry(adr).or_insert_with(HashSet::new).insert(rel_path.clone());
            }
        }
    }

    Ok(ctx)
}

fn collect_js_files(dir: &Path, files: &mut Vec<PathBuf>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() { collect_js_files(&path, files); }
            else if path.extension().and_then(|e| e.to_str()) == Some("js") { files.push(path); }
        }
    }
}

fn collect_md_files(dir: &Path, files: &mut Vec<PathBuf>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() { collect_md_files(&path, files); }
            else if path.extension().and_then(|e| e.to_str()) == Some("md") { files.push(path); }
        }
    }
}

pub fn run_traceability_checks(ctx: &TraceabilityContext) -> usize {
    println!("🔍 Lumapse — Auditoría de Trazabilidad (Rust)");
    println!("==================================================");
    
    let mut total_warnings = 0;
    
    // Check 1: Orphan RFs in code
    total_warnings += print_check(1, "RF huérfanos en código", || {
        let mut warns = Vec::new();
        let mut sorted_rfs: Vec<_> = ctx.files_by_rf.keys().collect();
        sorted_rfs.sort();
        for rf_id in sorted_rfs {
            if !ctx.rf_data.contains_key(rf_id) {
                let mut sorted_files: Vec<_> = ctx.files_by_rf[rf_id].iter().collect();
                sorted_files.sort();
                for f in sorted_files {
                    warns.push(format!("⚠️  {} referenciado en {} pero NO existe en requisitos-funcionales.md", rf_id, f));
                }
            }
        }
        warns
    });

    // Check 2: Pending RFs implemented
    total_warnings += print_check(2, "RF implementados en código pero pendientes en docs", || {
        let mut warns = Vec::new();
        let mut sorted_changelog: Vec<_> = ctx.changelog_rf.iter().collect();
        sorted_changelog.sort();
        for rf_id in sorted_changelog {
            if let Some(rf) = ctx.rf_data.get(rf_id) {
                if rf.estado == "Pendiente" {
                    warns.push(format!("⚠️  {} aparece en CHANGELOG.md pero está marcado como 'Pendiente' en requisitos-funcionales.md", rf_id));
                }
            }
        }
        
        let mut sorted_code: Vec<_> = ctx.files_by_rf.keys().collect();
        sorted_code.sort();
        for rf_id in sorted_code {
            if let Some(rf) = ctx.rf_data.get(rf_id) {
                if rf.estado == "Pendiente" {
                    let mut sorted_files: Vec<_> = ctx.files_by_rf[rf_id].iter().collect();
                    sorted_files.sort();
                    for f in sorted_files {
                        warns.push(format!("⚠️  {} aparece en {} pero está marcado como 'Pendiente' en requisitos-funcionales.md", rf_id, f));
                    }
                }
            }
        }
        warns
    });

    // Check 3: HU ref nonexistent RF
    total_warnings += print_check(3, "HU que referencian RF inexistentes", || {
        let mut warns = Vec::new();
        let mut sorted_hus: Vec<_> = ctx.historias.keys().collect();
        sorted_hus.sort();
        for hu in sorted_hus {
            let mut sorted_rfs: Vec<_> = ctx.historias[hu].iter().collect();
            sorted_rfs.sort();
            for rf_id in sorted_rfs {
                if !ctx.rf_data.contains_key(rf_id) {
                    warns.push(format!("⚠️  {} referencia {} que no existe en requisitos-funcionales.md", hu, rf_id));
                }
            }
        }
        warns
    });

    // Check 4: RF implemented without HU
    total_warnings += print_check(4, "RF implementados sin HU asociada", || {
        let mut warns = Vec::new();
        let mut rf_with_hu = HashSet::new();
        for rfs in ctx.historias.values() {
            rf_with_hu.extend(rfs.clone());
        }
        
        let mut sorted_rfs: Vec<_> = ctx.rf_data.keys().collect();
        sorted_rfs.sort();
        for rf_id in sorted_rfs {
            if ctx.rf_data[rf_id].estado == "Implementado" && !rf_with_hu.contains(rf_id) {
                warns.push(format!("⚠️  {} está Implementado pero no tiene Historia de Usuario asociada", rf_id));
            }
        }
        warns
    });

    // Check 5: Missing ADRs
    total_warnings += print_check(5, "ADR referenciados pero inexistentes", || {
        let mut warns = Vec::new();
        let mut sorted_adrs: Vec<_> = ctx.adr_references.keys().collect();
        sorted_adrs.sort();
        for adr in sorted_adrs {
            if !ctx.existing_adrs.contains(adr) {
                let mut sorted_files: Vec<_> = ctx.adr_references[adr].iter().collect();
                sorted_files.sort();
                for f in sorted_files {
                    warns.push(format!("⚠️  {} referenciado en {} pero no existe en docs/adr/", adr, f));
                }
            }
        }
        warns
    });

    // Check 6: Active Hito mismatch
    total_warnings += print_check(6, "Hito activo inconsistente", || {
        let mut warns = Vec::new();
        if ctx.backlog_hito.is_none() { warns.push("⚠️  No se pudo detectar el Hito activo en BACKLOG.md".to_string()); }
        if ctx.readme_hito.is_none() { warns.push("⚠️  No se pudo detectar el Hito activo en README.md".to_string()); }
        if let (Some(b), Some(r)) = (&ctx.backlog_hito, &ctx.readme_hito) {
            if b != r {
                warns.push(format!("⚠️  Hito activo inconsistente: BACKLOG.md dice '{}', README.md dice '{}'", b, r));
            }
        }
        warns
    });

    println!("==================================================");
    if total_warnings == 0 {
        println!("✅ Trazabilidad: TODOS LOS CHEQUEOS PASARON (0 advertencias)");
    } else {
        println!("📊 Resumen: {} advertencia(s) en 6 chequeos", total_warnings);
    }
    println!("==================================================");

    total_warnings
}

fn print_check<F>(number: usize, title: &str, run: F) -> usize
where
    F: FnOnce() -> Vec<String>,
{
    println!("[{}/6] {}...", number, title);
    let warnings = run();
    if warnings.is_empty() {
        println!("✅ Sin problemas");
    } else {
        for w in &warnings {
            println!("{}", w);
        }
        println!("   Total: {} inconsistencia(s)", warnings.len());
    }
    warnings.len()
}
