#!/usr/bin/env python3
"""
Lumapse -- Dev Doctor
Audita el entorno local necesario para trabajar en Lumapse sin modificar archivos.

Uso:
  python3 scripts/dev-doctor.py
  python3 scripts/dev-doctor.py --strict
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@dataclass
class Check:
    name: str
    status: str
    detail: str
    required: bool = False


def run_command(command, timeout=8):
    try:
        completed = subprocess.run(
            command,
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return None, str(exc)

    output = "\n".join(
        line.strip()
        for line in [completed.stdout.strip(), completed.stderr.strip()]
        if line.strip()
    )
    return completed.returncode, output


def command_version(command, args):
    executable = shutil.which(command)
    if not executable:
        return None

    return_code, output = run_command([command, *args])
    if return_code is None or return_code != 0:
        return executable

    first_line = output.splitlines()[0] if output else executable
    return first_line


def file_exists(path, description, required=False):
    full_path = PROJECT_ROOT / path
    if full_path.exists():
        return Check(description, "ok", str(path), required)
    return Check(description, "fail" if required else "warn", f"No encontrado: {path}", required)


def check_command(command, args, description, required=False):
    version = command_version(command, args)
    if version:
        return Check(description, "ok", version, required)
    return Check(description, "fail" if required else "warn", f"Comando no disponible: {command}", required)


def check_node_modules():
    node_modules = PROJECT_ROOT / "node_modules"
    package_lock = PROJECT_ROOT / "package-lock.json"

    if node_modules.is_dir():
        return Check("Dependencias npm", "ok", "node_modules/ presente")
    if package_lock.is_file():
        return Check("Dependencias npm", "warn", "Falta node_modules/. Ejecutar npm install.")
    return Check("Dependencias npm", "fail", "Falta package-lock.json y node_modules/.", True)


def check_sql_wasm():
    wasm_path = PROJECT_ROOT / "public" / "assets" / "sql-wasm.wasm"
    if wasm_path.is_file():
        return Check("Asset sql.js WASM", "ok", "public/assets/sql-wasm.wasm presente")
    return Check(
        "Asset sql.js WASM",
        "warn",
        "Falta public/assets/sql-wasm.wasm. npm run copy-wasm lo regenera.",
    )


def check_rust_audit():
    audit_bin = PROJECT_ROOT / "scripts" / "lumapse-audit-bin"
    rust_project = PROJECT_ROOT / "scripts" / "lumapse-audit"
    cargo = shutil.which("cargo")

    if audit_bin.is_file() and os.access(audit_bin, os.X_OK):
        rust_sources = list((rust_project / "src").glob("*.rs"))
        rust_sources.extend([rust_project / "Cargo.toml", rust_project / "Cargo.lock"])
        newest_source = max(
            (path.stat().st_mtime for path in rust_sources if path.exists()),
            default=0,
        )
        if newest_source > audit_bin.stat().st_mtime:
            return Check(
                "Auditor Rust",
                "warn",
                "scripts/lumapse-audit-bin existe, pero el codigo Rust es mas nuevo. Recompilar.",
            )
        return Check("Auditor Rust", "ok", "scripts/lumapse-audit-bin ejecutable")
    if cargo:
        return Check(
            "Auditor Rust",
            "warn",
            "Binario no presente; cargo esta disponible para compilarlo.",
        )
    return Check(
        "Auditor Rust",
        "warn",
        "Binario no presente y cargo no disponible; quality usa fallback Python/Shell.",
    )


def check_android_sdk():
    android_dir = PROJECT_ROOT / "android"
    if not android_dir.is_dir():
        return Check("Proyecto Android", "warn", "No existe android/.")

    sdk_root = os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT")
    if sdk_root and Path(sdk_root).exists():
        return Check("Android SDK", "ok", sdk_root)

    local_properties = android_dir / "local.properties"
    if local_properties.is_file():
        return Check("Android SDK", "ok", "android/local.properties presente")

    return Check(
        "Android SDK",
        "warn",
        "No se detecto ANDROID_HOME, ANDROID_SDK_ROOT ni android/local.properties.",
    )


def check_adb_devices():
    if not shutil.which("adb"):
        return Check("ADB", "warn", "adb no disponible en PATH")

    return_code, output = run_command(["adb", "devices"], timeout=6)
    if return_code is None:
        return Check("ADB", "warn", f"No se pudo ejecutar adb devices: {output}")
    if return_code != 0:
        return Check("ADB", "warn", output or "adb devices fallo")

    devices = []
    for line in output.splitlines()[1:]:
        parts = line.split()
        if len(parts) >= 2 and parts[1] == "device":
            devices.append(parts[0])

    if devices:
        return Check("ADB", "ok", f"{len(devices)} dispositivo(s) conectado(s)")
    return Check("ADB", "warn", "adb disponible, sin dispositivos conectados")


def check_icons_venv():
    venv = PROJECT_ROOT / ".venv-icons"
    if venv.is_dir():
        return Check("Entorno iconos", "ok", ".venv-icons presente")
    return Check(
        "Entorno iconos",
        "warn",
        "Falta .venv-icons; solo impacta generate-icons.py/generate-splash.py.",
    )


def collect_checks():
    return [
        file_exists("package.json", "package.json", required=True),
        file_exists("package-lock.json", "package-lock.json", required=True),
        file_exists("src", "Directorio src/", required=True),
        file_exists("scripts", "Directorio scripts/", required=True),
        check_command("git", ["--version"], "Git", required=True),
        check_command("node", ["--version"], "Node.js", required=True),
        check_command("npm", ["--version"], "npm", required=True),
        check_command("python3", ["--version"], "Python 3", required=True),
        check_command("npx", ["--version"], "npx", required=False),
        check_node_modules(),
        check_sql_wasm(),
        check_rust_audit(),
        check_android_sdk(),
        check_command("java", ["-version"], "Java/JDK", required=False),
        check_adb_devices(),
        check_icons_venv(),
    ]


def print_report(checks, strict):
    print("Lumapse -- Dev Doctor")
    print("=" * 50)

    for check in checks:
        if check.status == "ok":
            marker = "OK"
        elif check.status == "warn":
            marker = "WARN"
        else:
            marker = "FAIL"
        print(f"[{marker:<4}] {check.name}: {check.detail}")

    failures = [check for check in checks if check.status == "fail"]
    warnings = [check for check in checks if check.status == "warn"]

    print("=" * 50)
    if failures:
        print(f"Resultado: FAIL ({len(failures)} falla(s), {len(warnings)} advertencia(s))")
        return 1
    if strict and warnings:
        print(f"Resultado: FAIL strict ({len(warnings)} advertencia(s))")
        return 1
    if warnings:
        print(f"Resultado: OK con advertencias ({len(warnings)})")
        return 0

    print("Resultado: OK")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Audita el entorno local de Lumapse.")
    parser.add_argument("--strict", action="store_true", help="Trata advertencias como fallas.")
    parser.add_argument("--json", action="store_true", help="Emite salida JSON para automatizacion.")
    args = parser.parse_args()

    checks = collect_checks()

    if args.json:
        print(json.dumps([check.__dict__ for check in checks], indent=2, ensure_ascii=False))
        failures = [check for check in checks if check.status == "fail"]
        warnings = [check for check in checks if check.status == "warn"]
        return 1 if failures or (args.strict and warnings) else 0

    return print_report(checks, args.strict)


if __name__ == "__main__":
    sys.exit(main())
