#!/usr/bin/env python3
"""Arranca solo el MCP directo instalado; no instala ni consulta dispositivos."""

import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys


REVISION = "351ca8422f7b5b54e80a9c1ce03a222e02415b6b"
FIELDS = {"checkout", "state_dir", "adb", "target"}
BOOTSTRAP = """
import sys
sys.path.insert(0, sys.argv[1])
from artemis.mcp.adb_server import configure_stdio_mode, mcp
configure_stdio_mode()
mcp.run(transport='stdio')
"""


class GuardError(Exception):
    """El mensaje público no incluye valores de la configuración privada."""


def private_path(path, directory=False):
    if path.is_symlink():
        raise GuardError("Configuración/estado privado no válido.")
    info = path.stat()
    kind = stat.S_ISDIR if directory else stat.S_ISREG
    if not kind(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
        raise GuardError("Configuración/estado debe pertenecer al usuario y ser privado.")


def unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise GuardError("Configuración con campos duplicados.")
        value[key] = item
    return value


def load_config(path):
    private_path(path)
    if path.stat().st_size > 8192:
        raise GuardError("Configuración demasiado grande.")
    config = json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique_object)
    if not isinstance(config, dict) or set(config) != FIELDS:
        raise GuardError("Configuración con campos ausentes o no permitidos.")
    if any(not isinstance(value, str) or not value for value in config.values()):
        raise GuardError("Configuración con valores no válidos.")
    target = config["target"]
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", target) or target.startswith("emulator-"):
        raise GuardError("Se requiere un único pin USB explícito, no una dirección de red.")
    for name in ("checkout", "state_dir", "adb"):
        if not Path(config[name]).is_absolute():
            raise GuardError("Las rutas deben ser absolutas.")
    return config


def git_output(checkout, arguments):
    # No hooks, cambios de configuración ni output privado hacia stdio MCP.
    result = subprocess.run(
        ["git", "-C", str(checkout), *arguments],
        stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=10,
        check=False, env={"PATH": os.defpath, "GIT_CONFIG_NOSYSTEM": "1",
                          "GIT_CONFIG_GLOBAL": os.devnull, "GIT_OPTIONAL_LOCKS": "0"},
    )
    if result.returncode:
        raise GuardError("No se pudo comprobar el checkout oficial.")
    return result.stdout.strip()


def prepare(config):
    checkout = Path(config["checkout"])
    state = Path(config["state_dir"])
    adb = Path(config["adb"])
    python = checkout / ".venv" / "bin" / "python"
    if not checkout.is_dir() or checkout.is_symlink():
        raise GuardError("Checkout no válido.")
    if git_output(checkout, ["rev-parse", "HEAD"]) != REVISION:
        raise GuardError("Revisión oficial distinta de la autorizada.")
    if git_output(checkout, ["status", "--porcelain", "--untracked-files=all"]):
        raise GuardError("Checkout con cambios no autorizados.")
    if not (checkout / "artemis/mcp/adb_server.py").is_file() or not (checkout / "uv.lock").is_file():
        raise GuardError("Checkout incompleto.")
    if not python.is_file() or not os.access(python, os.X_OK) or not adb.is_file() or not os.access(adb, os.X_OK):
        raise GuardError("Python aislado/ADB deben existir; no se instalan automáticamente.")
    private_path(state, directory=True)
    # No leer .env ni permitir que la importación herede su configuración.
    dotenv_dirs = [*checkout.parents, checkout, checkout / "artemis", checkout / "artemis/config", checkout / "artemis/mcp", state]
    if any((directory / ".env").exists() for directory in dotenv_dirs):
        raise GuardError("El arranque aislado no admite archivos .env en su búsqueda.")
    children = {}
    for name in ("home", "tmp", "app"):
        path = state / name
        if not path.exists() and not path.is_symlink():
            path.mkdir(mode=0o700)
        private_path(path, directory=True)
        if (path / ".env").exists():
            raise GuardError("Estado aislado con configuración no permitida.")
        children[name] = str(path)
    env = {
        "PATH": str(adb.parent) + os.pathsep + os.defpath,
        "HOME": children["home"], "TMPDIR": children["tmp"],
        "ARTEMIS_APP_DIR": children["app"],
        "ARTEMIS_DEVICE_ID": config["target"], "ADB_DEVICE_SERIAL": config["target"],
        "ADB_HOST": "127.0.0.1", "ADB_PORT": "5037",
        "ADB_SERVER_SOCKET": "tcp:127.0.0.1:5037",
        "ARTEMIS_HELPER_AUTO_INSTALL": "false", "ARTEMIS_HIERARCHY_BACKEND": "helper",
        "ARTEMIS_KEEP_DEVICE_AWAKE": "false", "ARTEMIS_CLOUD_MODE": "0",
        "PYTHONDONTWRITEBYTECODE": "1",
    }
    return checkout, python, env


def main(arguments=None):
    arguments = sys.argv[1:] if arguments is None else arguments
    try:
        if len(arguments) != 2 or arguments[0] != "--config":
            raise GuardError("Uso: artemis-direct-mcp.py --config ARCHIVO_PRIVADO")
        config = load_config(Path(arguments[1]))
        checkout, python, env = prepare(config)
        os.chdir(checkout)
        # Conservar el path del venv (puede ser symlink); -I excluye user site/PYTHONPATH.
        os.execve(str(python), [str(python), "-I", "-B", "-c", BOOTSTRAP, str(checkout)], env)
    except GuardError as error:
        print(str(error), file=sys.stderr)
        return 2
    except (OSError, ValueError, subprocess.SubprocessError):
        print("Arranque rechazado; revise la configuración privada local.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
