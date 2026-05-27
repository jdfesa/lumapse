#!/usr/bin/env python3
"""
Lumapse -- Auditoria del Toolchain de Scripts
Verifica convenciones minimas de scripts, documentacion y entrypoints npm.

Uso:
  python3 scripts/check-toolchain.py
"""

import json
import os
import re
import stat
import sys
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
README_PATH = SCRIPTS_DIR / "README.md"
PACKAGE_JSON_PATH = PROJECT_ROOT / "package.json"
GITIGNORE_PATH = PROJECT_ROOT / ".gitignore"

SCRIPT_EXTENSIONS = {".py", ".sh", ".js"}
EXPECTED_SHEBANGS = {
    ".py": "#!/usr/bin/env python3",
    ".sh": "#!/usr/bin/env bash",
}


@dataclass
class Finding:
    status: str
    path: str
    detail: str


def relative(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def list_scripts():
    scripts = []
    for path in sorted(SCRIPTS_DIR.iterdir()):
        if path.is_file() and path.suffix in SCRIPT_EXTENSIONS:
            scripts.append(path)
    return scripts


def is_executable(path):
    return bool(path.stat().st_mode & stat.S_IXUSR)


def audit_shebangs(scripts):
    findings = []
    for script in scripts:
        expected = EXPECTED_SHEBANGS.get(script.suffix)
        if not expected:
            continue

        first_line = read_text(script).splitlines()[0:1]
        if not first_line or first_line[0].strip() != expected:
            findings.append(
                Finding("fail", relative(script), f"Shebang esperado: {expected}")
            )
    return findings


def audit_executable_bits(scripts):
    findings = []
    for script in scripts:
        if script.suffix == ".sh" and not is_executable(script):
            findings.append(Finding("warn", relative(script), "Script shell sin bit ejecutable"))
    return findings


def audit_readme_coverage(scripts):
    readme = read_text(README_PATH)
    findings = []

    if not readme:
        return [Finding("fail", relative(README_PATH), "No se pudo leer README de scripts")]

    for script in scripts:
        if script.name not in readme:
            findings.append(
                Finding("warn", relative(script), "No aparece documentado en scripts/README.md")
            )
    return findings


def extract_script_references(command):
    return sorted(set(re.findall(r"scripts/[A-Za-z0-9_.\-/]+", command)))


def audit_package_scripts():
    findings = []
    try:
        package_data = json.loads(read_text(PACKAGE_JSON_PATH))
    except json.JSONDecodeError as exc:
        return [Finding("fail", relative(PACKAGE_JSON_PATH), f"JSON invalido: {exc}")]

    scripts = package_data.get("scripts", {})
    if not scripts:
        return [Finding("fail", relative(PACKAGE_JSON_PATH), "No define scripts npm")]

    for name, command in sorted(scripts.items()):
        for reference in extract_script_references(command):
            path = PROJECT_ROOT / reference
            if not path.exists():
                findings.append(
                    Finding("fail", "package.json", f"npm script '{name}' referencia {reference}, pero no existe")
                )
    return findings


def audit_generated_artifacts_policy():
    gitignore = read_text(GITIGNORE_PATH)
    required_entries = [
        "scripts/lumapse-audit/target/",
        "scripts/lumapse-audit-bin",
        "Lumapse_Entrega_*.zip",
        "lumapse_backup_*.zip",
        "releases/",
    ]
    findings = []

    for entry in required_entries:
        if entry not in gitignore:
            findings.append(Finding("fail", relative(GITIGNORE_PATH), f"Falta entrada: {entry}"))
    return findings


def audit_traceability_wrapper():
    wrapper = SCRIPTS_DIR / "check-traceability.py"
    legacy = SCRIPTS_DIR / "check-traceability.py.replaced"

    if not wrapper.is_file():
        return [Finding("fail", relative(wrapper), "Falta wrapper de compatibilidad")]
    if not legacy.is_file():
        return [Finding("fail", relative(legacy), "Falta script preservado historico")]
    return []


def collect_findings():
    scripts = list_scripts()
    findings = []
    findings.extend(audit_shebangs(scripts))
    findings.extend(audit_executable_bits(scripts))
    findings.extend(audit_readme_coverage(scripts))
    findings.extend(audit_package_scripts())
    findings.extend(audit_generated_artifacts_policy())
    findings.extend(audit_traceability_wrapper())
    return findings


def main():
    findings = collect_findings()
    failures = [item for item in findings if item.status == "fail"]
    warnings = [item for item in findings if item.status == "warn"]

    print("Lumapse -- Auditoria del Toolchain")
    print("=" * 50)

    if not findings:
        print("[OK] Toolchain documentado y consistente.")
        print("=" * 50)
        return 0

    for finding in findings:
        marker = "FAIL" if finding.status == "fail" else "WARN"
        print(f"[{marker}] {finding.path}: {finding.detail}")

    print("=" * 50)
    if failures:
        print(f"Resultado: FAIL ({len(failures)} falla(s), {len(warnings)} advertencia(s))")
        return 1

    print(f"Resultado: OK con advertencias ({len(warnings)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
