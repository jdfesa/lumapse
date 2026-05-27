# Lumapse — Evolucion del Toolchain Rust

Este documento registra la evolucion del toolchain de scripts de Lumapse hacia un auditor Rust nativo. Se mantiene dentro de `scripts/` porque documenta herramientas de desarrollo, no documentacion funcional del producto.

---

## Contexto

Hasta el script #34, Lumapse resolvia sus automatizaciones con Bash y Python. Ese enfoque fue correcto para crecer de forma incremental: cada script atacaba un problema concreto, era facil de inspeccionar y funcionaba sin infraestructura compleja.

Con el crecimiento del proyecto, varios checks empezaron a ejecutarse repetidamente en hooks de Git y quality gates, leyendo los mismos archivos una y otra vez. La respuesta fue crear `lumapse-audit`, un binario Rust que unifica verificaciones criticas en un solo ejecutable rapido, reproducible y apto para integracion local.

---

## Por que Rust

| Aspecto | Bash/Python historico | Rust en `lumapse-audit` |
|---|---|---|
| Ejecucion | Interpretada | Binario nativo compilado |
| Modelo | Scripts separados | Auditor modular unificado |
| Lectura de archivos | Repetida entre scripts | Menos pasadas y procesamiento en memoria |
| Concurrencia | Limitada o secuencial | `std::thread` en auditoria de codigo |
| Dependencias | Python 3 / Bash / herramientas del sistema | `std` + `regex` |
| Uso en hooks | Multiples comandos | Un comando: `./scripts/lumapse-audit-bin --all` |

La decision no reemplaza el valor documental de los scripts originales. Los scripts Python y Shell se conservan como respaldo, evidencia historica y punto de comparacion, pero los checks criticos pasan a ejecutarse desde Rust.

---

## Version 0.1.0 — Auditoria de codigo y trazabilidad

La primera version de `lumapse-audit` absorbio cuatro checks que se ejecutaban con frecuencia:

- `check-file-size.sh` -> `lumapse-audit --code`
- `check-docs.sh` -> parcialmente `lumapse-audit --code`
- `check-offline.sh` -> `lumapse-audit --code`
- `check-traceability.py` -> `lumapse-audit --traceability`

### Modulos

- `main.rs`: auditoria de codigo fuente en `src/`.
- `traceability.rs`: consistencia RF, HU, ADR, CHANGELOG, BACKLOG y referencias en codigo.

### Aporte tecnico

- Unifica LOC guard, TODO/FIXME scan y offline-first en un solo recorrido concurrente.
- Mantiene paridad con el script Bash preservado para excepciones logicas del
  auditor offline-first, por ejemplo validaciones defensivas con
  `.startsWith("https://")` o `.includes("http://")`.
- Reduce el costo de hooks locales.
- Mantiene salida legible en espanol y codigos de salida utiles para automatizacion.

---

## Version 0.2.0 — Absorcion de scripts Python criticos

La segunda version amplio el binario con tres modulos nuevos, sin agregar dependencias extra mas alla de `regex`.

- `check-schema-sync.py` -> `lumapse-audit --schema`
- `check-doc-links.py` -> `lumapse-audit --doc-links`
- `validate-subjects-hierarchy.py` -> `lumapse-audit --hierarchy`

### `schema_sync.rs`

Compara el schema SQLite real contra el DDL documentado.

- Fuente de codigo vigente: `src/services/sqlite/connection.js`.
- Fuente documental: `docs/diagramas/database/04-modelo-fisico-ddl.md`.
- Extrae strings JavaScript y bloques fenced SQL.
- Parsea `CREATE TABLE IF NOT EXISTS` y `ALTER TABLE ... ADD COLUMN`.
- Reporta tablas, columnas y tipos desincronizados.

Nota historica: el script Python original apunta a `src/services/SqliteService.js`, archivo que fue refactorizado. El modulo Rust usa la ruta actual.

### `doc_links.rs`

Audita links internos de Markdown.

- Escanea `docs/` recursivamente y archivos Markdown clave de la raiz.
- Ignora URLs externas y esquemas como `mailto:` o `tel:`.
- Maneja links e imagenes Markdown con parsing manual de brackets, escapes y parentesis anidados.
- Verifica archivos, imagenes y anclas Markdown.
- Las anclas invalidas se reportan como advertencia, pero no bloquean el exit code.

### `subjects_hierarchy.rs`

Valida reglas de jerarquia de materias en memoria.

- Replica el modo de datos validos del script Python.
- No usa SQLite ni `rusqlite`.
- Verifica subjects huerfanos, profundidad maxima DP-004, ciclos y notas con `subjectId` invalido.

---

## Comandos operativos

```bash
# Compilar binario release
cd scripts/lumapse-audit
cargo build --release
cp target/release/lumapse-audit ../lumapse-audit-bin

# Ejecutar checks individuales desde la raiz
./scripts/lumapse-audit-bin --code
./scripts/lumapse-audit-bin --traceability
./scripts/lumapse-audit-bin --schema
./scripts/lumapse-audit-bin --doc-links
./scripts/lumapse-audit-bin --hierarchy

# Ejecutar todo el auditor unificado
./scripts/lumapse-audit-bin --all
```

---

## Integracion con el toolchain

`quality.sh` usa `./scripts/lumapse-audit-bin --all` como auditor unificado dentro del quality gate.

Desde la mejora de diagnostico del toolchain, `quality.sh` distingue dos casos:

- si el binario no existe o no responde a `--help`, usa el fallback Python/Shell;
- si el binario corre y `--all` falla, el fallo se considera un hallazgo real y no se enmascara con fallback.

El fallback preservado cubre `check-file-size.sh`, `check-offline.sh`,
`check-docs.sh`, `check-traceability.py`, `check-schema-sync.py`,
`check-doc-links.py` y `validate-subjects-hierarchy.py`.

`pre-commit` mantiene el camino rapido:

```bash
npm run lint
./scripts/lumapse-audit-bin --code
```

`pre-push` delega el control integral en `quality.sh` y luego ejecuta el presupuesto de bundle:

```bash
./scripts/quality.sh
./scripts/bundle-budget.sh
```

`install-hooks.sh` compila el binario Rust y reinstala hooks con esta configuracion.

---

## Politica de preservacion

Los scripts reemplazados no se eliminan:

- conservan evidencia del proceso incremental;
- permiten comparar implementaciones interpretadas y compiladas;
- sirven como respaldo documental si un entorno academico no tiene Rust disponible;
- facilitan auditorias historicas del toolchain.

Por eso se marcan como `Superseded por lumapse-audit`, pero permanecen en `scripts/`.
