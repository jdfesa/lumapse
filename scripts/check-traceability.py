#!/usr/bin/env python3
"""Compatibility entrypoint for the preserved traceability checker."""

from pathlib import Path
import runpy
import sys


LEGACY_SCRIPT = Path(__file__).with_name("check-traceability.py.replaced")


if not LEGACY_SCRIPT.is_file():
    print(
        "No se encontro scripts/check-traceability.py.replaced.",
        file=sys.stderr,
    )
    sys.exit(1)

sys.argv[0] = str(LEGACY_SCRIPT)
runpy.run_path(str(LEGACY_SCRIPT), run_name="__main__")
