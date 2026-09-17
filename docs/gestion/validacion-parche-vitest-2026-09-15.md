# Parche acotado de Vitest — 2026-09-15

**Estado:** autor confirmó pruebas e integró [PR #17](https://github.com/jdfesa/lumapse/pull/17)
en `main` como `7dc105c` el 2026-09-15 (Argentina; `2026-09-16T00:39:36Z`). Rama
local/remota eliminada después de verificar integración. La confirmación es general;
no se recibieron nuevas muestras por caso ni hash APK, y no cierra métricas F3.
**Base:** `90fd21e9d83bc9cb67b3ba0dc6438d0fc0f48b41`, `main` sincronizado tras PR #16.
**Rama histórica eliminada:** `fix/vitest-redirect-security`. **Checkpoint funcional:** `fedc43e`.

## Alcance y selección del pendiente

El autor aceptó la preparación F3, informó funcionamiento general en el dispositivo y
autorizó integrar PR #16 y limpiar su rama. Luego pidió continuar con un único objetivo.
El [plan anterior](./plan-desarrollo-inmediato-beta-2026-09-12.md) termina en F3: este
parche aborda el seguimiento de seguridad ya registrado en TODO/F1, no inventa una F4
ni da por terminadas las mediciones CRUD/FPS. No se reabre retrospectivamente AUD-004.

Solo cambian los mínimos de `vitest` y `@vitest/coverage-v8` a `^4.1.11`, sus nueve
nodos de desarrollo en el lockfile y las regresiones/documentación relacionadas.
Se conservan las 356 entradas del lockfile (raíz más 355 dependencias); todos los demás
nodos son idénticos, incluidos los productivos. No hay nuevos paquetes, dependencias
transitivas declaradas como directas ni overrides en el proyecto.

No cambian `src/`, schema, plugins, Vite 6.4.3, Node 22.20.0/npm 10.9.3, versión
`0.5.0/500`, APK, tag o release. No incluye el filtro de fecha oculto, los refrescos
vecinos de F2, el smoke SQLite ni optimizaciones. No se accedió a datos o dispositivos.

## Advisory y evidencia negativa/positiva

El [advisory del proveedor](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9)
y la [release 4.1.11](https://github.com/vitest-dev/vitest/releases/tag/v4.1.11) identifican
el parche de la línea 4 para `GHSA-82fw-gwwq-j7x9`. Afecta la lectura mediante redirects
del mocker en servidores de desarrollo alcanzables bajo las precondiciones del aviso;
no demuestra explotación ni una vulnerabilidad del APK de Lumapse. El proyecto no
registra esos plugins en su aplicación ni expone un servidor de tests como parte de este trabajo.

`tests/tooling/vitest-mocker.test.js` resuelve el mocker **instalado por Vitest** y usa
configuración real de Vite, con `configFile: false` y `envFile: false`. Ejercita callbacks
con transporte simulado; no escucha puertos y solo lee fixtures sintéticas temporales.
El glob existente de `test:tooling` incorpora estas pruebas al gate sin otro entrypoint.

| Caso | 4.1.7, antes del parche | 4.1.11, después de `npm ci` |
|---|---|---|
| Redirect permitido | Pasa; devuelve el módulo sintético | Pasa; conserva el contenido |
| Redirect fuera de `fs.allow` | Falla; devuelve el archivo restringido | Pasa; no registra ni devuelve el archivo |
| Redirect dentro de la raíz pero en `fs.deny` | Falla; devuelve el archivo restringido | Pasa; respeta la denegación |
| Desactivar registro con `registerWebSocketEvents: false` | Falla; conserva tres handlers | Pasa; no registra handlers |

El RED real fue **1 aprobado / 3 fallidos**, por aserciones concretas; el GREEN es
**4/4**. No se atribuye a estas pruebas el comportamiento del modo browser completo,
que no está instalado, ni una prueba de red o de Android.

## Resolución mínima del lockfile

La instalación dirigida inicial falló en npm 10.9.3 con
`Cannot read properties of null (reading 'edgesOut')`. El log de Arborist muestra
exploración de peers opcionales Vite/devtools/Vitest 5, fuera del objetivo. Se reprodujo
también en una copia temporal, con `--prefer-dedupe` y Vite explícito.

Para generar el candidato se copiaron los manifests a
`tmp/vitest-security-2026-09-15/lock-candidate/`, se restringieron temporalmente los
dos paquetes a 4.1.11 y Vite a 6.4.3, se retiraron de **esa copia** los nueve nodos
Vitest a regenerar y se acotó su resolución con un override temporal de Vite 6.4.3.
Después se **retiró el override**, se restauraron los rangos originales salvo los
dos mínimos parcheados y se validó `npm install --package-lock-only --ignore-scripts`
normal antes de adoptar el candidato. Una comparación estructurada exigió exactamente
esos nueve nodos y ningún cambio productivo; `npm ci` normal volvió a validar el resultado.

No se usó `npm audit fix`, `--force`, `--legacy-peer-deps`, un npm alternativo ni un
override permanente. Los comandos de verificación de abajo no necesitan ese paso de
generación: consumen directamente el lockfile revisado.

## Verificación reproducible

Con Node **22.20.0**, npm **10.9.3** y sin `NODE_OPTIONS`:

```bash
npm run check:runtime
npm ci
npm ls --all
node --test tests/tooling/vitest-mocker.test.js
npm audit --json
npm audit --omit=dev --json
npm run test:coverage -- --maxWorkers=1 --allowOnly=false
npm run verify
git diff --check
```

| Control | Resultado observado |
|---|---|
| `npm ci` normal | Exit 0; sin flags de relajación ni override |
| `npm ls --all --json` | Exit 0; árbol completo sin errores de peers |
| Auditoría completa, antes → después | 3 moderadas → 0, consulta fresca del 2026-09-15 |
| Auditoría productiva, antes → después | 0 → 0; no demuestra seguridad exhaustiva del APK |
| Regresiones focalizadas | 4/4 después del parche, frente a 1/4 en 4.1.7 |
| `test:coverage`, proveedor V8 4.1.11 | Exit 0; 72 archivos / 1104 tests, 58 archivos instrumentados (15 JS / 43 TS) |
| `npm run verify` completo | Exit 0; 61 tests de tooling, 72 archivos / 1104 tests de aplicación, reporte JSON completo, build, typecheck y todas las auditorías |
| Build productivo antes/después | Los 11 archivos emitidos conservan exactamente sus SHA-256; no es una comparación de APK |
| CI del HEAD final `c06dda4` | [Quality Gate 34981383010](https://github.com/jdfesa/lumapse/actions/runs/34981383010) y GitGuardian aprobados antes del merge |

En este host el sandbox impide algunos subprocesos Node: las ejecuciones válidas usan
el runtime canónico fuera de esa restricción, no un workaround de Node 26. Persisten
tres warnings históricos de lint y los avisos orientativos de tamaño; no se convierten
fallos en warnings ni se reduce el alcance del gate.

Evidencia local ignorada en `tmp/vitest-security-2026-09-15/`: `verify.log`,
`dependency-tree.json` y `build-before.json`. El resumen V8 está en
`coverage/coverage-summary.json`; los resultados anteriores y las pruebas versionadas
permiten revisar el alcance sin depender de esos temporales.

El resumen de coverage del alcance configurado actual registra 95,93% de statements,
89,19% de branches, 99,21% de functions y 97% de lines. Esto verifica el proveedor
actualizado; no es una mejora atribuible al parche ni sustituye la evidencia histórica
de servicios para RNF-024. No se cambiaron configuración ni umbrales de cobertura.

## Handoff histórico — no ejecutar sobre la rama eliminada

El autor informó que probó el cambio y ya hizo el merge. Las casillas siguientes
conservan el detalle no recibido; no se marcan por inferencia. El trabajo actual
está en el [plan de filtros visibles](./plan-filtros-visibles-2026-09-15.md).

En un checkout sin cambios propios pendientes:

```bash
git status --short --branch
git fetch origin --prune
git switch fix/vitest-redirect-security
git pull --ff-only
# Activar .nvmrc en el entorno habitual; por ejemplo: nvm install && nvm use
node --version
npm --version
npm ci
npm run verify
git rev-parse HEAD
```

- [ ] Autor revisar el diff, confirmar el SHA y repetir la verificación en la Mac.
- [ ] Autor comprobar en su entorno nativo habitual apertura/reapertura, crear/editar
  una nota, navegar por materias, fechas y backup; registrar artefacto y resultado.
- [ ] Si hace falta otro APK, acordar antes identidad, versión/code y firma compatible;
  no reutilizar la beta publicada para un binario distinto ni desinstalar/borrar datos.
  Aplican las [guardias del protocolo F3](../beta-core-validation/protocolo.md).
- [x] Autor confirmó pruebas y realizó el merge de PR #17; main sincronizado y
  rama integrada eliminada. No fue auto-merge ni aprobación del cambio siguiente.

El smoke manual web es auxiliar, no obligatorio. No instalar Android Studio solo por
esta tarea ni iniciar otro frente mientras el PR esté abierto. La aprobación anterior
de PR #16 no se reutiliza como aprobación de este nuevo cambio.
