use regex::Regex;
use std::collections::{BTreeSet, HashMap, HashSet};
use std::fs;
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Clone)]
struct Link {
    source: PathBuf,
    line: usize,
    target: String,
    is_image: bool,
    destination: PathBuf,
    anchor: Option<String>,
}

#[derive(Debug)]
struct AnchorWarning {
    link: Link,
    anchor_status: String,
}

pub fn run_doc_links_check(project_root: &Path) -> Result<usize, String> {
    let markdown_files = find_markdown_files(project_root);
    let mut all_links = Vec::new();

    for filepath in &markdown_files {
        let content = read_lossy(filepath)?;
        all_links.extend(extract_links(filepath, &content));
    }

    let decorated_links = decorate_links(all_links);
    let broken_links = check_file_links(&decorated_links);
    let missing_images = check_image_links(&decorated_links);
    let anchor_warnings = check_anchor_links(project_root, &decorated_links)?;

    println!("🔍 Lumapse — Auditoría de Links en Documentación (Rust)");
    println!("==================================================");
    println!("📋 Archivos Markdown escaneados: {}", markdown_files.len());
    println!("📋 Links internos encontrados: {}", decorated_links.len());
    println!("--------------------------------------------------");

    println!("[1/3] Links a archivos inexistentes...");
    if broken_links.is_empty() {
        println!("✅ Sin problemas");
    } else {
        for link in &broken_links {
            print_link_issue(project_root, link, "archivo no encontrado");
        }
        println!("   Total: {} link(s) roto(s)", broken_links.len());
    }

    println!("[2/3] Links a imágenes inexistentes...");
    if missing_images.is_empty() {
        println!("✅ Sin problemas");
    } else {
        for link in &missing_images {
            print_link_issue(project_root, link, "imagen no encontrada");
        }
        println!("   Total: {} imagen(es) faltante(s)", missing_images.len());
    }

    println!("[3/3] Anclas posiblemente inválidas...");
    if anchor_warnings.is_empty() {
        println!("✅ Sin problemas");
    } else {
        for warning in &anchor_warnings {
            print_anchor_warning(project_root, warning);
        }
        println!("   Total: {} ancla(s) a verificar", anchor_warnings.len());
    }

    println!("==================================================");
    println!(
        "📊 Resumen: {} link(s) roto(s), {} imagen(es) faltante(s), {} ancla(s) a verificar",
        broken_links.len(),
        missing_images.len(),
        anchor_warnings.len()
    );
    println!("==================================================");

    if broken_links.is_empty() && missing_images.is_empty() && anchor_warnings.is_empty() {
        println!("✅ Documentación: TODOS LOS LINKS SON VÁLIDOS (0 errores)");
        println!("==================================================");
    }

    Ok(broken_links.len() + missing_images.len())
}

fn find_markdown_files(project_root: &Path) -> Vec<PathBuf> {
    let mut files = BTreeSet::new();
    let docs_dir = project_root.join("docs");

    if docs_dir.exists() {
        collect_markdown_recursive(&docs_dir, &mut files);
    }

    for relative_path in [
        "README.md",
        "CHANGELOG.md",
        "BACKLOG.md",
        "scripts/README.md",
    ] {
        let path = project_root.join(relative_path);
        if path.exists() {
            files.insert(path);
        }
    }

    files.into_iter().collect()
}

fn collect_markdown_recursive(dir: &Path, files: &mut BTreeSet<PathBuf>) {
    let entries = match fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_markdown_recursive(&path, files);
        } else if path.extension().and_then(|e| e.to_str()) == Some("md") {
            files.insert(path);
        }
    }
}

fn read_lossy(path: &Path) -> Result<String, String> {
    let bytes = fs::read(path).map_err(|e| format!("No se pudo leer {}: {}", path.display(), e))?;
    Ok(String::from_utf8_lossy(&bytes).into_owned())
}

fn extract_links(filepath: &Path, content: &str) -> Vec<Link> {
    let mut links = Vec::new();
    let mut in_fence = false;
    let mut fence_marker: Option<&str> = None;

    for (index, line) in content.lines().enumerate() {
        let stripped = line.trim_start();

        if stripped.starts_with("```") || stripped.starts_with("~~~") {
            let marker = &stripped[..3];
            if !in_fence {
                in_fence = true;
                fence_marker = Some(marker);
            } else if fence_marker == Some(marker) {
                in_fence = false;
                fence_marker = None;
            }
            continue;
        }

        if in_fence {
            continue;
        }

        links.extend(extract_line_links(line, index + 1, filepath));
    }

    links
}

fn extract_line_links(line: &str, line_number: usize, filepath: &Path) -> Vec<Link> {
    let mut links = Vec::new();

    for is_image in [true, false] {
        let mut index = 0usize;
        let bytes = line.as_bytes();

        while index < bytes.len() {
            let bracket_index = if is_image {
                if index + 1 >= bytes.len() || bytes[index] != b'!' || bytes[index + 1] != b'[' {
                    index += 1;
                    continue;
                }
                index + 1
            } else {
                if bytes[index] != b'[' || (index > 0 && bytes[index - 1] == b'!') {
                    index += 1;
                    continue;
                }
                index
            };

            let closing_bracket = match find_matching_bracket(line, bracket_index) {
                Some(value) => value,
                None => {
                    index += 1;
                    continue;
                }
            };

            let (raw_target, closing_paren) = match read_link_destination(line, closing_bracket + 1) {
                Some(value) => value,
                None => {
                    index = closing_bracket + 1;
                    continue;
                }
            };

            let target = normalize_target(&raw_target);
            if !is_ignored_target(&target) {
                links.push(Link {
                    source: filepath.to_path_buf(),
                    line: line_number,
                    target,
                    is_image,
                    destination: PathBuf::new(),
                    anchor: None,
                });
            }

            index = closing_paren + 1;
        }
    }

    links
}

fn find_matching_bracket(text: &str, start_index: usize) -> Option<usize> {
    let bytes = text.as_bytes();
    let mut depth = 0isize;
    let mut escaped = false;
    let mut index = start_index;

    while index < bytes.len() {
        let byte = bytes[index];

        if escaped {
            escaped = false;
            index += 1;
            continue;
        }

        if byte == b'\\' {
            escaped = true;
            index += 1;
            continue;
        }

        if byte == b'[' {
            depth += 1;
        } else if byte == b']' {
            depth -= 1;
            if depth == 0 {
                return Some(index);
            }
        }

        index += 1;
    }

    None
}

fn read_link_destination(text: &str, open_paren_index: usize) -> Option<(String, usize)> {
    let bytes = text.as_bytes();
    if open_paren_index >= bytes.len() || bytes[open_paren_index] != b'(' {
        return None;
    }

    let mut index = open_paren_index + 1;
    let mut chars = Vec::new();
    let mut escaped = false;
    let mut paren_depth = 0isize;

    if index < bytes.len() && bytes[index] == b'<' {
        index += 1;
        while index < bytes.len() {
            let byte = bytes[index];
            if byte == b'>' {
                index += 1;
                while index < bytes.len() && bytes[index] != b')' {
                    index += 1;
                }
                if index < bytes.len() {
                    return Some((String::from_utf8_lossy(&chars).trim().to_string(), index));
                }
                return None;
            }
            chars.push(byte);
            index += 1;
        }
        return None;
    }

    while index < bytes.len() {
        let byte = bytes[index];

        if escaped {
            chars.push(byte);
            escaped = false;
            index += 1;
            continue;
        }

        if byte == b'\\' {
            escaped = true;
            index += 1;
            continue;
        }

        if byte == b'(' {
            paren_depth += 1;
        } else if byte == b')' {
            if paren_depth == 0 {
                return Some((String::from_utf8_lossy(&chars).trim().to_string(), index));
            }
            paren_depth -= 1;
        }

        chars.push(byte);
        index += 1;
    }

    None
}

fn normalize_target(raw_target: &str) -> String {
    let target = raw_target.trim();

    if target.is_empty() {
        return String::new();
    }

    if target.starts_with('<') && target.contains('>') {
        if let Some(index) = target.find('>') {
            return target[1..index].trim().to_string();
        }
    }

    if target.starts_with('\'') || target.starts_with('"') {
        let quote = target.chars().next().unwrap();
        if let Some(end_index) = target[1..].find(quote) {
            return target[1..end_index + 1].trim().to_string();
        }
    }

    target.split_whitespace().next().unwrap_or("").to_string()
}

fn is_ignored_target(target: &str) -> bool {
    let normalized = target.trim().to_lowercase();
    normalized.is_empty()
        || normalized.starts_with("http://")
        || normalized.starts_with("https://")
        || normalized.starts_with("mailto:")
        || normalized.starts_with("tel:")
        || normalized.starts_with("//")
        || has_url_scheme(&normalized)
}

fn has_url_scheme(target: &str) -> bool {
    let mut chars = target.chars();
    match chars.next() {
        Some(first) if first.is_ascii_alphabetic() => {}
        _ => return false,
    }

    for char in chars {
        if char == ':' {
            return true;
        }
        if !(char.is_ascii_alphanumeric() || matches!(char, '+' | '.' | '-')) {
            return false;
        }
    }

    false
}

fn decorate_links(all_links: Vec<Link>) -> Vec<Link> {
    all_links
        .into_iter()
        .map(|mut link| {
            let (destination, anchor) = resolve_link(&link.source, &link.target);
            link.destination = destination;
            link.anchor = anchor;
            link
        })
        .collect()
}

fn resolve_link(source_file: &Path, link_target: &str) -> (PathBuf, Option<String>) {
    let mut target = link_target.to_string();
    let mut anchor = None;

    if let Some(index) = target.find('#') {
        anchor = Some(url_decode(&target[index + 1..]));
        target = target[..index].to_string();
    }

    if let Some(index) = target.find('?') {
        target = target[..index].to_string();
    }

    let destination = if target.is_empty() {
        source_file.to_path_buf()
    } else {
        let decoded = url_decode(&target);
        normalize_path(&source_file.parent().unwrap_or_else(|| Path::new("")).join(decoded))
    };

    (destination, anchor)
}

fn normalize_path(path: &Path) -> PathBuf {
    let mut normalized = PathBuf::new();

    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                normalized.pop();
            }
            _ => normalized.push(component.as_os_str()),
        }
    }

    normalized
}

fn url_decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut decoded = Vec::new();
    let mut index = 0usize;

    while index < bytes.len() {
        if bytes[index] == b'%' && index + 2 < bytes.len() {
            if let (Some(high), Some(low)) = (hex_value(bytes[index + 1]), hex_value(bytes[index + 2]))
            {
                decoded.push(high * 16 + low);
                index += 3;
                continue;
            }
        }

        decoded.push(bytes[index]);
        index += 1;
    }

    String::from_utf8_lossy(&decoded).into_owned()
}

fn hex_value(byte: u8) -> Option<u8> {
    match byte {
        b'0'..=b'9' => Some(byte - b'0'),
        b'a'..=b'f' => Some(byte - b'a' + 10),
        b'A'..=b'F' => Some(byte - b'A' + 10),
        _ => None,
    }
}

fn check_file_links(all_links: &[Link]) -> Vec<Link> {
    all_links
        .iter()
        .filter(|link| !link.is_image && !link.destination.exists())
        .cloned()
        .collect()
}

fn check_image_links(all_links: &[Link]) -> Vec<Link> {
    all_links
        .iter()
        .filter(|link| link.is_image && !link.destination.exists())
        .cloned()
        .collect()
}

fn check_anchor_links(project_root: &Path, all_links: &[Link]) -> Result<Vec<AnchorWarning>, String> {
    let mut warnings = Vec::new();
    let mut heading_cache: HashMap<PathBuf, HashSet<String>> = HashMap::new();

    for link in all_links {
        let anchor = match &link.anchor {
            Some(anchor) if !anchor.is_empty() => anchor,
            _ => continue,
        };

        if !link.destination.exists() {
            continue;
        }

        let mut destination = link.destination.clone();
        if destination.is_dir() {
            let readme = destination.join("README.md");
            if readme.exists() {
                destination = readme;
            } else {
                warnings.push(AnchorWarning {
                    link: link.clone(),
                    anchor_status: "ancla no verificada".to_string(),
                });
                continue;
            }
        }

        if destination.extension().and_then(|e| e.to_str()) != Some("md") {
            warnings.push(AnchorWarning {
                link: link.clone(),
                anchor_status: "ancla no verificada".to_string(),
            });
            continue;
        }

        if !heading_cache.contains_key(&destination) {
            heading_cache.insert(destination.clone(), extract_heading_slugs(project_root, &destination)?);
        }

        if !heading_cache[&destination].contains(&anchor.to_lowercase()) {
            warnings.push(AnchorWarning {
                link: link.clone(),
                anchor_status: "ancla no encontrada".to_string(),
            });
        }
    }

    Ok(warnings)
}

fn extract_heading_slugs(project_root: &Path, markdown_file: &Path) -> Result<HashSet<String>, String> {
    let content = read_lossy(markdown_file).map_err(|e| {
        format!(
            "{} ({})",
            e,
            relative_path(project_root, markdown_file)
        )
    })?;
    let heading_re = Regex::new(r"^\s{0,3}(#{1,6})\s+(.+?)\s*$").unwrap();
    let mut slugs = HashSet::new();
    let mut slug_counts: HashMap<String, usize> = HashMap::new();
    let mut in_fence = false;
    let mut fence_marker: Option<&str> = None;

    for line in content.lines() {
        let stripped = line.trim_start();

        if stripped.starts_with("```") || stripped.starts_with("~~~") {
            let marker = &stripped[..3];
            if !in_fence {
                in_fence = true;
                fence_marker = Some(marker);
            } else if fence_marker == Some(marker) {
                in_fence = false;
                fence_marker = None;
            }
            continue;
        }

        if in_fence {
            continue;
        }

        let caps = match heading_re.captures(line) {
            Some(caps) => caps,
            None => continue,
        };
        let slug = slugify_heading(caps.get(2).map(|m| m.as_str()).unwrap_or(""));
        if slug.is_empty() {
            continue;
        }

        let count = slug_counts.entry(slug.clone()).or_insert(0);
        if *count == 0 {
            slugs.insert(slug);
        } else {
            slugs.insert(format!("{}-{}", slug, *count));
        }
        *count += 1;
    }

    Ok(slugs)
}

fn strip_inline_markdown(text: &str) -> String {
    let image_re = Regex::new(r"!\[[^\]]*\]\([^)]+\)").unwrap();
    let link_re = Regex::new(r"\[([^\]]+)\]\([^)]+\)").unwrap();
    let html_re = Regex::new(r"<[^>]+>").unwrap();

    let text = image_re.replace_all(text, "");
    let text = link_re.replace_all(&text, "$1");
    let text = html_re.replace_all(&text, "");

    text.replace('`', "")
}

fn slugify_heading(text: &str) -> String {
    let inline_re = Regex::new(r"\s+#+\s*$").unwrap();
    let stripped = strip_inline_markdown(text);
    let stripped = inline_re.replace_all(&stripped, "");
    let mut chars = String::new();

    for char in stripped.trim().chars().flat_map(|c| c.to_lowercase()) {
        if char.is_alphanumeric() || char == '-' {
            chars.push(char);
        } else if char.is_whitespace() {
            chars.push('-');
        }
    }

    chars.trim_matches('-').to_string()
}

fn print_link_issue(project_root: &Path, link: &Link, message: &str) {
    println!(
        "⚠️  {}:{} → {} — {}",
        relative_path(project_root, &link.source),
        link.line,
        link.target,
        message
    );
}

fn print_anchor_warning(project_root: &Path, warning: &AnchorWarning) {
    let anchor = warning.link.anchor.as_deref().unwrap_or("");
    println!(
        "💬 {}:{} → {} → {} ({})",
        relative_path(project_root, &warning.link.source),
        warning.link.line,
        warning.link.target,
        anchor,
        warning.anchor_status
    );
}

fn relative_path(project_root: &Path, path: &Path) -> String {
    path.strip_prefix(project_root)
        .unwrap_or(path)
        .to_string_lossy()
        .to_string()
}
