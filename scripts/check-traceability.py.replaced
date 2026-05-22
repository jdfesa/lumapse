#!/usr/bin/env python3
"""
Lumapse — Auditoría de Trazabilidad
Verifica coherencia entre RF, HU, ADR, CHANGELOG y código fuente.
Uso: python3 scripts/check-traceability.py
"""
import glob
import os
import re
import sys


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RF_RE = re.compile(r"\bRF-\d{3}\b")
HU_RE = re.compile(r"\bHU-\d{3}\b")
ADR_RE = re.compile(r"\bADR-\d{3}\b")

JS_BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
JS_LINE_COMMENT_RE = re.compile(r"//[^\n\r]*")
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def project_path(*parts):
    return os.path.join(PROJECT_ROOT, *parts)


def relpath(path):
    return os.path.relpath(path, PROJECT_ROOT).replace(os.sep, "/")


def read_text(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as handle:
            return handle.read()
    except OSError as exc:
        raise RuntimeError(
            "No se pudo leer {0}: {1}".format(relpath(filepath), exc)
        )


def unique_sorted(items):
    return sorted(set(items))


def normalize_estado(estado):
    estado = re.sub(r"\s+", " ", estado.strip())
    if estado.startswith("Obsoleto"):
        return "Obsoleto"
    return estado


def parse_requisitos(filepath):
    """Extrae RF-XXX, estado e hito de requisitos-funcionales.md."""
    rf_data = {}
    text = read_text(filepath)

    for line_number, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if not stripped.startswith("| RF-"):
            continue

        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if len(cells) < 6 or not RF_RE.match(cells[0]):
            continue

        rf_id = cells[0]
        rf_data[rf_id] = {
            "hito": cells[4],
            "estado": normalize_estado(cells[5]),
            "estado_raw": cells[5],
            "line": line_number,
        }

    return rf_data


def parse_historias(filepath):
    """Extrae HU-XXX y sus RF asociados desde las tablas de cada historia."""
    historias = {}
    current_hu = None
    text = read_text(filepath)

    for line in text.splitlines():
        heading = re.match(r"^###\s+(HU-\d{3})\b", line.strip())
        if heading:
            current_hu = heading.group(1)
            historias.setdefault(current_hu, [])
            continue

        if current_hu and "| **RF asociados** |" in line:
            historias[current_hu] = unique_sorted(RF_RE.findall(line))

    return historias


def parse_backlog(filepath):
    """Extrae RF mencionados, pasos y hito activo de BACKLOG.md."""
    text = read_text(filepath)
    steps = []

    for line in text.splitlines():
        stripped = line.strip()
        match = re.match(r"^###\s+(~~)?Paso\s+(\d+):\s*(.+)$", stripped)
        if not match:
            continue

        status = "pendiente"
        if stripped.startswith("### ~~Paso") and "✅" in stripped and "Completado" in stripped:
            status = "completado"

        title = match.group(3)
        title = title.replace("~~", "").strip()
        steps.append({
            "number": match.group(2),
            "title": title,
            "status": status,
        })

    active_hito = None
    active_match = re.search(r"Hito activo:\*\*\s*([0-9]{2})\b", text)
    if active_match:
        active_hito = active_match.group(1)

    return {
        "rf": unique_sorted(RF_RE.findall(text)),
        "steps": steps,
        "active_hito": active_hito,
    }


def parse_changelog(filepath):
    """Extrae RF mencionados en CHANGELOG.md."""
    text = read_text(filepath)
    return unique_sorted(RF_RE.findall(text))


def extract_js_comments(text):
    comments = []
    comments.extend(match.group(0) for match in JS_BLOCK_COMMENT_RE.finditer(text))
    comments.extend(match.group(0) for match in JS_LINE_COMMENT_RE.finditer(text))
    comments.extend(match.group(0) for match in HTML_COMMENT_RE.finditer(text))
    return "\n".join(comments)


def find_rf_in_js_comments(directory):
    """Busca menciones de RF-XXX en comentarios de src/**/*.js."""
    pattern = os.path.join(directory, "**", "*.js")
    files = sorted(glob.glob(pattern, recursive=True))
    rf_by_file = {}
    files_by_rf = {}

    for filepath in files:
        text = read_text(filepath)
        comments = extract_js_comments(text)
        rf_ids = unique_sorted(RF_RE.findall(comments))
        relative = relpath(filepath)
        rf_by_file[relative] = rf_ids

        for rf_id in rf_ids:
            files_by_rf.setdefault(rf_id, set()).add(relative)

    return {
        "files": files,
        "rf_by_file": rf_by_file,
        "files_by_rf": files_by_rf,
    }


def parse_adr_directory(directory):
    """Extrae ADR existentes por nombre de archivo y RF referenciados dentro."""
    files = sorted(glob.glob(os.path.join(directory, "*.md")))
    existing_adrs = set()
    rf_by_adr = {}

    for filepath in files:
        filename = os.path.basename(filepath)
        match = re.match(r"^(ADR-\d{3})(?:-|\.md$)", filename)
        if not match:
            continue

        adr_id = match.group(1)
        existing_adrs.add(adr_id)
        rf_by_adr[adr_id] = unique_sorted(RF_RE.findall(read_text(filepath)))

    return {
        "files": files,
        "existing_adrs": existing_adrs,
        "rf_by_adr": rf_by_adr,
    }


def parse_hitos_directory(directory):
    """Extrae RF mencionados en docs/hitos/*.md."""
    files = sorted(glob.glob(os.path.join(directory, "*.md")))
    rf_by_report = {}

    for filepath in files:
        rf_by_report[relpath(filepath)] = unique_sorted(RF_RE.findall(read_text(filepath)))

    return {
        "files": files,
        "rf_by_report": rf_by_report,
    }


def find_adr_references(docs_dir):
    """Busca menciones de ADR-XXX en documentos Markdown bajo docs/."""
    files = sorted(glob.glob(os.path.join(docs_dir, "**", "*.md"), recursive=True))
    references = {}

    for filepath in files:
        adr_ids = unique_sorted(ADR_RE.findall(read_text(filepath)))
        for adr_id in adr_ids:
            references.setdefault(adr_id, set()).add(relpath(filepath))

    return references


def parse_readme_active_hito(filepath):
    """Detecta el hito activo del README por 🔄 o texto 'En curso'."""
    text = read_text(filepath)

    for line in text.splitlines():
        if "Hito" not in line:
            continue
        if "🔄" not in line and "En curso" not in line:
            continue

        match = re.search(r"Hito\s+([0-9]{2})\b", line)
        if match:
            return match.group(1)

    return None


def check_orphan_rf_in_code(files_by_rf, rf_in_docs):
    """Chequeo 1: RF en código que no existen en requisitos."""
    warnings = []

    for rf_id in sorted(files_by_rf):
        if rf_id in rf_in_docs:
            continue

        for filepath in sorted(files_by_rf[rf_id]):
            warnings.append(
                "⚠️  {0} referenciado en {1} pero NO existe en requisitos-funcionales.md".format(
                    rf_id,
                    filepath,
                )
            )

    return warnings


def check_pending_rf_implemented(rf_data, changelog_rf, files_by_rf):
    """Chequeo 2: RF en CHANGELOG o código que siguen Pendiente en requisitos."""
    warnings = []

    for rf_id in sorted(changelog_rf):
        if rf_data.get(rf_id, {}).get("estado") == "Pendiente":
            warnings.append(
                "⚠️  {0} aparece en CHANGELOG.md pero está marcado como 'Pendiente' en requisitos-funcionales.md".format(
                    rf_id
                )
            )

    for rf_id in sorted(files_by_rf):
        if rf_data.get(rf_id, {}).get("estado") != "Pendiente":
            continue

        for filepath in sorted(files_by_rf[rf_id]):
            warnings.append(
                "⚠️  {0} aparece en {1} pero está marcado como 'Pendiente' en requisitos-funcionales.md".format(
                    rf_id,
                    filepath,
                )
            )

    return warnings


def check_hu_references(historias, rf_in_docs):
    """Chequeo 3: HU que referencian RF inexistentes."""
    warnings = []

    for hu_id in sorted(historias):
        for rf_id in historias[hu_id]:
            if rf_id not in rf_in_docs:
                warnings.append(
                    "⚠️  {0} referencia {1} que no existe en requisitos-funcionales.md".format(
                        hu_id,
                        rf_id,
                    )
                )

    return warnings


def check_implemented_rf_without_hu(rf_data, historias):
    """Chequeo 4: RF Implementados sin HU asociada."""
    warnings = []
    rf_with_hu = set()

    for rf_ids in historias.values():
        rf_with_hu.update(rf_ids)

    for rf_id in sorted(rf_data):
        if rf_data[rf_id]["estado"] != "Implementado":
            continue
        if rf_id in rf_with_hu:
            continue

        warnings.append(
            "⚠️  {0} está Implementado pero no tiene Historia de Usuario asociada".format(
                rf_id
            )
        )

    return warnings


def check_missing_adrs(adr_references, existing_adrs):
    """Chequeo 5: ADR referenciados en docs/ pero inexistentes en docs/adr/."""
    warnings = []

    for adr_id in sorted(adr_references):
        if adr_id in existing_adrs:
            continue

        for filepath in sorted(adr_references[adr_id]):
            warnings.append(
                "⚠️  {0} referenciado en {1} pero no existe en docs/adr/".format(
                    adr_id,
                    filepath,
                )
            )

    return warnings


def check_active_hito(backlog_hito, readme_hito):
    """Chequeo 6: hito activo declarado en BACKLOG.md y README.md."""
    warnings = []

    if backlog_hito is None:
        warnings.append("⚠️  No se pudo detectar el Hito activo en BACKLOG.md")
    if readme_hito is None:
        warnings.append("⚠️  No se pudo detectar el Hito activo en README.md")

    if backlog_hito and readme_hito and backlog_hito != readme_hito:
        warnings.append(
            "⚠️  Hito activo inconsistente: BACKLOG.md dice '{0}', README.md dice '{1}'".format(
                backlog_hito,
                readme_hito,
            )
        )

    return warnings


def print_header(context):
    print("🔍 Lumapse — Auditoría de Trazabilidad")
    print("=" * 50)
    print("📋 Documentos analizados:")
    print(
        "   - docs/producto/requisitos-funcionales.md ({0} RF encontrados)".format(
            len(context["rf_data"])
        )
    )
    print(
        "   - docs/producto/historias-de-usuario.md ({0} HU encontradas)".format(
            len(context["historias"])
        )
    )
    print("   - BACKLOG.md")
    print("   - CHANGELOG.md")
    print(
        "   - src/ ({0} archivos .js escaneados)".format(
            len(context["js"]["files"])
        )
    )
    print(
        "   - docs/adr/ ({0} ADRs encontrados)".format(
            len(context["adr"]["existing_adrs"])
        )
    )
    print(
        "   - docs/hitos/ ({0} informes encontrados)".format(
            len(context["hitos"]["files"])
        )
    )
    print("-" * 50)


def print_check(number, title, warnings):
    print("[{0}/6] {1}...".format(number, title))

    if warnings:
        for warning in warnings:
            print(warning)
        print("   Total: {0} inconsistencia(s)".format(len(warnings)))
    else:
        print("✅ Sin problemas")

    return len(warnings)


def collect_context():
    requisitos_path = project_path("docs", "producto", "requisitos-funcionales.md")
    historias_path = project_path("docs", "producto", "historias-de-usuario.md")
    backlog_path = project_path("BACKLOG.md")
    changelog_path = project_path("CHANGELOG.md")
    readme_path = project_path("README.md")
    src_dir = project_path("src")
    docs_dir = project_path("docs")
    adr_dir = project_path("docs", "adr")
    hitos_dir = project_path("docs", "hitos")

    return {
        "rf_data": parse_requisitos(requisitos_path),
        "historias": parse_historias(historias_path),
        "backlog": parse_backlog(backlog_path),
        "changelog_rf": parse_changelog(changelog_path),
        "readme_hito": parse_readme_active_hito(readme_path),
        "js": find_rf_in_js_comments(src_dir),
        "adr": parse_adr_directory(adr_dir),
        "hitos": parse_hitos_directory(hitos_dir),
        "adr_references": find_adr_references(docs_dir),
    }


def main():
    try:
        context = collect_context()
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 2

    rf_data = context["rf_data"]
    rf_in_docs = set(rf_data.keys())
    files_by_rf = context["js"]["files_by_rf"]

    checks = [
        (
            "RF huérfanos en código",
            check_orphan_rf_in_code(files_by_rf, rf_in_docs),
        ),
        (
            "RF implementados en código pero pendientes en docs",
            check_pending_rf_implemented(
                rf_data,
                context["changelog_rf"],
                files_by_rf,
            ),
        ),
        (
            "HU que referencian RF inexistentes",
            check_hu_references(context["historias"], rf_in_docs),
        ),
        (
            "RF implementados sin HU asociada",
            check_implemented_rf_without_hu(rf_data, context["historias"]),
        ),
        (
            "ADR referenciados pero inexistentes",
            check_missing_adrs(
                context["adr_references"],
                context["adr"]["existing_adrs"],
            ),
        ),
        (
            "Hito activo inconsistente",
            check_active_hito(
                context["backlog"]["active_hito"],
                context["readme_hito"],
            ),
        ),
    ]

    print_header(context)
    total_warnings = 0

    for index, check in enumerate(checks, 1):
        title, warnings = check
        total_warnings += print_check(index, title, warnings)

    print("=" * 50)
    if total_warnings == 0:
        print("✅ Trazabilidad: TODOS LOS CHEQUEOS PASARON (0 advertencias)")
    else:
        print("📊 Resumen: {0} advertencia(s) en 6 chequeos".format(total_warnings))
    print("=" * 50)

    return 0


if __name__ == "__main__":
    sys.exit(main())
