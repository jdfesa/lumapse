#!/usr/bin/env python3
"""
Lumapse -- Dashboard de Salud del Proyecto

Consolida metricas de calidad del proyecto ejecutando los checks existentes
y genera un reporte unificado. Util para:
  - Monitoreo interno del equipo
  - Evidencia de buenas practicas para el informe final
  - Deteccion temprana de deuda tecnica

Uso:
  python3 scripts/health-dashboard.py            # Reporte en terminal
  python3 scripts/health-dashboard.py --save      # Guarda en docs/gestion/
"""

import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = PROJECT_ROOT / "src"
DOCS_DIR = PROJECT_ROOT / "docs"
OUTPUT_FILE = DOCS_DIR / "gestion" / "health-dashboard.md"

LOC_WARN = 250
LOC_DANGER = 400
DEEP_INDENT = 12
MAX_NESTED = 10


def run_cmd(cmd, cwd=None):
    """Ejecuta un comando y retorna stdout."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=cwd or str(PROJECT_ROOT),
            timeout=30,
        )
        return result.stdout.strip(), result.returncode
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return "", 1


def count_loc(path):
    """LOC no vacias."""
    try:
        content = path.read_text(encoding="utf-8")
        return sum(1 for line in content.splitlines() if line.strip())
    except Exception:
        return 0


def count_nested(path, threshold=DEEP_INDENT):
    """Lineas con indentacion profunda."""
    try:
        content = path.read_text(encoding="utf-8")
        count = 0
        for line in content.splitlines():
            if line.strip() and (len(line) - len(line.lstrip(" "))) > threshold:
                count += 1
        return count
    except Exception:
        return 0


# ============================================================================
# Recoleccion de metricas
# ============================================================================

def collect_file_metrics():
    """Metricas por archivo en src/."""
    metrics = []
    if not SRC_DIR.exists():
        return metrics

    for ext in ("*.js", "*.ts", "*.css"):
        for path in sorted(SRC_DIR.rglob(ext)):
            if not path.is_file():
                continue
            loc = count_loc(path)
            nested = count_nested(path) if path.suffix in (".js", ".ts") else 0

            # Determinar estado
            status = "ok"
            issues = []
            if loc > LOC_DANGER:
                status = "peligro"
                issues.append("LOC excesivo ({} > {})".format(loc, LOC_DANGER))
            elif loc > LOC_WARN:
                status = "aviso"
                issues.append("LOC alto ({} > {})".format(loc, LOC_WARN))

            if nested > MAX_NESTED:
                if status == "ok":
                    status = "aviso"
                issues.append("Anidacion profunda ({} lineas)".format(nested))

            try:
                rel = str(path.relative_to(PROJECT_ROOT))
            except ValueError:
                rel = str(path)

            metrics.append({
                "file": rel,
                "loc": loc,
                "nested": nested,
                "status": status,
                "issues": issues,
            })

    return metrics


def collect_todos():
    """Encuentra TODOs y FIXMEs en el codigo."""
    todos = []
    if not SRC_DIR.exists():
        return todos

    patterns = ["TODO", "FIXME", "HACK", "XXX", "BUG"]
    pattern = "|".join(patterns)

    for ext in ("*.js", "*.ts", "*.css", "*.html"):
        for path in sorted(SRC_DIR.rglob(ext)):
            if not path.is_file():
                continue
            try:
                content = path.read_text(encoding="utf-8")
            except Exception:
                continue

            for i, line in enumerate(content.splitlines(), 1):
                for tag in patterns:
                    if tag in line:
                        try:
                            rel = str(path.relative_to(PROJECT_ROOT))
                        except ValueError:
                            rel = str(path)
                        todos.append({
                            "file": rel,
                            "line": i,
                            "tag": tag,
                            "text": line.strip()[:100],
                        })
                        break  # Solo un match por linea

    return todos


def collect_lint_status():
    """Estado de ESLint."""
    _, code = run_cmd(["npm", "run", "lint", "--silent"])
    return code == 0


def collect_git_info():
    """Informacion de git."""
    commit_hash, _ = run_cmd(["git", "rev-parse", "--short", "HEAD"])
    commit_msg, _ = run_cmd(["git", "log", "-1", "--format=%s"])
    branch, _ = run_cmd(["git", "branch", "--show-current"])
    return {
        "hash": commit_hash,
        "message": commit_msg,
        "branch": branch,
    }


def collect_project_stats():
    """Estadisticas generales del proyecto."""
    js_files = list(SRC_DIR.rglob("*.js")) if SRC_DIR.exists() else []
    ts_files = list(SRC_DIR.rglob("*.ts")) if SRC_DIR.exists() else []
    css_files = list(SRC_DIR.rglob("*.css")) if SRC_DIR.exists() else []
    doc_files = list(DOCS_DIR.rglob("*.md")) if DOCS_DIR.exists() else []

    total_js_loc = sum(count_loc(f) for f in js_files + ts_files)
    total_css_loc = sum(count_loc(f) for f in css_files)

    return {
        "js_files": len(js_files) + len(ts_files),
        "css_files": len(css_files),
        "doc_files": len(doc_files),
        "total_js_loc": total_js_loc,
        "total_css_loc": total_css_loc,
    }


# ============================================================================
# Generacion de reporte
# ============================================================================

def status_emoji(status):
    """Retorna indicador visual segun estado."""
    return {"ok": "[OK]", "aviso": "[AVISO]", "peligro": "[PELIGRO]"}.get(
        status, "[?]"
    )


def generate_terminal_report(file_metrics, todos, lint_ok, git_info, stats):
    """Imprime reporte en terminal."""
    print()
    print("Lumapse -- Dashboard de Salud del Proyecto")
    print("=" * 60)
    print("Fecha: {}".format(datetime.now().strftime("%Y-%m-%d %H:%M")))
    print("Commit: {} ({})".format(git_info["hash"], git_info["message"][:50]))
    print("Branch: {}".format(git_info["branch"]))
    print()

    # Estadisticas generales
    print("--- Estadisticas Generales ---")
    print("  Archivos JS/TS: {} ({} LOC)".format(stats["js_files"], stats["total_js_loc"]))
    print("  Archivos CSS: {} ({} LOC)".format(stats["css_files"], stats["total_css_loc"]))
    print("  Documentos MD: {}".format(stats["doc_files"]))
    print("  ESLint: {}".format("OK" if lint_ok else "CON ERRORES"))
    print()

    # Tabla de archivos
    print("--- Salud de Archivos ---")
    problems = [m for m in file_metrics if m["status"] != "ok"]
    healthy = len(file_metrics) - len(problems)

    if problems:
        for m in sorted(problems, key=lambda x: -x["loc"]):
            emoji = status_emoji(m["status"])
            issues_str = "; ".join(m["issues"])
            print("  {} {:>4} LOC  {}  ({})".format(
                emoji, m["loc"], m["file"], issues_str
            ))
    print("  [OK] {} archivos dentro de los limites".format(healthy))
    print()

    # TODOs/FIXMEs
    print("--- TODOs / FIXMEs ---")
    if todos:
        print("  {} items encontrados:".format(len(todos)))
        for t in todos[:10]:
            print("    [{}] {}:{} -- {}".format(t["tag"], t["file"], t["line"], t["text"][:60]))
        if len(todos) > 10:
            print("    ... y {} mas".format(len(todos) - 10))
        print()
        print("  Sugerencia: verificar que estos items esten en BACKLOG.md")
    else:
        print("  No hay TODOs ni FIXMEs pendientes")
    print()

    # Resumen
    total_issues = len(problems) + len(todos) + (0 if lint_ok else 1)
    print("=" * 60)
    if total_issues == 0:
        print("Resultado: SALUDABLE -- no se detectaron problemas")
    else:
        print("Resultado: {} items requieren atencion".format(total_issues))
    print()


def generate_markdown_report(file_metrics, todos, lint_ok, git_info, stats):
    """Genera reporte Markdown."""
    lines = []
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    lines.append("# Lumapse -- Dashboard de Salud")
    lines.append("")
    lines.append("> Generado automaticamente por `scripts/health-dashboard.py`")
    lines.append("> Fecha: {}  |  Commit: `{}` ({})".format(
        now, git_info["hash"], git_info["message"][:50]
    ))
    lines.append("")

    # Estadisticas
    lines.append("## Estadisticas Generales")
    lines.append("")
    lines.append("| Metrica | Valor |")
    lines.append("|---------|-------|")
    lines.append("| Archivos JS/TS | {} ({} LOC) |".format(stats["js_files"], stats["total_js_loc"]))
    lines.append("| Archivos CSS | {} ({} LOC) |".format(stats["css_files"], stats["total_css_loc"]))
    lines.append("| Documentos MD | {} |".format(stats["doc_files"]))
    lines.append("| ESLint | {} |".format("OK" if lint_ok else "Con errores"))
    lines.append("")

    # Tabla de archivos
    lines.append("## Salud de Archivos")
    lines.append("")
    lines.append("| Estado | Archivo | LOC | Anidacion | Problemas |")
    lines.append("|--------|---------|-----|-----------|-----------|")

    for m in sorted(file_metrics, key=lambda x: -x["loc"]):
        emoji = status_emoji(m["status"])
        issues_str = "; ".join(m["issues"]) if m["issues"] else "-"
        lines.append("| {} | `{}` | {} | {} | {} |".format(
            emoji, m["file"], m["loc"], m["nested"], issues_str
        ))
    lines.append("")

    # TODOs
    if todos:
        lines.append("## TODOs / FIXMEs Pendientes")
        lines.append("")
        lines.append("| Tag | Archivo | Linea | Texto |")
        lines.append("|-----|---------|-------|-------|")
        for t in todos:
            text = t["text"].replace("|", "\\|")[:80]
            lines.append("| {} | `{}` | {} | {} |".format(
                t["tag"], t["file"], t["line"], text
            ))
        lines.append("")
        lines.append("> Verificar que estos items esten registrados en BACKLOG.md")
        lines.append("")

    # Resumen
    problems = [m for m in file_metrics if m["status"] != "ok"]
    total_issues = len(problems) + len(todos) + (0 if lint_ok else 1)

    lines.append("## Resumen")
    lines.append("")
    if total_issues == 0:
        lines.append("**SALUDABLE** -- no se detectaron problemas.")
    else:
        lines.append("**{} items requieren atencion.**".format(total_issues))
        if problems:
            lines.append("- {} archivos superan los limites de tamano/complejidad".format(len(problems)))
        if todos:
            lines.append("- {} TODOs/FIXMEs en codigo fuente".format(len(todos)))
        if not lint_ok:
            lines.append("- ESLint reporta errores")
    lines.append("")

    return "\n".join(lines)


# ============================================================================
# Main
# ============================================================================

def main():
    save_mode = "--save" in sys.argv

    # Recolectar metricas
    print("Recolectando metricas...", end="", flush=True)
    file_metrics = collect_file_metrics()
    print(" archivos...", end="", flush=True)
    todos = collect_todos()
    print(" TODOs...", end="", flush=True)
    lint_ok = collect_lint_status()
    print(" lint...", end="", flush=True)
    git_info = collect_git_info()
    stats = collect_project_stats()
    print(" listo!")

    # Generar reporte en terminal siempre
    generate_terminal_report(file_metrics, todos, lint_ok, git_info, stats)

    # Guardar si se pide
    if save_mode:
        md_content = generate_markdown_report(
            file_metrics, todos, lint_ok, git_info, stats
        )
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_FILE.write_text(md_content, encoding="utf-8")
        print("Reporte guardado en: {}".format(
            str(OUTPUT_FILE.relative_to(PROJECT_ROOT))
        ))

    return 0


if __name__ == "__main__":
    sys.exit(main())
