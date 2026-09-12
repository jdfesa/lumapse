# F1 — Validación del gate portable y entorno canónico

**Estado:** implementación terminada; pendiente de revisión, verificación en la Mac, prueba en el teléfono y aprobación explícita. No integrada a `main`.

**Rama:** `fix/quality-gate-portability`. **Inicio observado:** 2026-09-12; cierre pendiente de aceptación.

**PR de implementación:** [#14 — gate portable y reproducible](https://github.com/jdfesa/lumapse/pull/14), abierto y sin autorización de merge.

**Base:** `65e5767`, merge autorizado del [PR #13](https://github.com/jdfesa/lumapse/pull/13). Se eliminaron su rama documental local/remota y las referencias obsoletas antes de iniciar F1. No se inició F2 ni otra rama de tarea.

## Alcance implementado

- `774e9fa`: pin exacto Node 22.20.0/npm 10.9.3, diagnóstico sin dependencias y ciclo de instalación reproducible.
- `e4ab50c`: scanner offline contextual y regresiones; conserva el wrapper Shell y no modifica `index.html` ni su CSP.
- `cf84feb`: gate único local/CI, reporte Vitest completo, rechazo de crashes, regresiones del gate y [ADR-010](../adr/ADR-010-gate-portable-y-entorno-canonico.md).

`verify` y `quality` invocan la misma lista: entorno, lint, tooling, tests y reporte, build,
typecheck, toolchain, versión, DB smoke, presupuesto, diálogos nativos, a11y, trazabilidad,
links, schema, DBML, jerarquía, offline y diagnósticos históricos de tamaño/TODOs/Git.
El binario Rust no participa de la aceptación. No se redujeron umbrales ni se omitieron tests.

No hay cambios en `src/`, schema, UI, plugins, grafo de dependencias, versión `0.5.0/500`,
APK o datos personales. El lockfile solo agrega `engines` del paquete raíz. No se conectó
a la Mac ni al dispositivo, ni se instaló un APK, publicó tag/release o realizó otro merge.

## Evidencia ejecutada

Host Linux x64, Bash 5.3.15, Python 3.14.7. Node 22.20.0/npm 10.9.3 se usaron desde una
distribución oficial aislada en `/tmp`, verificada por SHA-256 contra la publicación de
[Node 22.20.0](https://nodejs.org/en/blog/release/v22.20.0). No se sustituyó el Node global.

| Prueba | Resultado | Alcance |
|---|---|---|
| `npm ci` en checkout detached limpio de `cf84feb` | Exit 0 | Sin `node_modules` previo ni binario Rust; lockfile sin modificar |
| `npm run verify` en ese checkout, sin `NODE_OPTIONS` | Exit 0 | 56 pruebas de tooling; 67 archivos / 1065 tests Vitest; build y todos los controles aprobados |
| Estado Git después del gate limpio | Sin cambios | El checkout temporal no agregó una segunda rama |
| [CI del checkpoint `37fe863`](https://github.com/jdfesa/lumapse/actions/runs/34723392190) | Aprobada | `npm ci` y el mismo `npm run verify` en Ubuntu/Python 3.12, Node 22.20.0/npm 10.9.3; no sustituye Mac/Android |
| `npm run verify` con Node 26.7.0/npm 12.0.2 | Exit 1 antes de las suites | Diagnóstico de ambas versiones, sin workaround |
| Regresiones del gate | Aprobadas | Fallo de cada control, exits 1/137/139/143 pese a resumen exitoso, reportes ausentes/inválidos/parciales y binario optativo simulado con exits 0/1/139 |
| Regresiones offline | 19/19 aprobadas | Local CSP, hosts parecidos, puertos/rutas/credenciales, remoto en la misma línea/atributo, JS/TS/CSS/HTML, selector CSS universal y NUL en texto |
| `bash -n` de los entrypoints modificados | Exit 0 | Sintaxis Shell |
| `npm audit --json` | Exit 1: 3 moderadas | Dependencias de desarrollo; ver seguimiento abajo |
| `npm audit --omit=dev --json` | Exit 0: 0 advisories | Inventario productivo en la fecha consultada; no es una prueba de seguridad del APK |

Lint conserva **3 warnings históricos**, sin errores. La guardia de tamaño conserva sus
avisos orientativos. Los errores intencionales de pruebas SQLite y avisos jsdom de `scrollTo`
no equivalen a tests fallidos; el reporte estructurado exige todas las aserciones aprobadas.

Logs locales ignorados: `tmp/quality-gate-f1-2026-09-12/` (`npm-ci-clean.log`,
`verify-clean.log`, `tooling-tests.log`, `unsupported-node.log` y auditorías JSON).
Este resumen y los tests versionados permiten revisar la evidencia sin depender de `/tmp`.
El enlace anterior conserva la ejecución de CI de un checkpoint concreto; los [checks de PR #14](https://github.com/jdfesa/lumapse/pull/14/checks) registran el SHA candidato final y cualquier ejecución posterior. No se infieren del gate local.

## Seguimiento de seguridad separado

La instalación expuso un advisory previo del grafo sin modificar:
[GHSA-82fw-gwwq-j7x9](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9).
`npm audit` cuenta `vitest`, `@vitest/mocker` y `@vitest/coverage-v8` como tres entradas moderadas
relacionadas. El aviso afecta servidores de desarrollo que registran mock redirects; el
proveedor señala 4.1.11 como versión corregida. No demuestra una vulnerabilidad del APK.

No se ejecutó `npm audit fix` ni se expuso un servidor de tests a la red. Evaluar una actualización
acotada después de cerrar la rama actual, con su propia aprobación; no reabrir retrospectivamente
el cierre de AUD-004 ni reutilizar su antigua auditoría 0/0 como resultado actual.

## Handoff y condición de merge

En la Mac, con el checkout sin cambios propios pendientes:

```bash
git status --short --branch
git fetch origin --prune
git switch fix/quality-gate-portability
git pull --ff-only
# Si se usa nvm: nvm install && nvm use
node --version
npm --version
npm run check:runtime
npm ci
npm run verify
git rev-parse HEAD
```

- [x] CI del checkpoint `37fe863` aprobada y enlazada; comprobar también la cabeza final en PR #14.
- [ ] El autor revisó el diff y el PR.
- [ ] La Mac aprobó `npm ci` y `npm run verify` con Node 22.20.0/npm 10.9.3, sin workaround.
- [ ] El autor confirmó funcionamiento en el teléfono de pruebas e identificó el artefacto utilizado.
- [ ] El autor autorizó explícitamente el merge de F1.

F1 no genera un APK nuevo ni valida comportamiento nativo. La comprobación en el teléfono
se coordina con el autor, preservando firma y datos; no se desinstala ni borra información por
defecto. Mantener AUD-008/AUD-009 **en revisión**, no cerrados, hasta aceptar estos pendientes.
Solo después del merge autorizado y limpieza de esta rama puede comenzar F2.
