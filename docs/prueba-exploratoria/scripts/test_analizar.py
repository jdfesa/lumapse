"""Regresiones del recuento con el CSV público y entradas sintéticas."""

import csv
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from analizar import analizar, BASE, CABECERAS, CON_USO, CSV_ORIGINAL, leer_fecha, OPCIONES


class AnalisisTest(unittest.TestCase):
    def setUp(self):
        self.temporal = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporal.cleanup)
        self.ruta = Path(self.temporal.name) / "entrada.csv"
        self.uso = ["2026/11/10 6:48:34 PM GMT-3", CON_USO[0], "Fácil.", "Útil", "Ninguna.", ""]
        self.no_uso = ["2026/11/11 9:35:24 AM GMT-3", OPCIONES["P1"][0], "", "", "", "Otro motivo."]

    def escribir(self, filas, cabeceras=CABECERAS):
        with self.ruta.open("w", encoding="utf-8", newline="") as archivo:
            writer = csv.writer(archivo)
            writer.writerow(cabeceras)
            writer.writerows(filas)
        return self.ruta

    def test_corte_publico_y_frecuencias(self):
        antes = CSV_ORIGINAL.read_bytes()
        resumen = analizar(CSV_ORIGINAL)
        self.assertEqual(resumen["fuente"]["sha256"], "60906d994bb513183c7a5de44d94286bd32856a0b208f7e5ffb5534e1ad38ac9")
        self.assertEqual(resumen["bases"], {"total": 22, "con_uso": 13, "sin_uso": 9})
        for pregunta, esperados in {
            "P1": [7, 2, 6, 7], "P2": [4, 5, 4, 0, 0],
            "P4": [10, 0, 1, 0, 1, 1], "P5": [3, 0, 2, 1, 0, 3],
        }.items():
            tabla = resumen["preguntas"][pregunta]
            self.assertEqual([o["n"] for o in tabla["opciones"]], esperados)
            self.assertEqual(sum(esperados), tabla["base"])
        self.assertEqual(resumen["calidad"], {"filas_excluidas": 0, "duplicados_exactos_adicionales": 0, "ramificacion_coherente": True})
        self.assertEqual(len(resumen["preguntas"]["P3"]["respuestas"]), 13)
        self.assertEqual(CSV_ORIGINAL.read_bytes(), antes)

    def test_resultado_guardado_es_reproducible(self):
        guardado = (BASE / "resumen.json").read_text(encoding="utf-8")
        self.assertEqual(guardado, json.dumps(analizar(CSV_ORIGINAL), ensure_ascii=False, indent=2) + "\n")

    def test_otro_motivo_no_implica_no_instalar(self):
        cruce = analizar(CSV_ORIGINAL)["cruces"]["P1_P5"]
        self.assertEqual([etapa["opciones"][-1]["n"] for etapa in cruce], [2, 1])

    def test_fechas_explicitas_y_distribucion(self):
        envios = analizar(CSV_ORIGINAL)["envios"]
        self.assertEqual(envios["primero"], "2026-11-10T18:48:34-03:00")
        self.assertEqual(envios["ultimo"], "2026-11-20T11:59:31-03:00")
        self.assertEqual(envios["por_fecha_registrada"], {
            "2026-11-10": 2, "2026-11-11": 1, "2026-11-17": 7,
            "2026-11-18": 5, "2026-11-19": 4, "2026-11-20": 3,
        })
        self.assertEqual(leer_fecha("2026/11/19 12:41:02 AM GMT-3").hour, 0)
        self.assertEqual(leer_fecha("2026/11/19 12:41:02 PM GMT-3").hour, 12)
        for fecha in ("2026/11/19 0:41:02 AM GMT-3", "19/11/2026", "2026/02/30 1:00:00 PM GMT-3"):
            with self.subTest(fecha=fecha), self.assertRaises(ValueError):
                leer_fecha(fecha)

    def test_blancos_de_salto_y_base_de_porcentajes(self):
        resumen = analizar(self.escribir([self.uso, self.no_uso]))
        self.assertEqual(resumen["preguntas"]["P2"]["base"], 1)
        self.assertEqual(resumen["preguntas"]["P2"]["blancos_fuera_del_recorrido"], 1)
        self.assertEqual(resumen["preguntas"]["P2"]["opciones"][1]["porcentaje"], 100.0)

    def test_base_cero_no_equivale_a_cero_por_ciento(self):
        resumen = analizar(self.escribir([self.no_uso]))
        self.assertIsNone(resumen["preguntas"]["P2"]["opciones"][0]["porcentaje"])

    def test_duplicados_diagnosticados_no_eliminados(self):
        resumen = analizar(self.escribir([self.uso, self.uso]))
        self.assertEqual(resumen["calidad"]["duplicados_exactos_adicionales"], 1)
        self.assertEqual(resumen["bases"]["total"], 2)

    def test_texto_libre_no_se_normaliza(self):
        self.uso[3] = "  Texto, con coma\ny salto  "
        resumen = analizar(self.escribir([self.uso]))
        self.assertEqual(resumen["preguntas"]["P3"]["respuestas"][0]["texto_original"], self.uso[3])

    def test_rechaza_esquema_incorrecto_o_sin_respuestas(self):
        for filas, cabeceras in (([], CABECERAS), ([self.uso], ("Timestamp",)), ([self.uso[:-1]], CABECERAS)):
            with self.subTest(filas=filas), self.assertRaises(ValueError):
                analizar(self.escribir(filas, cabeceras))

    def test_rechaza_opciones_y_recorridos_inconsistentes(self):
        for indice, valor in ((1, ""), (1, "Desconocida"), (2, "Otra respuesta"), (2, ""), (3, " "), (4, ""), (5, "Otro motivo.")):
            fila = self.uso.copy()
            fila[indice] = valor
            with self.subTest(indice=indice, valor=valor), self.assertRaises(ValueError):
                analizar(self.escribir([fila]))
        self.no_uso[5] = ""
        with self.assertRaises(ValueError):
            analizar(self.escribir([self.no_uso]))

    def test_cli_no_sobrescribe_fuente_y_salida_es_determinista(self):
        self.escribir([self.uso])
        antes = self.ruta.read_bytes()
        script = str(BASE / "scripts/analizar.py")
        rechazo = subprocess.run([sys.executable, script, "--csv", str(self.ruta), "--salida", str(self.ruta)], capture_output=True)
        self.assertNotEqual(rechazo.returncode, 0)
        self.assertEqual(self.ruta.read_bytes(), antes)
        salida = self.ruta.with_suffix(".json")
        ejecucion = subprocess.run([sys.executable, script, "--csv", str(self.ruta), "--salida", str(salida)], capture_output=True)
        self.assertEqual(ejecucion.returncode, 0, ejecucion.stderr)
        self.assertEqual(json.loads(salida.read_text()), analizar(self.ruta))


if __name__ == "__main__":
    unittest.main()
