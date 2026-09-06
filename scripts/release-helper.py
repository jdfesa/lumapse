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
ANDROID_BUILD_GRADLE = ANDROID_DIR / "app" / "build.gradle"
GRADLEW = ANDROID_DIR / "gradlew"
ANDROID_RELEASE_DIR = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "release"
EXPECTED_SIGNED_APK = ANDROID_RELEASE_DIR / "app-release.apk"
EXPECTED_UNSIGNED_APK = ANDROID_RELEASE_DIR / "app-release-unsigned.apk"
RELEASES_DIR = PROJECT_ROOT / "releases"
VERSION_RE = re.compile(r"^\d+\.\d+\.\d+$")
UNRELEASED_HEADER_RE = re.compile(r"^## \[Unreleased\][^\n]*$", re.MULTILINE)
VERSION_HEADER_RE = re.compile(r"^## \[[^\]]+\][^\n]*$", re.MULTILINE)
ANDROID_VERSION_NAME_RE = re.compile(r'^(\s*)versionName\s+"([^"]+)"\s*$', re.MULTILINE)
ANDROID_VERSION_CODE_RE = re.compile(r"^(\s*)versionCode\s+(\d+)\s*$", re.MULTILINE)
SIGNING_ENV_VARS = (
    "LUMAPSE_RELEASE_STORE_FILE",
    "LUMAPSE_RELEASE_STORE_PASSWORD",
    "LUMAPSE_RELEASE_KEY_ALIAS",
    "LUMAPSE_RELEASE_KEY_PASSWORD",
)


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
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verifica que package.json, package-lock.json y Android declaren la misma versión.",
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


def android_version_code(version):
    major, minor, patch = [int(part) for part in version.split(".")]
    if any(part > 99 for part in (minor, patch)):
        raise RuntimeError(
            "Android versionCode admite minor/patch entre 0 y 99: {0}".format(version)
        )
    return major * 10000 + minor * 100 + patch


def android_version():
    content = read_text(ANDROID_BUILD_GRADLE)
    name_match = ANDROID_VERSION_NAME_RE.search(content)
    code_match = ANDROID_VERSION_CODE_RE.search(content)

    if not name_match or not code_match:
        raise RuntimeError(
            "No se encontraron versionName/versionCode en {0}".format(
                relative_path(ANDROID_BUILD_GRADLE)
            )
        )

    return name_match.group(2), int(code_match.group(2))


def package_lock_version():
    if not PACKAGE_LOCK.exists():
        return None

    data = load_json(PACKAGE_LOCK)
    root_version = data.get("packages", {}).get("", {}).get("version")
    return root_version or data.get("version")


def verify_version_alignment():
    package_version = current_version()
    lock_version = package_lock_version()
    android_name, android_code = android_version()
    expected_code = android_version_code(package_version)
    mismatches = []

    if lock_version is not None and lock_version != package_version:
        mismatches.append(
            "package-lock.json={0}, esperado {1}".format(lock_version, package_version)
        )
    if android_name != package_version:
        mismatches.append(
            "Android versionName={0}, esperado {1}".format(android_name, package_version)
        )
    if android_code != expected_code:
        mismatches.append(
            "Android versionCode={0}, esperado {1}".format(android_code, expected_code)
        )

    if mismatches:
        raise RuntimeError("Versiones desalineadas: {0}".format("; ".join(mismatches)))

    print(
        "OK Versiones alineadas: {0} / Android versionCode {1}".format(
            package_version, android_code
        )
    )


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
    if not ANDROID_BUILD_GRADLE.exists():
        missing.append(relative_path(ANDROID_BUILD_GRADLE))

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


def update_android_version(new_version):
    content = read_text(ANDROID_BUILD_GRADLE)
    version_code = android_version_code(new_version)

    updated, name_count = ANDROID_VERSION_NAME_RE.subn(
        lambda match: '{0}versionName "{1}"'.format(match.group(1), new_version),
        content,
        count=1,
    )
    updated, code_count = ANDROID_VERSION_CODE_RE.subn(
        lambda match: "{0}versionCode {1}".format(match.group(1), version_code),
        updated,
        count=1,
    )

    if name_count != 1 or code_count != 1:
        raise RuntimeError(
            "No se pudo actualizar versionName/versionCode en {0}".format(
                relative_path(ANDROID_BUILD_GRADLE)
            )
        )

    write_text(ANDROID_BUILD_GRADLE, updated)


def update_changelog(new_version, commits):
    content = read_text(CHANGELOG)

    if "## [{0}]".format(new_version) in content:
        raise RuntimeError("CHANGELOG.md ya contiene una entrada para {0}".format(new_version))

    unreleased_match = UNRELEASED_HEADER_RE.search(content)
    if not unreleased_match:
        raise RuntimeError("CHANGELOG.md no contiene una sección [Unreleased]")

    next_version = VERSION_HEADER_RE.search(content, unreleased_match.end())
    if not next_version:
        raise RuntimeError("CHANGELOG.md no contiene una versión previa después de [Unreleased]")

    unreleased_body = content[unreleased_match.end():next_version.start()].strip("\n")
    if not unreleased_body:
        lines = [
            "### Changed",
            "- Preparación de release v{0} mediante `scripts/release-helper.py`.".format(
                new_version
            ),
        ]
        if commits:
            lines.extend(["", "### Commits recientes"])
            lines.extend("- {0}".format(commit) for commit in commits)
        unreleased_body = "\n".join(lines)

    release_header = "## [{0}] — {1} — Beta".format(
        new_version, date.today().isoformat()
    )
    replacement = (
        "## [Unreleased]\n\n"
        "> Sin cambios todavía.\n\n"
        "{0}\n\n{1}\n\n".format(release_header, unreleased_body)
    )
    new_content = (
        content[:unreleased_match.start()]
        + replacement
        + content[next_version.start():]
    )

    write_text(CHANGELOG, new_content)


def has_release_signing():
    return all(os.getenv(name, "").strip() for name in SIGNING_ENV_VARS)


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
    run_command(
        [
            "./gradlew",
            "--no-daemon",
            "--max-workers=1",
            "-Dorg.gradle.jvmargs=-Xmx768m -Dfile.encoding=UTF-8",
            "-Dkotlin.compiler.execution.strategy=in-process",
            "assembleRelease",
        ],
        cwd=ANDROID_DIR,
    )


def find_release_apk(signed):
    expected_apk = EXPECTED_SIGNED_APK if signed else EXPECTED_UNSIGNED_APK
    if expected_apk.exists():
        return expected_apk

    raise RuntimeError(
        "No se encontró APK {0} en {1}".format(
            "firmada" if signed else "unsigned",
            relative_path(ANDROID_RELEASE_DIR),
        )
    )


def copy_release_apk(new_version, signed):
    source_apk = find_release_apk(signed)
    target_dir = RELEASES_DIR / "v{0}".format(new_version)
    target_dir.mkdir(parents=True, exist_ok=True)
    suffix = "" if signed else "-unsigned"
    target_apk = target_dir / "lumapse-v{0}{1}.apk".format(new_version, suffix)
    shutil.copy2(source_apk, target_apk)
    return source_apk, target_apk


def print_plan(current, new_version, args):
    new_android_code = android_version_code(new_version)
    print("📋 Plan de release")
    print("   - Versión actual: {0}".format(current))
    print("   - Versión nueva:  {0}".format(new_version))
    print("   - Tipo:           {0}".format(args.type))
    print(
        "   - Android:        versionName {0} / versionCode {1}".format(
            new_version, new_android_code
        )
    )
    print(
        "   - Firma release:  {0}".format(
            "configurada" if has_release_signing() else "no configurada"
        )
    )
    print("   - Dry-run:        {0}".format("sí" if args.dry_run else "no"))
    print("   - Build APK:      {0}".format("no" if args.skip_build else "sí"))
    print("")
    print("   Acciones:")
    print("   1. Actualizar package.json")
    if PACKAGE_LOCK.exists():
        print("   2. Actualizar package-lock.json")
    else:
        print("   2. Omitir package-lock.json (no existe)")
    print("   3. Actualizar versionName/versionCode de Android")
    print("   4. Cerrar [Unreleased] en CHANGELOG.md")
    if args.skip_build:
        print("   5. Omitir build/copia de APK por --skip-build")
    else:
        print("   5. Ejecutar clean, npm build, cap sync y Gradle assembleRelease")
        artifact_suffix = "" if has_release_signing() else "-unsigned"
        print(
            "   6. Copiar APK a releases/v{0}/lumapse-v{0}{1}.apk".format(
                new_version, artifact_suffix
            )
        )


def print_header():
    print("🚀 Lumapse — Asistente de Release APK")
    print("==================================================")


def main(argv):
    args = parse_args(argv)

    print_header()

    try:
        if args.check:
            verify_environment(True)
            verify_version_alignment()
            return 0

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
        update_android_version(new_version)

        print("🧾 Actualizando CHANGELOG.md...")
        update_changelog(new_version, commits)

        target_apk = None
        signed = has_release_signing()
        if not args.skip_build:
            run_build_pipeline()
            source_apk, target_apk = copy_release_apk(new_version, signed)
            print("📦 APK copiado desde {0}".format(relative_path(source_apk)))

        print("==================================================")
        print("✅ Release v{0} preparado correctamente".format(new_version))
        if target_apk:
            print("📍 APK: {0}".format(target_apk.resolve()))
            if signed:
                print("🔐 APK compilada con la configuración de firma release.")
                print("   Próximo paso: verificar firma y SHA-256 antes de publicarla.")
            else:
                print("⚠️  APK unsigned: no publicar; configurar el keystore de producción.")
        else:
            print("ℹ️  Build APK omitido. Ejecutar sin --skip-build para generar artefacto Android.")
        print("==================================================")
        return 0
    except RuntimeError as exc:
        print("Error: {0}".format(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
