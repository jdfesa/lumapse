"""Regresiones del ensamblado editorial; no ejecutan ni compilan la aplicación."""

from contextlib import redirect_stderr, redirect_stdout
import importlib.util
import io
import json
from pathlib import Path
import re
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]


def load_script(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


assembler = load_script("assemble_report", "assemble-report.py")
links = load_script("report_doc_links", "check-doc-links.py")


class MarkdownStructureTests(unittest.TestCase):
    def test_headings_ignore_both_fence_types_and_nested_shorter_fences(self):
        content = (
            "# Visible\n````md\n# Oculto\n```\n# También oculto\n````\n"
            "~~~text\n# Oculto con tilde\n```\n~~~\n## Final\n"
        )
        self.assertEqual(list(assembler.iter_headings(content)), [(1, "Visible"), (2, "Final")])

    def test_anchors_do_not_collide_with_existing_suffixes(self):
        seen = {}
        titles = ["Sección", "Sección-1", "Sección", "Sección", "Sección-1"]
        anchors = [assembler.unique_anchor(title, seen) for title in titles]
        self.assertEqual(anchors, ["sección", "sección-1", "sección-2", "sección-3", "sección-1-1"])

    def test_presentation_headings_reserve_anchors_without_entering_the_toc(self):
        chapters = [{"filename": "01-introduccion.md", "content": "# Prueba\n## Tema\n"}]
        toc, anchors = assembler.collect_anchors(chapters, "# Informe\n## Prueba\n")
        self.assertEqual(anchors["01-introduccion.md"], "prueba-1")
        self.assertEqual([entry["title"] for entry in toc], ["Prueba", "Tema"])

    def test_chapter_links_change_but_images_and_code_remain_intact(self):
        content = (
            "[Ver capítulo](01-introduccion.md)\n"
            "![Imagen](01-introduccion.md)\n"
            "[Detalle](./01-introduccion.md#1-1-contexto)\n"
            "[Otro](../adr/decision.md)\n"
            "```md\n[Ejemplo](01-introduccion.md)\n```\n"
            "~~~md\n[Otro ejemplo](01-introduccion.md)\n~~~\n"
        )
        result = assembler.fix_chapter_links(content, {"01-introduccion.md": "capítulo-1"})
        self.assertEqual(result, content.replace(
            "[Ver capítulo](01-introduccion.md)", "[Ver capítulo](#capítulo-1)"
        ).replace("[Detalle](./01-introduccion.md#1-1-contexto)", "[Detalle](#1-1-contexto)"))


class AssemblyCommandTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.report = self.root / "docs" / "informe-final"
        self.report.mkdir(parents=True)
        self.output = self.report / "informe-final-completo.md"
        self.metadata = {
            "status": "Documento completo para revisión",
            "document_cutoff_date": "2026-11-23",
            "functional_scope": "Versión de ejemplo",
            "functional_tag": "v0.0.0",
            "functional_commit": "abc1234",
            "technical_ref": "def5678",
            "technical_commit": "def5678",
        }
        self.write_metadata(self.metadata)
        self.presentation = "# Informe de prueba\n\n**Alumno:** Persona de ejemplo\n\n## Autoridades\n\nTutora de ejemplo\n"
        (self.report / "00-presentacion-institucional.md").write_text(self.presentation, encoding="utf-8")
        for index, filename in enumerate(assembler.CHAPTER_FILENAMES, 1):
            (self.report / filename).write_text(
                "# Unidad {0}\n\n## {0}.1 Tema\n\nTexto íntegro con acentos y símbolos: ≥, ≤, →.\n".format(index),
                encoding="utf-8",
            )
        replacements = patch.multiple(
            assembler, PROJECT_ROOT=self.root, REPORT_DIR=self.report,
            OUTPUT_PATH=self.output, METADATA_PATH=self.report / "report-metadata.json",
            PRESENTATION_PATH=self.report / "00-presentacion-institucional.md",
        )
        replacements.start()
        self.addCleanup(replacements.stop)

    def write_metadata(self, metadata):
        (self.report / "report-metadata.json").write_text(json.dumps(metadata), encoding="utf-8")

    def run_command(self, *args):
        stdout, stderr = io.StringIO(), io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            status = assembler.main(list(args))
        return status, stdout.getvalue(), stderr.getvalue()

    def test_generation_uses_public_presentation_and_only_the_expected_output(self):
        before = {path.name: path.read_bytes() for path in self.report.iterdir()}
        self.assertEqual(self.run_command()[0], 0)
        content = self.output.read_text(encoding="utf-8")
        self.assertEqual(content.count(self.presentation.strip()), 1)
        visible = re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)
        self.assertNotIn(self.metadata["status"], visible)
        self.assertNotIn("| Campo | Valor |", content)
        self.assertNotIn("José David Sandoval", content)
        for filename, data in before.items():
            self.assertEqual((self.report / filename).read_bytes(), data)
        self.assertEqual(set(path.name for path in self.report.iterdir()) - set(before), {self.output.name})

    def test_regeneration_is_identical_and_has_no_clock_dependency(self):
        self.assertEqual(self.run_command()[0], 0)
        first = self.output.read_bytes()
        with patch.object(assembler, "date", wraps=assembler.date) as clock:
            clock.today.side_effect = AssertionError("El ensamblado no debe depender del reloj")
            self.assertEqual(self.run_command()[0], 0)
        self.assertEqual(self.output.read_bytes(), first)

    def test_check_does_not_write_even_when_output_is_stale(self):
        self.assertEqual(self.run_command()[0], 0)
        data = self.output.read_bytes()
        before = self.output.stat().st_mtime_ns
        self.assertEqual(self.run_command("--check")[0], 0)
        self.assertEqual(self.output.stat().st_mtime_ns, before)
        chapter = self.report / assembler.CHAPTER_FILENAMES[0]
        chapter.write_text(chapter.read_text(encoding="utf-8") + "\nCambio pendiente.\n", encoding="utf-8")
        status, _, error = self.run_command("--check")
        self.assertEqual(status, 1)
        self.assertIn("desactualizada", error)
        self.assertEqual(self.output.read_bytes(), data)
        self.assertEqual(self.output.stat().st_mtime_ns, before)

    def test_check_missing_output_does_not_create_it(self):
        self.assertEqual(self.run_command("--check")[0], 1)
        self.assertFalse(self.output.exists())

    def test_missing_or_empty_source_does_not_replace_previous_output(self):
        self.output.write_text("Salida anterior", encoding="utf-8")
        for filename in ["00-presentacion-institucional.md", assembler.CHAPTER_FILENAMES[-1]]:
            path = self.report / filename
            original = path.read_bytes()
            for replacement in [None, b" \n"]:
                with self.subTest(filename=filename, replacement=replacement):
                    if replacement is None:
                        path.unlink()
                    else:
                        path.write_bytes(replacement)
                    self.assertEqual(self.run_command()[0], 1)
                    self.assertEqual(self.output.read_text(encoding="utf-8"), "Salida anterior")
                    path.write_bytes(original)

    def test_invalid_metadata_does_not_create_output(self):
        for invalid in [[], {}, {**self.metadata, "status": 12},
                        {**self.metadata, "document_cutoff_date": "2026-02-30"},
                        {**self.metadata, "status": "Texto --> fuera del comentario"}]:
            with self.subTest(metadata=invalid):
                self.write_metadata(invalid)
                self.assertEqual(self.run_command()[0], 1)
                self.assertFalse(self.output.exists())
        (self.report / "report-metadata.json").write_text("{", encoding="utf-8")
        self.assertEqual(self.run_command()[0], 1)

    def test_figures_are_preserved_and_missing_files_stop_generation(self):
        diagram = self.root / "docs" / "diagramas" / "figura.svg"
        diagram.parent.mkdir()
        diagram.write_text('<svg xmlns="http://www.w3.org/2000/svg"/>', encoding="utf-8")
        image = "![Figura de prueba](../diagramas/figura.svg)"
        chapter = self.report / assembler.CHAPTER_FILENAMES[3]
        chapter.write_text("# Arquitectura\n\n" + image + "\n\n*Figura 4-1. Pie de prueba.*\n", encoding="utf-8")
        self.assertEqual(self.run_command()[0], 0)
        first = self.output.read_bytes()
        self.assertIn(image, self.output.read_text(encoding="utf-8"))
        diagram.unlink()
        self.assertEqual(self.run_command()[0], 1)
        self.assertEqual(self.output.read_bytes(), first)

    def test_remote_image_is_rejected_but_fenced_examples_are_ignored(self):
        with self.assertRaisesRegex(RuntimeError, "local"):
            assembler.validate_figures("![Remota](https://example.invalid/figura.svg)\n")
        assembler.validate_figures("~~~md\n![Ejemplo](ausente.svg)\n~~~\n")


class CurrentManuscriptTests(unittest.TestCase):
    def setUp(self):
        self.path = ROOT / "docs" / "informe-final" / "informe-final-completo.md"
        self.content = self.path.read_text(encoding="utf-8")

    def test_presentation_and_all_eight_units_are_included_verbatim_once_in_order(self):
        previous = -1
        for filename in ["00-presentacion-institucional.md", *assembler.CHAPTER_FILENAMES]:
            with self.subTest(filename=filename):
                source = (self.path.parent / filename).read_text(encoding="utf-8").strip()
                self.assertEqual(self.content.count(source), 1)
                current = self.content.index(source)
                self.assertGreater(current, previous)
                previous = current

    def test_toc_and_five_vector_figures_have_valid_local_destinations(self):
        decorated = links.decorate_links(links.extract_links(self.path, self.content))
        self.assertEqual(links.check_file_links(decorated), [])
        self.assertEqual(links.check_image_links(decorated), [])
        self.assertEqual(links.check_anchor_links(decorated), [])
        figures = [link for link in decorated if link["is_image"]]
        self.assertEqual(len(figures), 5)
        for figure in figures:
            self.assertEqual(figure["destination"].suffix, ".svg")
            self.assertEqual(ET.parse(figure["destination"]).getroot().tag, "{http://www.w3.org/2000/svg}svg")
        self.assertTrue(all(link["is_image"] or link["target"].startswith("#") for link in decorated))
        self.assertNotRegex(self.content, r"https?://")

    def test_output_matches_current_sources_without_writing(self):
        before = self.path.stat().st_mtime_ns
        with redirect_stdout(io.StringIO()):
            self.assertEqual(assembler.main(["--check"]), 0)
        self.assertEqual(self.path.stat().st_mtime_ns, before)


if __name__ == "__main__":
    unittest.main()
