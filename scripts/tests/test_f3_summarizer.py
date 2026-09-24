"""Regression tests for the offline F3 evidence summarizer."""

import csv
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CLI = ROOT / "scripts" / "summarize-f3-results.py"
CRUD_HEADER = (ROOT / "docs/beta-core-validation/crud.template.csv").read_text().strip().split(",")
FRAMES_HEADER = (ROOT / "docs/beta-core-validation/frames.template.csv").read_text().strip().split(",")


def crud_row(profile="f3-small", operation="crear", attempt=1, **changes):
    row = dict.fromkeys(CRUD_HEADER, "")
    row.update(sesion="s1", perfil=profile, operacion=operation, intento=str(attempt),
               calentamiento="false", valida="true", notas_visibles_antes="50",
               notas_visibles_despues="51", total_ms="100", traza_sha256="a" * 64,
               inicio_traza_ms="0", fin_traza_ms="100", resultado_funcional="ok")
    row.update(changes)
    return row


def warmup_row(profile="f3-small", operation="crear", attempt=1, **changes):
    row = crud_row(profile, operation, attempt, calentamiento="true", total_ms="",
                   traza_sha256="", inicio_traza_ms="", fin_traza_ms="")
    row.update(changes)
    return row


def frame_row(run="1", segment=1, **changes):
    row = dict.fromkeys(FRAMES_HEADER, "")
    row.update(sesion="s1", perfil="f3-500", recorrido=run, tramo=str(segment),
               inicio_traza_ms=str((segment - 1) * 1000), duracion_ms="1000",
               frames_completos="60", frames_parciales="0", frames_perdidos="0",
               fps="60", valida="true", traza_sha256="b" * 64,
               fuente_eventos="DevTools frames")
    row.update(changes)
    return row


def session_metadata(source_sha):
    metadata = json.loads((ROOT / "docs/beta-core-validation/sesion.template.json").read_text())
    metadata.update(operador="synthetic-test", fecha="2026-09-24", husoHorario="UTC",
                    shaFuente=source_sha, datasetSha256="c" * 64, zipSha256="d" * 64,
                    archivosEvidenciaYHashes=[{"archivo": "synthetic-trace.json", "sha256": "a" * 64}])
    metadata["apk"].update(versionName="0.5.0", versionCode=500, variante="debug",
                           sha256="e" * 64, certificadoSha256="f" * 64)
    metadata["dispositivo"].update(modelo="synthetic-device", android="10", webview="synthetic-webview")
    return metadata


class F3SummarizerTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="lumapse-f3-summary-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def csv_file(self, name, header, rows):
        path = self.root / name
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=header)
            writer.writeheader()
            writer.writerows(rows)
        return path

    def run_cli(self, crud=None, frames=None, session=None, output=True):
        command = [sys.executable, str(CLI)]
        if crud is not None:
            command += ["--crud", str(crud)]
        if frames is not None:
            command += ["--frames", str(frames)]
        if session is not None:
            command += ["--session", str(session)]
        result_path = self.root / "result.json"
        if output:
            command += ["--json-output", str(result_path)]
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        data = json.loads(result_path.read_text()) if result.returncode == 0 and output else None
        return result, data

    def full_crud(self):
        return [row
                for profile in ("f3-small", "f3-500")
                for operation in ("crear", "editar", "papelera")
                for row in ([warmup_row(profile, operation, attempt)
                             for attempt in range(1, 6)]
                            + [crud_row(profile, operation, attempt)
                               for attempt in range(1, 31)])]

    def full_frames(self):
        return [frame_row(str(run), segment) for run in range(1, 4)
                for segment in range(1, 11)]

    def test_complete_pass_and_deterministic_json(self):
        crud = self.csv_file("crud.csv", CRUD_HEADER, self.full_crud())
        frames = self.csv_file("frames.csv", FRAMES_HEADER, self.full_frames())
        session = self.root / "session.json"
        metadata = json.loads((ROOT / "docs/beta-core-validation/sesion.template.json").read_text())
        session.write_text(json.dumps(metadata))
        first, data = self.run_cli(crud, frames, session)
        self.assertEqual(first.returncode, 0, first.stderr)
        self.assertEqual(data["status"], "PENDING")  # template identity is intentionally blank
        self.assertEqual(len(data["crud"]["groups"]), 6)
        self.assertTrue(all(group["status"] == "PASS" for group in data["crud"]["groups"]))
        self.assertTrue(all(group["warmups"] == group["complete_warmups"] == 5
                            and group["incomplete_warmups"] == 0 for group in data["crud"]["groups"]))
        self.assertTrue(all(group["status"] == "PASS" for group in data["frames"]["groups"]))
        self.assertIn("PENDING", first.stdout)
        first_bytes = (self.root / "result.json").read_bytes()
        second, _ = self.run_cli(crud, frames, session)
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertEqual(first_bytes, (self.root / "result.json").read_bytes())
        self.assertEqual(first.stdout, second.stdout)
        no_session, standalone = self.run_cli(crud, frames)
        self.assertEqual(no_session.returncode, 0, no_session.stderr)
        self.assertEqual(standalone["status"], "PASS")

    def test_five_complete_warmups_required_for_group_and_standalone_pass(self):
        measured = [crud_row(attempt=i) for i in range(1, 31)]
        for count, expected in ((0, "PENDING"), (4, "PENDING"), (5, "PASS")):
            with self.subTest(complete_warmups=count):
                rows = [warmup_row(attempt=i) for i in range(1, count + 1)] + measured
                result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
                self.assertEqual(result.returncode, 0, result.stderr)
                group = data["crud"]["groups"][0]
                self.assertEqual(group["status"], expected)
                self.assertEqual(group["warmups"], count)
                self.assertEqual(group["complete_warmups"], count)
                self.assertEqual(group["incomplete_warmups"], 0)
                self.assertEqual(group["valid"], 30)
                self.assertEqual(group["median_ms"], 100)

        all_rows = self.full_crud()
        all_rows.remove(next(row for row in all_rows if row["perfil"] == "f3-small"
                             and row["operacion"] == "crear" and row["calentamiento"] == "true"))
        result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, all_rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["status"], "PENDING")
        self.assertEqual(data["crud"]["groups"][0]["complete_warmups"], 4)

    def test_incomplete_warmup_rows_never_count_as_complete(self):
        measured = [crud_row(attempt=i) for i in range(1, 31)]
        incomplete = (
            {"valida": "false", "motivo": "preparación fallida"},
            {"resultado_funcional": ""},
            {"notas_visibles_antes": ""},
            {"notas_visibles_despues": ""},
        )
        for change in incomplete:
            with self.subTest(incomplete=change):
                rows = [warmup_row(attempt=i) for i in range(1, 5)]
                rows.append(warmup_row(attempt=5, **change))
                result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows + measured))
                self.assertEqual(result.returncode, 0, result.stderr)
                group = data["crud"]["groups"][0]
                self.assertEqual(group["status"], "PENDING")
                self.assertEqual(group["warmups"], 5)
                self.assertEqual(group["complete_warmups"], 4)
                self.assertEqual(group["incomplete_warmups"], 1)
                self.assertEqual(group["valid"], 30)

        rows.insert(0, warmup_row(attempt=6))
        result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows + measured))
        self.assertEqual(result.returncode, 0, result.stderr)
        group = data["crud"]["groups"][0]
        self.assertEqual(group["status"], "PASS")
        self.assertEqual((group["warmups"], group["complete_warmups"], group["incomplete_warmups"]), (6, 5, 1))

    def test_outlier_fails_despite_favorable_p95_and_preserves_it(self):
        rows = [warmup_row(attempt=i) for i in range(1, 6)]
        rows += [crud_row(attempt=i, total_ms=str(i)) for i in range(1, 30)]
        rows.append(crud_row(attempt=30, total_ms="201"))
        result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        group = data["crud"]["groups"][0]
        self.assertEqual(group["status"], "FAIL")
        self.assertEqual(group["p95_ms"], 29)
        self.assertEqual(group["max_ms"], 201)
        self.assertEqual(group["over_200_ms"], 1)

    def test_missing_measured_visible_note_counts_prevent_pass(self):
        for missing in (("notas_visibles_antes",), ("notas_visibles_despues",),
                        ("notas_visibles_antes", "notas_visibles_despues")):
            with self.subTest(missing=missing):
                rows = self.full_crud()
                measured = next(row for row in rows if row["calentamiento"] == "false")
                measured.update(dict.fromkeys(missing, ""))
                result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(data["status"], "PENDING")
                group = data["crud"]["groups"][0]
                self.assertEqual(group["status"], "PENDING")
                self.assertEqual(group["missing_visible_note_counts"], 1)
                self.assertEqual(group["valid"], 30)
                self.assertEqual(group["median_ms"], 100)
                self.assertIn("visible_note_counts_missing=1", result.stdout)
                self.assertTrue(all(group["status"] == "PASS"
                                    for group in data["crud"]["groups"][1:]))

    def test_all_measured_visible_note_counts_missing_remain_pending(self):
        rows = self.full_crud()
        for row in rows:
            if row["calentamiento"] == "false":
                row.update(notas_visibles_antes="", notas_visibles_despues="")
        path = self.csv_file("crud.csv", CRUD_HEADER, rows)
        original = path.read_bytes()
        result, data = self.run_cli(path)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["status"], "PENDING")
        for group in data["crud"]["groups"]:
            self.assertEqual(group["status"], "PENDING")
            self.assertEqual(group["complete_warmups"], 5)
            self.assertEqual(group["missing_visible_note_counts"], 30)
            self.assertEqual(group["valid"], 30)
            self.assertEqual(group["p95_ms"], 100)
        self.assertEqual(path.read_bytes(), original)

    def test_missing_counts_do_not_hide_latency_or_functional_failures(self):
        for failure in ({"total_ms": "201"}, {"resultado_funcional": "fallo"},
                        {"resultado_funcional": "fallo", "valida": "false", "motivo": "fallo funcional"}):
            with self.subTest(failure=failure):
                rows = self.full_crud()
                measured = next(row for row in rows if row["calentamiento"] == "false")
                measured.update(notas_visibles_antes="", notas_visibles_despues="", **failure)
                result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(data["status"], "FAIL")
                group = data["crud"]["groups"][0]
                self.assertEqual(group["status"], "FAIL")
                if "total_ms" in failure:
                    self.assertEqual(group["over_200_ms"], 1)
                    self.assertEqual(group["max_ms"], 201)
                else:
                    self.assertEqual(group["functional"]["failed"], 1)

    def test_zero_counts_are_present_and_invalid_rows_do_not_block_pass(self):
        rows = self.full_crud()
        measured = next(row for row in rows if row["calentamiento"] == "false")
        measured.update(notas_visibles_antes="0", notas_visibles_despues="0")
        rows.append(crud_row(attempt=31, valida="false", motivo="traza ambigua",
                             notas_visibles_antes="", notas_visibles_despues=""))
        result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["status"], "PASS")
        group = data["crud"]["groups"][0]
        self.assertEqual(group["missing_visible_note_counts"], 0)
        self.assertEqual(group["valid"], 30)
        self.assertEqual(group["invalid"], 1)

    def test_incomplete_warmup_invalid_and_missing_decompositions(self):
        rows = [crud_row(attempt=i) for i in range(1, 29)]
        rows += [crud_row(attempt=29, valida="false", motivo="traza ambigua"),
                 crud_row(attempt=1, calentamiento="true")]
        result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        group = data["crud"]["groups"][0]
        self.assertEqual(group["status"], "PENDING")
        self.assertEqual(group["attempts"], 30)
        self.assertEqual(group["valid"], 28)
        self.assertEqual(group["invalid"], 1)
        self.assertEqual(group["warmups"], 1)
        self.assertEqual(group["complete_warmups"], 1)
        self.assertEqual(group["incomplete_warmups"], 0)
        self.assertEqual(group["persistencia_ms"]["missing"], 28)
        self.assertEqual(group["refresco_ms"]["missing"], 28)

    def test_functional_blank_or_failure_prevents_pass(self):
        rows = [warmup_row(attempt=i) for i in range(1, 6)]
        rows += [crud_row(attempt=i) for i in range(1, 31)]
        rows[5]["resultado_funcional"] = ""
        result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["crud"]["groups"][0]["status"], "PENDING")
        self.assertEqual(data["crud"]["groups"][0]["functional"]["missing"], 1)
        rows[5]["resultado_funcional"] = "fallo"
        result, data = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["crud"]["groups"][0]["status"], "FAIL")

    def test_fps_recalculation_tolerance_and_sub_55_failure(self):
        rows = self.full_frames()
        rows[0]["fps"] = "60.04"
        result, data = self.run_cli(frames=self.csv_file("frames.csv", FRAMES_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["frames"]["groups"][0]["status"], "PASS")
        rows[0]["frames_completos"] = "54"
        rows[0]["fps"] = "54"
        result, data = self.run_cli(frames=self.csv_file("frames.csv", FRAMES_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["frames"]["groups"][0]["status"], "FAIL")
        self.assertEqual(data["frames"]["groups"][0]["min_fps"], 54)
        rows[0]["fps"] = "55"
        result, _ = self.run_cli(frames=self.csv_file("frames.csv", FRAMES_HEADER, rows))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("fps", result.stderr)

    def test_duplicate_identity_headers_and_bad_types_rejected(self):
        duplicate = [crud_row(), crud_row()]
        result, _ = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, duplicate))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("duplicate", result.stderr.lower())
        result, _ = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER[:-1], []))
        self.assertNotEqual(result.returncode, 0)
        for update in ({"valida": "maybe"}, {"total_ms": "-1"}, {"total_ms": "nan"}):
            result, _ = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, [crud_row(**update)]))
            self.assertNotEqual(result.returncode, 0, update)

    def test_no_input_and_malformed_json_rejected(self):
        result, _ = self.run_cli(output=False)
        self.assertNotEqual(result.returncode, 0)
        session = self.root / "bad.json"
        session.write_text("{bad")
        result, _ = self.run_cli(self.csv_file("crud.csv", CRUD_HEADER, []), session=session)
        self.assertNotEqual(result.returncode, 0)

    def test_complete_session_accepts_full_git_source_hashes(self):
        crud = self.csv_file("crud.csv", CRUD_HEADER, self.full_crud())
        frames = self.csv_file("frames.csv", FRAMES_HEADER, self.full_frames())
        session = self.root / "session.json"
        for source_sha in ("6e18d0ab532293a5f634e972689ec5e6f91b3cf2", "A" * 64):
            with self.subTest(source_sha=source_sha):
                session.write_text(json.dumps(session_metadata(source_sha)))
                result, data = self.run_cli(crud, frames, session)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(data["status"], "PASS")
                self.assertEqual(data["session"]["status"], "PASS")
                self.assertEqual(data["session"]["identity"]["shaFuente"], source_sha)

    def test_missing_source_hash_stays_pending(self):
        crud = self.csv_file("crud.csv", CRUD_HEADER, self.full_crud())
        session = self.root / "session.json"
        for source_sha in (None, ""):
            with self.subTest(source_sha=source_sha):
                session.write_text(json.dumps(session_metadata(source_sha)))
                result, data = self.run_cli(crud, session=session)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(data["status"], "PENDING")
                self.assertEqual(data["session"]["missing_critical"], ["shaFuente"])

    def test_invalid_source_hashes_are_rejected(self):
        crud = self.csv_file("crud.csv", CRUD_HEADER, [])
        session = self.root / "session.json"
        for source_sha in ("6e18d0a", "a" * 39, "a" * 41, "a" * 63, "a" * 65,
                           "g" * 40, 1234, True):
            with self.subTest(source_sha=source_sha):
                session.write_text(json.dumps(session_metadata(source_sha)))
                result, _ = self.run_cli(crud, session=session)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("shaFuente", result.stderr)

    def test_artifact_and_trace_hashes_still_require_sha256(self):
        crud = self.csv_file("crud.csv", CRUD_HEADER, [])
        session = self.root / "session.json"
        for field in ("datasetSha256", "zipSha256", "apk.sha256", "apk.certificadoSha256"):
            with self.subTest(field=field):
                metadata = session_metadata("a" * 40)
                if field.startswith("apk."):
                    metadata["apk"][field.split(".")[1]] = "b" * 40
                else:
                    metadata[field] = "b" * 40
                session.write_text(json.dumps(metadata))
                result, _ = self.run_cli(crud, session=session)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(field, result.stderr)
        for kind, header, row in (("crud", CRUD_HEADER, crud_row(traza_sha256="a" * 40)),
                                  ("frames", FRAMES_HEADER, frame_row(traza_sha256="a" * 40))):
            with self.subTest(trace_kind=kind):
                path = self.csv_file(f"{kind}.csv", header, [row])
                result, _ = self.run_cli(**{kind: path})
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("traza_sha256", result.stderr)

    def test_incomplete_fps_and_duplicate_fps_identity(self):
        rows = [frame_row("1", 1, valida="false", motivo="traza dudosa")]
        result, data = self.run_cli(frames=self.csv_file("frames.csv", FRAMES_HEADER, rows))
        self.assertEqual(result.returncode, 0, result.stderr)
        group = data["frames"]["groups"][0]
        self.assertEqual(group["status"], "PENDING")
        self.assertEqual(group["invalid"], 1)
        self.assertEqual(len(group["missing_segments"]), 10)
        result, _ = self.run_cli(frames=self.csv_file("frames.csv", FRAMES_HEADER, rows * 2))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("duplicate", result.stderr.lower())

    def test_json_output_cannot_overwrite_input(self):
        path = self.csv_file("crud.csv", CRUD_HEADER, [crud_row()])
        before = path.read_bytes()
        command = [sys.executable, str(CLI), "--crud", str(path), "--json-output", str(path)]
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(path.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
