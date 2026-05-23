use std::collections::{BTreeMap, BTreeSet, HashMap};

#[derive(Debug, Clone)]
struct Subject {
    id: String,
    name: String,
    parent: Option<String>,
}

#[derive(Debug, Clone)]
struct Note {
    id: String,
    title: String,
    subject_id: Option<String>,
}

pub fn run_hierarchy_check() -> Result<usize, String> {
    let subjects = valid_subjects();
    let notes = valid_notes();

    println!("🏗️  Lumapse — Validación de Jerarquía de Materias (Rust)");
    println!("==================================================");
    println!("📂 Base: :memory: (datos de prueba)");
    println!("--------------------------------------------------");

    let checks = [
        (
            "Subjects huérfanos (parentSubjectId inválido)",
            fetch_subject_orphans(&subjects),
        ),
        (
            "Profundidad > 2 niveles (violación DP-004)",
            fetch_depth_violations(&subjects),
        ),
        ("Ciclos en jerarquía", find_cycles(&subjects)),
        (
            "Notas con subjectId inválido",
            fetch_note_orphans(&subjects, &notes),
        ),
    ];

    let mut total_violations = 0usize;
    for (index, (title, violations)) in checks.iter().enumerate() {
        total_violations += print_check(index + 1, title, violations);
    }

    println!("==================================================");
    if total_violations == 0 {
        println!("✅ Jerarquía válida (0 violaciones)");
    } else {
        println!("❌ Jerarquía inválida ({} violaciones)", total_violations);
    }
    println!("==================================================");

    Ok(total_violations)
}

fn valid_subjects() -> Vec<Subject> {
    vec![
        subject("subj-matematica", "Matemática", None),
        subject("subj-programacion", "Programación", None),
        subject("subj-bd", "Base de Datos", None),
        subject(
            "sec-matematica-parcial-1",
            "Parcial 1",
            Some("subj-matematica"),
        ),
        subject(
            "sec-programacion-tp",
            "Trabajos Prácticos",
            Some("subj-programacion"),
        ),
    ]
}

fn valid_notes() -> Vec<Note> {
    vec![
        note("note-entrada", "Nota en Entrada", None),
        note(
            "note-matematica",
            "Apuntes de Matemática",
            Some("subj-matematica"),
        ),
        note(
            "note-seccion",
            "TP de Programación",
            Some("sec-programacion-tp"),
        ),
    ]
}

fn subject(id: &str, name: &str, parent: Option<&str>) -> Subject {
    Subject {
        id: id.to_string(),
        name: name.to_string(),
        parent: parent.map(|value| value.to_string()),
    }
}

fn note(id: &str, title: &str, subject_id: Option<&str>) -> Note {
    Note {
        id: id.to_string(),
        title: title.to_string(),
        subject_id: subject_id.map(|value| value.to_string()),
    }
}

fn subjects_by_id(subjects: &[Subject]) -> BTreeMap<String, Subject> {
    subjects
        .iter()
        .map(|subject| (subject.id.clone(), subject.clone()))
        .collect()
}

fn fetch_subject_orphans(subjects: &[Subject]) -> Vec<String> {
    let by_id = subjects_by_id(subjects);
    let mut violations = Vec::new();

    for subject in by_id.values() {
        let parent = match &subject.parent {
            Some(parent) => parent,
            None => continue,
        };

        if !by_id.contains_key(parent) {
            violations.push(format!(
                "❌ Subject '{}' ({}) referencia parentSubjectId inexistente: '{}'",
                subject.id, subject.name, parent
            ));
        }
    }

    violations
}

fn fetch_depth_violations(subjects: &[Subject]) -> Vec<String> {
    let by_id = subjects_by_id(subjects);
    let mut violations = Vec::new();

    for subject in by_id.values() {
        let parent_id = match &subject.parent {
            Some(parent_id) => parent_id,
            None => continue,
        };

        let parent = match by_id.get(parent_id) {
            Some(parent) => parent,
            None => continue,
        };

        if let Some(grandparent_id) = &parent.parent {
            violations.push(format!(
                "❌ Subject '{}' ({}) supera 2 niveles: padre '{}' también tiene padre '{}'",
                subject.id, subject.name, parent_id, grandparent_id
            ));
        }
    }

    violations
}

fn find_cycles(subjects: &[Subject]) -> Vec<String> {
    let by_id = subjects_by_id(subjects);
    let mut reported: BTreeSet<Vec<String>> = BTreeSet::new();
    let mut violations = Vec::new();

    for subject in by_id.values() {
        let mut chain = Vec::new();
        let mut seen_indexes: HashMap<String, usize> = HashMap::new();
        let mut current_id = Some(subject.id.clone());

        while let Some(id) = current_id {
            if let Some(start_index) = seen_indexes.get(&id) {
                let cycle_ids = chain[*start_index..].to_vec();
                let normalized = normalize_cycle(&cycle_ids);
                if reported.insert(normalized) {
                    let mut cycle_path = cycle_ids.clone();
                    if let Some(first) = cycle_ids.first() {
                        cycle_path.push(first.clone());
                    }
                    violations.push(format!(
                        "❌ Ciclo detectado: {}",
                        describe_cycle(&cycle_path, &by_id)
                    ));
                }
                break;
            }

            let current = match by_id.get(&id) {
                Some(current) => current,
                None => break,
            };

            seen_indexes.insert(id.clone(), chain.len());
            chain.push(id);
            current_id = current.parent.clone();
        }
    }

    violations
}

fn describe_cycle(cycle_ids: &[String], subjects_by_id: &BTreeMap<String, Subject>) -> String {
    cycle_ids
        .iter()
        .map(|subject_id| {
            subjects_by_id
                .get(subject_id)
                .map(|subject| format!("{} ({})", subject.id, subject.name))
                .unwrap_or_else(|| subject_id.clone())
        })
        .collect::<Vec<_>>()
        .join(" -> ")
}

fn normalize_cycle(cycle_ids: &[String]) -> Vec<String> {
    if cycle_ids.is_empty() {
        return Vec::new();
    }

    let mut candidates = Vec::new();
    for index in 0..cycle_ids.len() {
        let mut candidate = cycle_ids[index..].to_vec();
        candidate.extend_from_slice(&cycle_ids[..index]);
        candidates.push(candidate);
    }

    candidates.into_iter().min().unwrap_or_default()
}

fn fetch_note_orphans(subjects: &[Subject], notes: &[Note]) -> Vec<String> {
    let by_id = subjects_by_id(subjects);
    let mut sorted_notes = notes.to_vec();
    sorted_notes.sort_by(|a, b| a.id.cmp(&b.id));
    let mut violations = Vec::new();

    for note in sorted_notes {
        let subject_id = match &note.subject_id {
            Some(subject_id) => subject_id,
            None => continue,
        };

        if !by_id.contains_key(subject_id) {
            violations.push(format!(
                "❌ Note '{}' ({}) referencia subjectId inexistente: '{}'",
                note.id, note.title, subject_id
            ));
        }
    }

    violations
}

fn print_check(number: usize, title: &str, violations: &[String]) -> usize {
    println!("[{}/4] {}...", number, title);

    if violations.is_empty() {
        println!("✅ Sin problemas");
    } else {
        for violation in violations {
            println!("{}", violation);
        }
    }

    violations.len()
}
