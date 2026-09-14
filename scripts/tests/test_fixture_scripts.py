"""Pruebas de regresión para el fixture sintético reutilizable de Lumapse."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
import zipfile
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
            self.assertEqual(sha256(first_dataset_path), "23b0ac9328019fd183ca8d995c1cb61f0f65202bff227ae212ec05f8bd0748d8")
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


    def generate(self, directory: Path, profile: str, seed: str = DEFAULT_SEED) -> Path:
        run_json(sys.executable, GENERATOR, "--profile", profile, "--seed", seed, "--output-dir", directory)
        return directory / "dataset.json"

    def export(self, dataset: Path, output: Path, seed_date: str = SEED_DATE) -> dict:
        return run_json(sys.executable, DB_TOOL, "export-backup", dataset, output, "--seed-date", seed_date)

    def test_f3_profiles_match_the_accepted_counts_and_validate(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            for profile, visible in (("f3-small", 50), ("f3-500", 500)):
                for seed in (DEFAULT_SEED, "0", "1", "42"):
                    with self.subTest(profile=profile, seed=seed):
                        path = self.generate(Path(temp) / profile / seed, profile, seed)
                        data = json.loads(path.read_text())
                        self.assertTrue(all(len(root["sections"]) == 2 for root in data["subjects"]))
                        counts = run_json(sys.executable, DB_TOOL, "validate-dataset", path)["counts"]
                        self.assertEqual(counts["rootSubjects"], 10)
                        self.assertEqual(counts["sections"], 20)
                        self.assertEqual(counts["academicEvents"], 20)
                        self.assertEqual(counts["normalFeedNotes"], visible)
                        self.assertEqual(counts["activeNotes"], visible + 18)
                        self.assertEqual(counts["notes"], visible + 30)
                        self.assertEqual(counts["pinnedActiveNotes"], visible * 6 // 100)
                        roundtrip = run_json(sys.executable, DB_TOOL, "self-test", path, "--seed-date", SEED_DATE)
                        self.assertEqual(roundtrip["contentMatch"], "exact")

    def test_backup_is_byte_deterministic_canonical_and_excludes_trash(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for profile, visible in (("f3-small", 50), ("f3-500", 500)):
                with self.subTest(profile=profile):
                    first = self.generate(root / profile / "a", profile)
                    second = self.generate(root / profile / "b", profile)
                    self.assertEqual(sha256(first), sha256(second))
                    a, b = root / profile / "a.zip", root / profile / "b.zip"
                    summary = self.export(first, a)
                    self.export(second, b)
                    self.assertEqual(sha256(a), sha256(b))
                    self.assertEqual(summary["backupSha256"], sha256(a))
                    self.assertEqual(summary["excludedTrashNotes"], 12)
                    with zipfile.ZipFile(a) as archive:
                        self.assertIsNone(archive.testzip())
                        manifest = json.loads(archive.read("manifest.json"))
                        notes = json.loads(archive.read("data/notes.json"))
                        self.assertEqual(manifest["files"], sorted(archive.namelist()))
                        self.assertEqual(manifest["counts"]["notes"], visible + 18)
                        self.assertEqual(manifest["createdAt"], f"{SEED_DATE}T12:00:00Z")
                        self.assertEqual(sum(not note["archived"] for note in notes), visible)
                        self.assertTrue(all("deletedAt" not in note for note in notes))
                        self.assertTrue(all(type(note["pinned"]) is bool for note in notes))
                        self.assertTrue(all(info.compress_type == zipfile.ZIP_STORED for info in archive.infolist()))

    def test_backup_changes_with_seed_and_date(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            first = self.generate(root / "a", "f3-small")
            second = self.generate(root / "b", "f3-small", "42")
            self.export(first, root / "a.zip")
            self.export(first, root / "date.zip", "2026-09-14")
            self.export(second, root / "seed.zip")
            self.assertEqual(len({sha256(root / name) for name in ("a.zip", "date.zip", "seed.zip")}), 3)

    def test_export_refuses_overwrite_invalid_date_and_invalid_dataset(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            dataset = self.generate(root, "f3-small")
            existing = root / "existing.zip"
            existing.write_bytes(b"preservar")
            for output, seed_date in ((existing, SEED_DATE), (root / "bad-date.zip", "2026-02-30"), (root / "old-date.zip", "1970-01-01")):
                result = subprocess.run([sys.executable, str(DB_TOOL), "export-backup", str(dataset), str(output), "--seed-date", seed_date], capture_output=True, text=True)
                self.assertNotEqual(result.returncode, 0)
            self.assertEqual(existing.read_bytes(), b"preservar")
            self.assertFalse((root / "bad-date.zip").exists())
            self.assertFalse((root / "old-date.zip").exists())
            data = json.loads(dataset.read_text())
            data["notes"][0]["subjectId"] = "missing"
            dataset.write_text(json.dumps(data))
            result = subprocess.run([sys.executable, str(DB_TOOL), "export-backup", str(dataset), str(root / "bad.zip"), "--seed-date", SEED_DATE], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse((root / "bad.zip").exists())


if __name__ == "__main__":
    unittest.main()
