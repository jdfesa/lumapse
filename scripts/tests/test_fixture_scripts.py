"""Pruebas de regresión para el fixture sintético reutilizable de Lumapse."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
GENERATOR = PROJECT_ROOT / "scripts" / "generate-test-fixture.py"
DB_TOOL = PROJECT_ROOT / "scripts" / "test-fixture-db.py"
ANDROID_LOADER = PROJECT_ROOT / "scripts" / "load-test-fixture-android.sh"
DEFAULT_SEED = "20260913"
SEED_DATE = "2026-09-13"


def run_json(*command: str | Path) -> dict:
    result = subprocess.run(
        [str(value) for value in command],
        cwd=PROJECT_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class FixtureScriptsTest(unittest.TestCase):
    def test_generator_is_deterministic_and_covers_volume_cases(self) -> None:
        with tempfile.TemporaryDirectory(prefix="lumapse-fixture-test-") as temp_value:
            temp_dir = Path(temp_value)
            first = temp_dir / "first"
            second = temp_dir / "second"

            run_json(sys.executable, GENERATOR, "--output-dir", first, "--seed", DEFAULT_SEED)
            run_json(sys.executable, GENERATOR, "--output-dir", second, "--seed", DEFAULT_SEED)

            first_dataset_path = first / "dataset.json"
            self.assertEqual(sha256(first_dataset_path), sha256(second / "dataset.json"))
            dataset = json.loads(first_dataset_path.read_text(encoding="utf-8"))
            expected = dataset["expected"]

            self.assertEqual(expected["rootSubjects"], 10)
            self.assertEqual(expected["sections"], 39)
            self.assertEqual(expected["normalFeedNotes"], 500)
            self.assertEqual(expected["archivedNotes"], 18)
            self.assertEqual(expected["trashNotes"], 12)
            self.assertEqual(expected["pinnedActiveNotes"], 30)
            self.assertEqual(expected["academicEvents"], 40)

            sections = {
                section["id"]
                for subject in dataset["subjects"]
                for section in subject["sections"]
            }
            occupied_sections = {
                row["subjectId"]
                for row in dataset["notes"]
                if row["subjectId"] in sections
                and not row["archived"]
                and row["deletedDaysBeforeSeed"] is None
            }
            self.assertEqual(len(sections - occupied_sections), 10)

            validation = run_json(sys.executable, DB_TOOL, "validate-dataset", first_dataset_path)
            self.assertEqual(validation["status"], "ok")
            self.assertEqual(validation["counts"]["normalFeedNotes"], 500)

            roundtrip = run_json(
                sys.executable,
                DB_TOOL,
                "self-test",
                first_dataset_path,
                "--seed-date",
                SEED_DATE,
            )
            self.assertEqual(roundtrip["selfTest"], "ok")
            self.assertEqual(roundtrip["integrityCheck"], "ok")
            self.assertEqual(roundtrip["foreignKeyCheck"], "ok")
            self.assertEqual(roundtrip["contentMatch"], "exact")

            loader = subprocess.run(
                [
                    "bash",
                    str(ANDROID_LOADER),
                    "--validate-only",
                    "--dataset",
                    str(first_dataset_path),
                    "--seed-date",
                    SEED_DATE,
                ],
                cwd=PROJECT_ROOT,
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertIn("no se usó ADB", loader.stdout)


if __name__ == "__main__":
    unittest.main()
