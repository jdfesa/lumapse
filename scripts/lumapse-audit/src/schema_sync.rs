use regex::Regex;
use std::collections::BTreeMap;
use std::fs;
use std::path::Path;

type Schema = BTreeMap<String, BTreeMap<String, String>>;

const CONSTRAINT_KEYWORDS: &[&str] = &[
    "PRIMARY",
    "NOT",
    "NULL",
    "REFERENCES",
    "DEFAULT",
    "CHECK",
    "UNIQUE",
    "COLLATE",
    "GENERATED",
    "AS",
    "CONSTRAINT",
    "AUTOINCREMENT",
];

const TABLE_CONSTRAINTS: &[&str] = &[
    "PRIMARY",
    "FOREIGN",
    "UNIQUE",
    "CHECK",
    "CONSTRAINT",
];

pub fn run_schema_check(project_root: &Path) -> Result<usize, String> {
    println!("🔄 Lumapse — Sincronización Schema ↔ Documentación (Rust)");
    println!("==================================================");

    let js_path = project_root.join("src/services/sqlite/connection.js");
    let docs_path = project_root.join("docs/diagramas/database/04-modelo-fisico-ddl.md");

    let js_text = read_text(project_root, &js_path)?;
    let docs_text = read_text(project_root, &docs_path)?;

    let code_schema = parse_schema(&extract_js_sql(&js_text));
    let docs_schema = parse_schema(&extract_markdown_sql(&docs_text));
    let differences = compare_schemas(&code_schema, &docs_schema);

    for difference in &differences {
        println!("{}", difference);
    }

    println!("==================================================");

    if differences.is_empty() {
        println!("✅ Schema y documentación están sincronizados (0 diferencias)");
    } else {
        println!(
            "❌ Schema y documentación NO están sincronizados ({} diferencias)",
            differences.len()
        );
    }

    println!("==================================================");
    Ok(differences.len())
}

fn read_text(project_root: &Path, path: &Path) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| {
        format!(
            "No se pudo leer {}: {}",
            relative_path(project_root, path),
            e
        )
    })
}

fn relative_path(project_root: &Path, path: &Path) -> String {
    path.strip_prefix(project_root)
        .unwrap_or(path)
        .to_string_lossy()
        .to_string()
}

fn extract_js_sql(text: &str) -> String {
    let js_string_re =
        Regex::new(r#"(?s)`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*""#).unwrap();

    js_string_re
        .find_iter(text)
        .map(|m| strip_js_string_quotes(m.as_str()))
        .collect::<Vec<_>>()
        .join("\n")
}

fn strip_js_string_quotes(value: &str) -> String {
    value
        .chars()
        .skip(1)
        .take(value.chars().count().saturating_sub(2))
        .collect()
}

fn extract_markdown_sql(text: &str) -> String {
    let sql_fence_re = Regex::new(r"(?is)```sql\s*(.*?)```").unwrap();
    sql_fence_re
        .captures_iter(text)
        .filter_map(|caps| caps.get(1).map(|m| m.as_str().to_string()))
        .collect::<Vec<_>>()
        .join("\n")
}

fn strip_sql_comments(text: &str) -> String {
    let comments_re = Regex::new(r"--[^\n\r]*").unwrap();
    comments_re.replace_all(text, "").into_owned()
}

fn parse_schema(sql_text: &str) -> Schema {
    let mut schema = Schema::new();
    let sql_text = strip_sql_comments(sql_text);

    parse_create_tables(&sql_text, &mut schema);
    parse_alter_add_columns(&sql_text, &mut schema);

    schema
}

fn parse_create_tables(sql_text: &str, schema: &mut Schema) {
    let create_table_re = Regex::new(
        r"(?i)\bCREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(",
    )
    .unwrap();

    for caps in create_table_re.captures_iter(sql_text) {
        let mat = match caps.get(0) {
            Some(m) => m,
            None => continue,
        };
        let table = match caps.get(1) {
            Some(m) => m.as_str(),
            None => continue,
        };
        let body_start = mat.end() - 1;
        let body_end = match find_matching_parenthesis(sql_text, body_start) {
            Some(index) => index,
            None => continue,
        };

        schema.entry(table.to_string()).or_default();
        let body = &sql_text[body_start + 1..body_end];

        for definition in split_top_level_commas(body) {
            if let Some((column, column_type)) = parse_column_definition(&definition) {
                add_column(schema, table, &column, &column_type);
            }
        }
    }
}

fn parse_alter_add_columns(sql_text: &str, schema: &mut Schema) {
    let alter_add_column_re = Regex::new(
        r"(?im)\bALTER\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)\s+ADD\s+COLUMN\s+(.+?)(?:;|$)",
    )
    .unwrap();

    for caps in alter_add_column_re.captures_iter(sql_text) {
        let table = match caps.get(1) {
            Some(m) => m.as_str(),
            None => continue,
        };
        let definition = match caps.get(2) {
            Some(m) => m.as_str(),
            None => continue,
        };

        if let Some((column, column_type)) = parse_column_definition(definition) {
            add_column(schema, table, &column, &column_type);
        }
    }
}

fn find_matching_parenthesis(text: &str, start_index: usize) -> Option<usize> {
    let mut depth = 0usize;

    for (offset, char) in text[start_index..].char_indices() {
        match char {
            '(' => depth += 1,
            ')' => {
                depth = depth.saturating_sub(1);
                if depth == 0 {
                    return Some(start_index + offset);
                }
            }
            _ => {}
        }
    }

    None
}

fn split_top_level_commas(text: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut start = 0usize;
    let mut depth = 0isize;

    for (index, char) in text.char_indices() {
        match char {
            '(' => depth += 1,
            ')' => depth -= 1,
            ',' if depth == 0 => {
                let part = text[start..index].trim();
                if !part.is_empty() {
                    parts.push(part.to_string());
                }
                start = index + char.len_utf8();
            }
            _ => {}
        }
    }

    let final_part = text[start..].trim();
    if !final_part.is_empty() {
        parts.push(final_part.to_string());
    }

    parts
}

fn split_sql_tokens(text: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut current = String::new();
    let mut depth = 0isize;

    for char in text.trim().trim_end_matches(';').chars() {
        match char {
            '(' => {
                depth += 1;
                current.push(char);
            }
            ')' => {
                depth -= 1;
                current.push(char);
            }
            c if c.is_whitespace() && depth == 0 => {
                if !current.is_empty() {
                    tokens.push(current.clone());
                    current.clear();
                }
            }
            _ => current.push(char),
        }
    }

    if !current.is_empty() {
        tokens.push(current);
    }

    tokens
}

fn clean_identifier(value: &str) -> String {
    value
        .trim()
        .trim_matches(|c| matches!(c, '"' | '`' | '[' | ']'))
        .to_string()
}

fn normalize_type(type_tokens: &[String]) -> String {
    type_tokens
        .iter()
        .map(|token| token.to_uppercase())
        .collect::<Vec<_>>()
        .join(" ")
}

fn parse_column_definition(definition: &str) -> Option<(String, String)> {
    let tokens = split_sql_tokens(definition);
    if tokens.len() < 2 {
        return None;
    }

    let column = clean_identifier(&tokens[0]);
    if TABLE_CONSTRAINTS.contains(&column.to_uppercase().as_str()) {
        return None;
    }

    let mut type_tokens = Vec::new();
    for token in &tokens[1..] {
        if CONSTRAINT_KEYWORDS.contains(&token.to_uppercase().as_str()) {
            break;
        }
        type_tokens.push(token.clone());
    }

    if type_tokens.is_empty() {
        return None;
    }

    Some((column, normalize_type(&type_tokens)))
}

fn add_column(schema: &mut Schema, table: &str, column: &str, column_type: &str) {
    schema
        .entry(table.to_string())
        .or_default()
        .entry(column.to_string())
        .or_insert_with(|| column_type.to_string());
}

fn compare_schemas(code_schema: &Schema, docs_schema: &Schema) -> Vec<String> {
    let mut differences = Vec::new();

    for table in code_schema.keys().filter(|table| !docs_schema.contains_key(*table)) {
        differences.push(format!(
            "❌ Tabla '{}' existe en código pero NO en documentación",
            table
        ));
    }

    for table in docs_schema.keys().filter(|table| !code_schema.contains_key(*table)) {
        differences.push(format!(
            "❌ Tabla '{}' existe en documentación pero NO en código",
            table
        ));
    }

    for (table, code_columns) in code_schema {
        let docs_columns = match docs_schema.get(table) {
            Some(columns) => columns,
            None => continue,
        };

        for column in code_columns
            .keys()
            .filter(|column| !docs_columns.contains_key(*column))
        {
            differences.push(format!(
                "❌ Tabla '{}': columna '{}' existe en código pero NO en documentación",
                table, column
            ));
        }

        for column in docs_columns
            .keys()
            .filter(|column| !code_columns.contains_key(*column))
        {
            differences.push(format!(
                "❌ Tabla '{}': columna '{}' existe en documentación pero NO en código",
                table, column
            ));
        }

        for (column, code_type) in code_columns {
            let docs_type = match docs_columns.get(column) {
                Some(column_type) => column_type,
                None => continue,
            };

            if code_type != docs_type {
                differences.push(format!(
                    "⚠️  Tabla '{}': tipo de '{}' difiere — código: {}, docs: {}",
                    table, column, code_type, docs_type
                ));
            }
        }
    }

    differences
}
