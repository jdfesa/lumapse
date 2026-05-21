#!/usr/bin/env python3
"""
Lumapse -- Guia de Refactorizacion por Analisis Estatico

Analiza archivos JS y sugiere como dividirlos en modulos mas pequenos.
Usa heuristicas de analisis estatico (sin IA): detecta funciones,
exports, bloques de responsabilidad, y propone un plan de split.

Uso:
  python3 scripts/split-guide.py src/main.js
  python3 scripts/split-guide.py --all          # Todos los archivos >250 LOC
  python3 scripts/split-guide.py --all --md      # Salida Markdown para BACKLOG
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = PROJECT_ROOT / "src"
LOC_LIMIT = 250


# ============================================================================
# Parsing de estructura JS (heuristico, sin AST real)
# ============================================================================

# Patrones para detectar funciones y exports
RE_EXPORT_FUNC = re.compile(
    r"^export\s+(?:async\s+)?function\s+(\w+)", re.MULTILINE
)
RE_EXPORT_CONST_FUNC = re.compile(
    r"^export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(", re.MULTILINE
)
RE_EXPORT_CLASS = re.compile(r"^export\s+class\s+(\w+)", re.MULTILINE)
RE_NAMED_FUNC = re.compile(
    r"^(?:async\s+)?function\s+(\w+)", re.MULTILINE
)
RE_CONST_FUNC = re.compile(
    r"^(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(", re.MULTILINE
)
RE_EVENT_LISTENER = re.compile(
    r"\.addEventListener\(\s*['\"](\w+)['\"]", re.MULTILINE
)
RE_IMPORT = re.compile(
    r"^import\s+.*from\s+['\"]([^'\"]+)['\"]", re.MULTILINE
)
RE_HTML_TEMPLATE = re.compile(
    r"\.innerHTML\s*=\s*`", re.MULTILINE
)
RE_CLASS_METHOD = re.compile(
    r"^\s{2,4}(?:async\s+)?(\w+)\s*\(", re.MULTILINE
)


def count_loc(content):
    """Cuenta lineas de codigo no vacias."""
    return sum(1 for line in content.splitlines() if line.strip())


def find_function_blocks(content):
    """Detecta bloques de funciones con sus rangos de lineas."""
    lines = content.splitlines()
    blocks = []
    current_func = None
    current_start = None
    brace_depth = 0

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Detectar inicio de funcion
        func_match = (
            re.match(r"^(?:export\s+)?(?:async\s+)?function\s+(\w+)", stripped)
            or re.match(r"^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(", stripped)
            or re.match(r"^(?:export\s+)?class\s+(\w+)", stripped)
        )

        if func_match and brace_depth == 0:
            if current_func is not None:
                blocks.append({
                    "name": current_func,
                    "start": current_start + 1,
                    "end": i,
                    "loc": sum(1 for l in lines[current_start:i] if l.strip()),
                })
            current_func = func_match.group(1)
            current_start = i

        # Trackear profundidad de llaves
        brace_depth += stripped.count("{") - stripped.count("}")

    # Cerrar ultimo bloque
    if current_func is not None:
        blocks.append({
            "name": current_func,
            "start": current_start + 1,
            "end": len(lines),
            "loc": sum(1 for l in lines[current_start:] if l.strip()),
        })

    return blocks


def detect_responsibilities(content, blocks):
    """Agrupa funciones por responsabilidad usando heuristicas."""
    groups = defaultdict(list)

    for block in blocks:
        name = block["name"]
        name_lower = name.lower()

        # Heuristicas de agrupacion por nombre
        if any(kw in name_lower for kw in ("render", "html", "template", "create_element", "innerhtml")):
            groups["Renderizado / Templates"].append(block)
        elif any(kw in name_lower for kw in ("handle", "listener", "onclick", "on_")):
            groups["Manejo de Eventos"].append(block)
        elif any(kw in name_lower for kw in ("init", "setup", "boot", "mount", "start")):
            groups["Inicializacion"].append(block)
        elif any(kw in name_lower for kw in ("save", "load", "fetch", "create", "update", "delete", "get", "set", "find")):
            groups["Logica de Datos / CRUD"].append(block)
        elif any(kw in name_lower for kw in ("drawer", "modal", "sidebar", "menu", "nav", "toggle")):
            groups["Navegacion / UI"].append(block)
        elif any(kw in name_lower for kw in ("theme", "dark", "light", "color")):
            groups["Tema / Apariencia"].append(block)
        elif any(kw in name_lower for kw in ("search", "filter", "sort", "query")):
            groups["Busqueda / Filtrado"].append(block)
        elif any(kw in name_lower for kw in ("export", "import", "download", "upload", "zip")):
            groups["Import / Export"].append(block)
        elif any(kw in name_lower for kw in ("subscribe", "notify", "emit", "dispatch", "observe")):
            groups["Eventos / Suscripciones"].append(block)
        elif any(kw in name_lower for kw in ("format", "escape", "sanitize", "parse", "validate")):
            groups["Utilidades"].append(block)
        else:
            groups["General"].append(block)

    # Detectar template HTML grande
    html_matches = list(RE_HTML_TEMPLATE.finditer(content))
    if html_matches:
        lines = content.splitlines()
        for match in html_matches:
            line_no = content[:match.start()].count("\n") + 1
            # Buscar el cierre del template
            end_line = line_no
            backtick_count = 0
            for j in range(line_no - 1, len(lines)):
                backtick_count += lines[j].count("`")
                if backtick_count >= 2:
                    end_line = j + 1
                    break
            template_loc = end_line - line_no + 1
            if template_loc > 20:
                groups["Templates HTML Inline"].append({
                    "name": "innerHTML template",
                    "start": line_no,
                    "end": end_line,
                    "loc": template_loc,
                })

    return dict(groups)


def suggest_file_names(filepath, groups):
    """Sugiere nombres de archivo destino para cada grupo."""
    base = Path(filepath)
    parent = base.parent
    stem = base.stem

    suggestions = {}
    name_map = {
        "Renderizado / Templates": parent / f"{stem}.templates.js",
        "Manejo de Eventos": parent / f"{stem}.events.js",
        "Navegacion / UI": parent / f"{stem}.ui.js",
        "Logica de Datos / CRUD": parent / f"{stem}.data.js",
        "Tema / Apariencia": parent / f"{stem}.theme.js",
        "Busqueda / Filtrado": parent / f"{stem}.search.js",
        "Import / Export": parent / f"{stem}.io.js",
        "Eventos / Suscripciones": parent / f"{stem}.events.js",
        "Utilidades": parent / f"{stem}.utils.js",
        "Templates HTML Inline": parent / f"{stem}.template.js",
    }

    for group_name, blocks in groups.items():
        total_loc = sum(b["loc"] for b in blocks)
        if group_name == "Inicializacion":
            suggestions[group_name] = {
                "action": "mantener en {}".format(base.name),
                "loc": total_loc,
                "blocks": blocks,
            }
        elif group_name == "General":
            suggestions[group_name] = {
                "action": "revisar manualmente",
                "loc": total_loc,
                "blocks": blocks,
            }
        elif group_name in name_map:
            rel = name_map[group_name]
            try:
                target = str(rel.relative_to(PROJECT_ROOT))
            except ValueError:
                target = str(rel)
            suggestions[group_name] = {
                "action": "mover a {}".format(target),
                "loc": total_loc,
                "blocks": blocks,
            }
        else:
            suggestions[group_name] = {
                "action": "evaluar extraccion",
                "loc": total_loc,
                "blocks": blocks,
            }

    return suggestions


# ============================================================================
# Salida
# ============================================================================

def print_report(filepath, content, suggestions, md_mode=False):
    """Imprime el reporte de split."""
    total_loc = count_loc(content)
    rel = filepath
    try:
        rel = str(Path(filepath).relative_to(PROJECT_ROOT))
    except ValueError:
        pass

    if md_mode:
        print_markdown_report(rel, total_loc, suggestions)
    else:
        print_terminal_report(rel, total_loc, suggestions)


def print_terminal_report(rel, total_loc, suggestions):
    """Reporte para terminal con colores."""
    print()
    print("  Guia de Refactorizacion: {} ({} LOC)".format(rel, total_loc))
    print("=" * 60)

    if not suggestions:
        print("  No se detectaron bloques de funciones para analizar.")
        print("  El archivo puede requerir revision manual.")
        return

    remaining_loc = 0
    extractable_loc = 0

    for group_name, info in sorted(suggestions.items(), key=lambda x: -x[1]["loc"]):
        action = info["action"]
        loc = info["loc"]
        blocks = info["blocks"]

        if "mantener" in action:
            remaining_loc += loc
            marker = " [MANTENER]"
        elif "revisar" in action:
            remaining_loc += loc
            marker = " [REVISAR]"
        else:
            extractable_loc += loc
            marker = " [EXTRAER]"

        print()
        print("  {} ({} LOC){}".format(group_name, loc, marker))
        print("     -> {}".format(action))

        for block in blocks:
            print(
                "        - {}() lineas {}-{} ({} LOC)".format(
                    block["name"], block["start"], block["end"], block["loc"]
                )
            )

    print()
    print("-" * 60)
    estimated = remaining_loc
    print(
        "  Resultado estimado: {} quedaria en ~{} LOC (actual: {})".format(
            rel.split("/")[-1], estimated, total_loc
        )
    )
    print(
        "  LOC extraibles: {} ({:.0f}% del archivo)".format(
            extractable_loc, (extractable_loc / max(total_loc, 1)) * 100
        )
    )
    print()


def print_markdown_report(rel, total_loc, suggestions):
    """Reporte en Markdown para agregar al BACKLOG."""
    print()
    print("### Deuda tecnica: refactorizar `{}`".format(rel))
    print()
    print("- **LOC actual:** {}".format(total_loc))
    print("- **Limite saludable:** {} LOC".format(LOC_LIMIT))
    print("- **Exceso:** {} LOC ({:.0f}% sobre el limite)".format(
        total_loc - LOC_LIMIT,
        ((total_loc - LOC_LIMIT) / LOC_LIMIT) * 100,
    ))
    print()
    print("**Plan de split sugerido:**")
    print()

    for group_name, info in sorted(suggestions.items(), key=lambda x: -x[1]["loc"]):
        action = info["action"]
        loc = info["loc"]
        blocks = info["blocks"]
        func_names = ", ".join("`{}`".format(b["name"]) for b in blocks)
        print("- **{}** ({} LOC): {} -- funciones: {}".format(
            group_name, loc, action, func_names
        ))

    print()


# ============================================================================
# Main
# ============================================================================

def analyze_file(filepath, md_mode=False):
    """Analiza un archivo y genera el reporte."""
    path = Path(filepath)
    if not path.exists():
        # Intentar como ruta relativa desde PROJECT_ROOT
        path = PROJECT_ROOT / filepath
    if not path.exists():
        print("  Error: no se encontro el archivo '{}'".format(filepath))
        return False

    content = path.read_text(encoding="utf-8")
    total_loc = count_loc(content)

    if total_loc <= LOC_LIMIT:
        print(
            "  {} ({} LOC) -- dentro del limite, no necesita split.".format(
                filepath, total_loc
            )
        )
        return True

    blocks = find_function_blocks(content)
    groups = detect_responsibilities(content, blocks)
    suggestions = suggest_file_names(str(path), groups)
    print_report(str(path), content, suggestions, md_mode)
    return True


def analyze_all(md_mode=False):
    """Analiza todos los archivos que superan el limite."""
    if not SRC_DIR.exists():
        print("  Error: no se encontro el directorio src/")
        return

    large_files = []
    for path in sorted(SRC_DIR.rglob("*.js")):
        if not path.is_file():
            continue
        content = path.read_text(encoding="utf-8")
        loc = count_loc(content)
        if loc > LOC_LIMIT:
            large_files.append(path)

    if not large_files:
        print("  Todos los archivos JS estan dentro del limite de {} LOC.".format(LOC_LIMIT))
        return

    print("Lumapse -- Guia de Refactorizacion")
    print("Archivos que superan {} LOC: {}".format(LOC_LIMIT, len(large_files)))

    for path in large_files:
        analyze_file(str(path), md_mode)


def main():
    md_mode = "--md" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if "--all" in sys.argv:
        analyze_all(md_mode)
    elif args:
        for filepath in args:
            analyze_file(filepath, md_mode)
    else:
        print("Lumapse -- Guia de Refactorizacion (split-guide.py)")
        print()
        print("Uso:")
        print("  python3 scripts/split-guide.py <archivo.js>")
        print("  python3 scripts/split-guide.py --all")
        print("  python3 scripts/split-guide.py --all --md")
        print()
        print("Opciones:")
        print("  --all   Analiza todos los archivos que superan {} LOC".format(LOC_LIMIT))
        print("  --md    Genera salida Markdown para agregar al BACKLOG")

    return 0


if __name__ == "__main__":
    sys.exit(main())
