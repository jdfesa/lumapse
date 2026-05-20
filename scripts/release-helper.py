#!/usr/bin/env python3
"""
Lumapse — Asistente de Release APK
Incrementa versión, prepara CHANGELOG, compila y organiza el APK de release.
Uso: python3 scripts/release-helper.py --type patch|minor|major [--dry-run]
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path


PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PACKAGE_JSON = PROJECT_ROOT / "package.json"
PACKAGE_LOCK = PROJECT_ROOT / "package-lock.json"
CHANGELOG = PROJECT_ROOT / "CHANGELOG.md"
ANDROID_DIR = PROJECT_ROOT / "android"
GRADLEW = ANDROID_DIR / "gradlew"
EXPECTED_APK = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "release" / "app-release-unsigned.apk"
RELEASES_DIR = PROJECT_ROOT / "releases"
VERSION_RE = re.compile(r"^\d+\.\d+\.\d+$")
CHANGELOG_INSERT_MARKER = "---\n\n"


def relative_path(path):
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(
            "No se pudo leer {0}: {1}".format(relative_path(path), exc)
        )


def write_text(path, content):
    try:
        path.write_text(content, encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(
            "No se pudo escribir {0}: {1}".format(relative_path(path), exc)
        )


def load_json(path):
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            "No se pudo leer JSON {0}: {1}".format(relative_path(path), exc)
        )


def write_json(path, data):
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    write_text(path, text)


def parse_args(argv):
    parser = argparse.ArgumentParser(
        description="Prepara una versión release de Lumapse y organiza el APK resultante."
    )
    parser.add_argument(
        "--type",
        choices=("patch", "minor", "major"),
        help="Tipo de incremento semántico.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Muestra el plan sin modificar archivos ni ejecutar build.",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="No pedir confirmación interactiva.",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Solo actualiza versión/changelog; no compila ni copia APK.",
    )
    parser.add_argument(
        "--allow-dirty",
        action="store_true",
        help="Permite ejecutar release real con git status sucio.",
    )
    return parser.parse_args(argv[1:])


def current_version():
    package_data = load_json(PACKAGE_JSON)
    version = package_data.get("version")

    if not version or not VERSION_RE.match(version):
        raise RuntimeError("Versión inválida en package.json: {0}".format(version))

    return version


def bump_version(version, bump_type):
    major, minor, patch = [int(part) for part in version.split(".")]

    if bump_type == "patch":
        patch += 1
    elif bump_type == "minor":
        minor += 1
        patch = 0
    elif bump_type == "major":
        major += 1
        minor = 0
        patch = 0
    else:
        raise RuntimeError("Tipo de incremento inválido: {0}".format(bump_type))

    return "{0}.{1}.{2}".format(major, minor, patch)


def prompt_release_type():
    print("Tipo de incremento:")
    print("  1. patch  (0.4.0 → 0.4.1)")
    print("  2. minor  (0.4.0 → 0.5.0)")
    print("  3. major  (0.4.0 → 1.0.0)")

    while True:
        choice = input("Elegí patch/minor/major [patch]: ").strip().lower()
        if not choice:
            return "patch"
        if choice in ("patch", "minor", "major"):
            return choice
        if choice in ("1", "2", "3"):
            return {"1": "patch", "2": "minor", "3": "major"}[choice]
        print("Opción inválida.")


def ask_confirmation(message):
    answer = input("{0} [y/N]: ".format(message)).strip().lower()
    return answer in ("y", "yes", "s", "si", "sí")


def run_capture(command, cwd=PROJECT_ROOT, allow_failure=False):
    result = subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )

    if result.returncode != 0 and not allow_failure:
        raise RuntimeError(
            "Falló comando '{0}': {1}".format(
                " ".join(command),
                (result.stderr or result.stdout).strip(),
            )
        )

    return result.stdout.strip()


def git_status_short():
    return run_capture(["git", "status", "--short"], allow_failure=True)


def recent_commits(limit=8):
    output = run_capture(
        ["git", "log", "--oneline", "-n", str(limit)],
        allow_failure=True,
    )
    if not output:
        return []

    return output.splitlines()


def verify_environment(skip_build):
    missing = []

    if not PACKAGE_JSON.exists():
        missing.append(relative_path(PACKAGE_JSON))
    if not CHANGELOG.exists():
        missing.append(relative_path(CHANGELOG))

    if not skip_build:
        if not ANDROID_DIR.exists():
            missing.append(relative_path(ANDROID_DIR))
        if not GRADLEW.exists():
            missing.append(relative_path(GRADLEW))
        elif not os.access(GRADLEW, os.X_OK):
            missing.append("{0} ejecutable".format(relative_path(GRADLEW)))
        if shutil.which("java") is None:
            missing.append("java")
        if shutil.which("npm") is None:
            missing.append("npm")
        if shutil.which("npx") is None:
            missing.append("npx")

    if missing:
        raise RuntimeError("Faltan herramientas/archivos requeridos: {0}".format(", ".join(missing)))


def update_package_version(path, new_version):
    data = load_json(path)
    data["version"] = new_version

    if "packages" in data and "" in data["packages"]:
        data["packages"][""]["version"] = new_version

    write_json(path, data)


def changelog_section(new_version, commits):
    today = date.today().isoformat()
    lines = [
        "## [{0}] — {1} — Release".format(new_version, today),
        "",
        "### Changed",
        "- Preparación de release v{0} mediante `scripts/release-helper.py`.".format(new_version),
        "",
    ]

    if commits:
        lines.extend([
            "### Commits recientes",
        ])
        lines.extend("- {0}".format(commit) for commit in commits)
        lines.append("")

    return "\n".join(lines)


def update_changelog(new_version, commits):
    content = read_text(CHANGELOG)
    section = changelog_section(new_version, commits)

    if "## [{0}]".format(new_version) in content:
        raise RuntimeError("CHANGELOG.md ya contiene una entrada para {0}".format(new_version))

    marker_index = content.find(CHANGELOG_INSERT_MARKER)
    if marker_index == -1:
        new_content = section + "\n\n" + content
    else:
        insert_at = marker_index + len(CHANGELOG_INSERT_MARKER)
        new_content = content[:insert_at] + section + "\n" + content[insert_at:]

    write_text(CHANGELOG, new_content)


def run_command(command, cwd=PROJECT_ROOT, input_text=None):
    print("   $ {0}".format(" ".join(command)))
    result = subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        input=input_text,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError("Falló comando: {0}".format(" ".join(command)))


def run_build_pipeline():
    print("🧹 Ejecutando limpieza del proyecto...")
    run_command(["./scripts/clean.sh"], input_text="n\n")

    print("🏗️  Ejecutando build web de producción...")
    run_command(["npm", "run", "build"])

    print("🔌 Sincronizando Capacitor...")
    run_command(["npx", "cap", "sync"])

    print("🤖 Compilando APK release con Gradle...")
    run_command(["./gradlew", "assembleRelease"], cwd=ANDROID_DIR)


def find_release_apk():
    if EXPECTED_APK.exists():
        return EXPECTED_APK

    release_dir = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "release"
    candidates = sorted(release_dir.glob("*.apk")) if release_dir.exists() else []
    if candidates:
        return candidates[0]

    raise RuntimeError(
        "No se encontró APK release en {0}".format(relative_path(release_dir))
    )


def copy_release_apk(new_version):
    source_apk = find_release_apk()
    target_dir = RELEASES_DIR / "v{0}".format(new_version)
    target_dir.mkdir(parents=True, exist_ok=True)
    target_apk = target_dir / "lumapse-v{0}.apk".format(new_version)
    shutil.copy2(source_apk, target_apk)
    return source_apk, target_apk


def print_plan(current, new_version, args):
    print("📋 Plan de release")
    print("   - Versión actual: {0}".format(current))
    print("   - Versión nueva:  {0}".format(new_version))
    print("   - Tipo:           {0}".format(args.type))
    print("   - Dry-run:        {0}".format("sí" if args.dry_run else "no"))
    print("   - Build APK:      {0}".format("no" if args.skip_build else "sí"))
    print("")
    print("   Acciones:")
    print("   1. Actualizar package.json")
    if PACKAGE_LOCK.exists():
        print("   2. Actualizar package-lock.json")
    else:
        print("   2. Omitir package-lock.json (no existe)")
    print("   3. Agregar sección en CHANGELOG.md")
    if args.skip_build:
        print("   4. Omitir build/copia de APK por --skip-build")
    else:
        print("   4. Ejecutar clean, npm build, cap sync y Gradle assembleRelease")
        print("   5. Copiar APK a releases/v{0}/lumapse-v{0}.apk".format(new_version))


def print_header():
    print("🚀 Lumapse — Asistente de Release APK")
    print("==================================================")


def main(argv):
    args = parse_args(argv)

    print_header()

    try:
        if args.type is None:
            if not sys.stdin.isatty():
                raise RuntimeError("Usar --type patch|minor|major en modo no interactivo.")
            args.type = prompt_release_type()

        verify_environment(args.skip_build or args.dry_run)
        current = current_version()
        new_version = bump_version(current, args.type)
        commits = recent_commits()
        print_plan(current, new_version, args)

        dirty_status = git_status_short()
        if dirty_status and not args.allow_dirty and not args.dry_run:
            print("")
            print("⚠️  El worktree tiene cambios sin commit:")
            for line in dirty_status.splitlines():
                print("   {0}".format(line))
            raise RuntimeError("Abortado. Usar --allow-dirty si querés continuar de todos modos.")

        if args.dry_run:
            print("==================================================")
            print("✅ Dry-run completado. No se modificaron archivos ni se ejecutó build.")
            print("==================================================")
            return 0

        if not args.yes and not ask_confirmation("¿Ejecutar release v{0}?".format(new_version)):
            print("Cancelado por el usuario.")
            return 1

        print("📝 Actualizando versiones...")
        update_package_version(PACKAGE_JSON, new_version)
        if PACKAGE_LOCK.exists():
            update_package_version(PACKAGE_LOCK, new_version)

        print("🧾 Actualizando CHANGELOG.md...")
        update_changelog(new_version, commits)

        target_apk = None
        if not args.skip_build:
            run_build_pipeline()
            source_apk, target_apk = copy_release_apk(new_version)
            print("📦 APK copiado desde {0}".format(relative_path(source_apk)))

        print("==================================================")
        print("✅ Release v{0} preparado correctamente".format(new_version))
        if target_apk:
            print("📍 APK: {0}".format(target_apk.resolve()))
            print("🔐 Próximo paso: firmar el APK con el keystore de producción antes de publicarlo.")
        else:
            print("ℹ️  Build APK omitido. Ejecutar sin --skip-build para generar artefacto Android.")
        print("==================================================")
        return 0
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
