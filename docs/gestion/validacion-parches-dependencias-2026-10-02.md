# Validación del parche de dependencias — 2026-10-02

**Base:** `main`/`origin/main` en `1e4f91400619c6b719594067a9e53141cac3ccf1`,
árbol limpio y cero PR abiertos después de fetch y pull ff-only.

**Rama:** `fix/dependency-security-october`.

**Parche y regresiones:** `320d0c1128fa53daac8496f1ef079bd0d4c9d219`;
para Android se debe identificar además el HEAD exacto del PR y su artefacto.

**Entorno:** Node **22.20.0**, npm **10.9.3**, sin `NODE_OPTIONS`.

**Revisión:** [PR #21](https://github.com/jdfesa/lumapse/pull/21), **draft abierto**.

**Estado:** parches, regresiones focalizadas y gate integral verificados localmente;
APK debug instalada para supervisión el 2026-10-02; aceptación funcional Android
y autorización explícita de merge del autor pendientes.

## Alcance y grafo mínimo

El autor autorizó este único prerrequisito de seguridad antes de retomar F3.
La implementación no incluye ajustes de instrucciones, refactors, funcionalidades, datos/schema,
arquitectura, APK, firma, tag ni release. La aplicación permanece en **0.5.0/500**.
El [cierre de AUD-004 del 2026-09-02](./analisis-aud-004-seguridad-dependencias-2026-09-02.md)
y las auditorías posteriores se conservan como evidencia de sus propias fechas.

| Paquete | Antes → después | Cadena y alcance |
|---|---|---|
| DOMPurify | 3.4.14 → **3.4.16** | Dependencia productiva directa; piso `^3.4.16` |
| brace-expansion | 5.0.9 → **5.0.12** | Tooling por minimatch 10.2.5/ESLint 10.4.0; minimatch también es compartido por CLI/TypeScript tooling |
| undici | 7.29.0 → **7.29.1** | jsdom 29.1.1, usado por la suite Vitest |

Comparación estructurada contra la base: **356 nodos incluyendo raíz** antes y
después; cambian solo estos tres paquetes y el piso DOMPurify de la raíz. En cada
paquete cambian únicamente `version`, `resolved` e `integrity`; los demás nodos,
padres, dependencias, licencias y engines son idénticos. No hay paquetes nuevos,
transitivas directas, overrides ni cambios de major. Vite y Vitest no cambian.

Los padres admiten los parches: minimatch declara `brace-expansion ^5.0.5` y jsdom
declara `undici ^7.25.0`. Sus engines siguen siendo compatibles con Node 22.20.0.

## Advisories revalidados

Se consultaron nuevamente `npm audit`, el grafo instalado, los manifests npm y los
**14 advisories de los repositorios oficiales de los mantenedores** antes de editar.
Los rangos siguientes corresponden a la línea instalada, no a todas las majors.

| Paquete / advisory oficial | Rango afectado aplicable | Parche mínimo |
|---|---|---|
| DOMPurify: [GHSA-p98j-92pf-mc4p](https://github.com/cure53/DOMPurify/security/advisories/GHSA-p98j-92pf-mc4p) | 3.4.13–3.4.15 | 3.4.16 |
| brace-expansion: [GHSA-6j4f-fj2g-mc7p](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-6j4f-fj2g-mc7p) | ≥4.0.0, <5.0.10 | 5.0.10 |
| brace-expansion: [GHSA-qhr7-859c-m2p7](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-qhr7-859c-m2p7) | ≥4.0.0, <5.0.11 | 5.0.11 |
| brace-expansion: [GHSA-q2hr-2g5m-vwhr](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-q2hr-2g5m-vwhr) | ≥4.0.0, <5.0.12 | 5.0.12 |
| undici: [GHSA-3wwx-pv8p-q78v](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v) | ≥7.28.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-pmjh-fq2x-6v4x](https://github.com/nodejs/undici/security/advisories/GHSA-pmjh-fq2x-6v4x) | ≥7.11.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-r53p-7pc4-xj5r](https://github.com/nodejs/undici/security/advisories/GHSA-r53p-7pc4-xj5r) | ≥7.0.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-rfgv-xxqx-mfg5](https://github.com/nodejs/undici/security/advisories/GHSA-rfgv-xxqx-mfg5) | ≥7.0.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-3xpg-4rpp-hhhm](https://github.com/nodejs/undici/security/advisories/GHSA-3xpg-4rpp-hhhm) | ≥7.15.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-2jfj-6hjv-fm6j](https://github.com/nodejs/undici/security/advisories/GHSA-2jfj-6hjv-fm6j) | ≥7.0.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-2gqq-gqf2-x968](https://github.com/nodejs/undici/security/advisories/GHSA-2gqq-gqf2-x968) | ≥7.1.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-w293-vg96-wgc3](https://github.com/nodejs/undici/security/advisories/GHSA-w293-vg96-wgc3) | ≥7.24.1, <7.29.1 | 7.29.1 |
| undici: [GHSA-8436-99hf-9mmv](https://github.com/nodejs/undici/security/advisories/GHSA-8436-99hf-9mmv) | ≥7.0.0, <7.29.1 | 7.29.1 |
| undici: [GHSA-rx4f-c7p8-82vq](https://github.com/nodejs/undici/security/advisories/GHSA-rx4f-c7p8-82vq) | ≥7.0.0, <7.29.1 | 7.29.1 |

La auditoría agrega **tres paquetes afectados**, no tres advisories ni tres CVE:
brace-expansion y undici tienen severidad agregada alta; DOMPurify, baja. La
auditoría `--omit=dev` conserva únicamente DOMPurify. Los avisos altos del tooling
no se trasladan al APK como vulnerabilidades productivas demostradas.

## Alcanzabilidad y regresiones

`src/services/MarkdownService.ts` pasa una cadena a `DOMPurify.sanitize`; no usa
`IN_PLACE`. Su hook `afterSanitizeAttributes` retira atributos, no nodos. No se
observan las dos precondiciones del advisory concreto en ese camino. Se parchea
igualmente la dependencia productiva; no se afirma explotación del APK ni
seguridad exhaustiva por un resultado npm 0/0.

`tests/unit/services/MarkdownService.security.test.js` añade cuatro casos:

- Tres contratos upstream con una instancia aislada: retirar un subárbol mediante
  `beforeSanitizeElements` (control), `afterSanitizeElements` y
  `afterSanitizeAttributes` debe neutralizar el handler del descendiente retirado.
  Con 3.4.14, los dos hooks posteriores conservan `onerror` y fallan la aserción;
  con 3.4.16, los tres casos pasan. No se ejecuta el handler ni se abre red.
- El render real de Lumapse conserva heading, callout, checkbox, enlace e imagen
  local, elimina scripts/handlers y recursos peligrosos, y produce la misma salida
  al repetirse. Pasa antes y después; es control de compatibilidad, no RED productivo.

Los resultados focalizados son **89 aprobados / 2 fallidos antes → 91/91 después**,
en siete archivos. Además de los cuatro casos nuevos, se ejecutan los 56 de
MarkdownService y las suites de ExportService, BackupZipService,
BackupImportZipService, BackupImportRegression y BackupService. La lectura de
esas fronteras no encontró uso de DOMPurify en serialización/importación; no se
cambia el contenido persistido ni el formato ZIP. Las pruebas automatizadas no
sustituyen el smoke nativo del autor.

## Resolución e instalación

La resolución dirigida normal usó `npm install --package-lock-only
'dompurify@^3.4.16'` y `npm update brace-expansion undici --package-lock-only`.
La segunda seleccionó undici **7.30.0** por el rango caret del padre. La comprobación
estricta rechazó esa selección, que excedía el parche mínimo. Se acotó el nodo
existente a 7.29.1 con su versión, tarball e integrity oficiales del registro npm;
sus dependencias y engines no cambian. No se inventaron hashes ni se añadieron
overrides. Un `npm ci` **normal** sobre el lock final valida la instalación,
incluidos `preinstall`/guardia canónica y `postinstall`/copy-wasm.

En este host el guardia falló durante la auditoría de solo lectura por `spawnSync
npm EPERM`. En esta fase autorizada pasó con permisos adecuados: no se modifica
el guardia, runtime global, hooks ni calidad; no se usa `NODE_OPTIONS`,
`--ignore-scripts`, `--legacy-peer-deps`, `--force` o `npm audit fix`.

## Evidencia local y comandos

Comandos de proyecto ejecutados mediante RTK, con caché/logs y reportes fuera del
repositorio. Los filtros siguientes corresponden solo a la suite focalizada;
`npm run verify` debe ejecutarse completo, sin argumentos.

```bash
npm run check:runtime
npm ci
npm ls --all --json
npm ls brace-expansion undici dompurify minimatch eslint jsdom --all
npm audit --json
npm audit --omit=dev --json
npm run test -- tests/unit/services/MarkdownService.test.js tests/unit/services/MarkdownService.security.test.js tests/unit/services/ExportService.test.js tests/unit/services/backup/BackupZipService.test.js tests/unit/services/backup/BackupImportZipService.test.js tests/unit/services/backup/BackupImportRegression.test.js tests/unit/services/backup/BackupService.test.js --maxWorkers=1 --allowOnly=false
npm run verify
npm run check:docs
npm run check:traceability
npm run check:version
git diff --check
```

| Control | Resultado del 2026-10-02 |
|---|---|
| `check:runtime` y `npm ci` final | Exit 0; Node 22.20.0/npm 10.9.3, lifecycles intactos |
| `npm ls --all --json` y rangos padres | Exit 0; grafo válido, parches compatibles |
| Auditoría completa antes → después | Exit 1: 2 high/1 low → exit 0: 0 advisories |
| Auditoría productiva antes → después | Exit 1: 1 low → exit 0: 0 advisories |
| Focalizada con reporte JSON | Exit 1: 89/2 → exit 0: siete archivos, 91/91 |
| Diff estructurado del lock | Tres paquetes y piso raíz; 356 nodos, ningún agregado/removido |
| `npm run verify` integral | Exit 0: 61/61 pruebas de tooling y 76 archivos/1156 pruebas de aplicación; reporte completo validado, lint, build, types, schema/DBML/SQLite y demás controles aprobados |
| Docs, trazabilidad, versión y enlaces nuevos | Exit 0 dentro del gate y repetidos por separado: 96 Markdown/748 enlaces, cero enlaces rotos ni advertencias de trazabilidad; 0.5.0/500. Auditoría suplementaria de TODO y fuentes modificadas sin errores |
| CI de la rama/PR | [Checks del PR #21](https://github.com/jdfesa/lumapse/pull/21/checks): consultar resultado y SHA del HEAD revisado; no atribuir evidencia local ni CI de main a ese head |
| Android en la fase remota | Sin APK generado ni instalación; el despliegue local posterior se registra abajo y no equivale a aceptación funcional |

Las salidas privadas identificadas son `04-audit-before-full.txt`,
`05-audit-before-production.txt`, `21-audit-after-full.txt`,
`22-audit-after-production.txt`, `focused-before.json`, `focused-after.json` y
`graph-diff.json`, `26-full-verify.txt`, `30-final-verify.txt`,
`32-final-documentation-checks.txt` y `33-final-supplemental-links.txt`.
La revisión pública dispone del diff, regresiones y este resumen;
no se versionan logs, cachés, datos personales ni los temporales de la sesión.

El gate conserva tres advertencias de lint preexistentes (complejidad/tamaño de
NoteEditor y tamaño de BackupImportPlan), sin errores ni cambios en esos archivos.
Las advertencias no bloqueantes de tamaño/offline no se convierten en deuda
aprobada para este frente. Build y presupuestos estáticos no son mediciones RNF ni
validación Android. `java`, `javac`, `adb` y `apksigner` no están disponibles en el
PATH observado; no se buscó ni operó un dispositivo.

## Handoff Android y aprobación — pendiente

El PR permanece **draft** hasta la confirmación Android de estos cambios
exactos. CI verde no autoriza merge ni auto-merge. El autor deberá:

1. Revisar el diff, registrar el SHA completo de la rama y repetir el gate canónico
   en su entorno habitual si corresponde. No iniciar otro frente durante la revisión.
2. Antes de compilar/instalar otro APK, acordar versión/code nuevos, variante,
   SHA-256, certificado compatible y dispositivo/perfil seguro. `0.5.0/500` solo se
   conserva en este cambio de código, no autoriza reutilizar la beta para otro binario.
   Aplican las [guardias de artefacto y datos](../beta-core-validation/protocolo.md#2-acuerdo-de-artefacto-y-protección-de-datos--antes-de-instalarimportar).
3. Abrir, editar, guardar y reabrir una nota sintética con headings, negrita,
   callout, checklist, enlace relativo y HTML como `<p onclick="void 0">texto</p>`,
   `<script>void 0</script>` y `<a href="javascript:void 0">x</a>`. Confirmar Markdown
   útil preservado y scripts/handlers/protocolos peligrosos retirados en la vista.
   Si se dispone de inspector, usar el entorno autorizado existente; no habilitar
   depuración en una release de usuarios para esta tarea.
4. Comprobar apertura/reapertura offline, edición/persistencia y navegación habitual
   por materias/fechas/papelera. Verificar exportación ZIP sin reemplazar datos;
   cualquier importación requiere copia sintética y espacio expresamente autorizado.
5. Registrar dispositivo, Android/WebView, commit, identidad del APK, casos,
   resultados y confirmación. Solo después podrá decidir revisión final y autorizar
   explícitamente merge; no se atribuye esa aprobación a otra beta o PR anterior.

Durante la fase remota no se operó la app, importaron fixtures ni accedió a datos personales del
teléfono. F3, sus mediciones y la matriz RNF permanecen pendientes. El checklist
Android histórico, informe, ADR e instrucciones no cambian porque este frente no
altera sus hechos ni arquitectura; esta evidencia conserva el handoff propio sin
reescribir auditorías anteriores ni duplicar el protocolo F3.

## Despliegue local para supervisión — 2026-10-02

El autor autorizó instalar los cambios remotos en el teléfono de prueba mediante
el script habitual, sin publicación ni ampliación a una nueva versión oficial.
Se retomó la misma rama con fetch/prune y pull ff-only. No se creó otro frente.

| Identidad y control | Evidencia real |
|---|---|
| SHA fuente del APK, árbol limpio antes de compilar | `9588e0f1501495eec0ad59f6c242a4770a8f2d61` |
| Entorno local | Node 22.20.0 / npm 10.9.3; Java 21.0.10 |
| Gate local del código instalado | `npm ci` y `npm run verify`: exit 0; 61 pruebas de tooling, 76 archivos / 1156 pruebas de aplicación |
| Comando de despliegue | `npm run deploy:android -- --target SERIAL`, con el serial del único teléfono autorizado; sin `--clean` |
| Dispositivo | Samsung SM-G965F, Android 10; WebView 153.0.8010.36; serial omitido de la evidencia pública |
| Variante / metadatos del APK | Debug, `com.lumapse.app`, `0.5.0/500`, tal como los conserva el checkout y genera el script habitual |
| SHA-256 del APK instalado | `664ec48f4b144f4d19d1e88fe16c355c6656706358e31f0518b8dc4ecd147f8d` |
| Certificado SHA-256 | `5ba36ca181d954a6dbe8a4a6afdb833429feb32a3a93dae9e8313191a0c782df`, coincide con el APK previamente instalado |
| Instalación | Script exit 0; actualización sobre la instalación existente, sin desinstalar ni limpiar datos; `firstInstallTime` permanece 2026-09-13 22:18:32 y `lastUpdateTime` pasa a 2026-10-02 18:18:13 (Argentina) |
| Verificación posterior | APK recuperado del paquete instalado con el mismo SHA-256; `am start -W` devuelve `Status: ok`, actividad principal ya en primer plano y proceso existente a las 21:19:03 UTC |
| Supervisión funcional del autor | **Pendiente**: edición, render Markdown, guardado/reapertura, navegación y continuidad offline proporcionales al parche |

Este APK es un despliegue debug privado para supervisión, **no** la beta firmada y
publicada, ni una nueva release. No se publicaron artefactos, tags ni claves, ni se
modificaron metadatos de versión del repositorio. La coincidencia `0.5.0/500` no
identifica el binario histórico: para esta prueba se usan el SHA fuente, la variante
y el hash anteriores. La instrucción puntual del autor fue ejecutar el script de
pruebas existente; este despliegue no satisface la guardia de nueva versión/code
para un próximo artefacto candidato o publicado. La beta histórica y sus hashes
permanecen inmutables, y su validación en al menos tres dispositivos, confirmada
por el autor, no se reabre ni se atribuye automáticamente a estos parches.

Antes del script se compiló también un APK temporal con identificación de prueba
`0.5.1-pr21/501` mediante un init script Gradle externo al repositorio. Se abandonó
esa ruta ante la aclaración del autor: **ese APK no se instaló ni publicó**. El único
APK desplegado es el identificado en la tabla, generado por el script habitual.

No se importaron fixtures, borraron notas ni ejecutaron mediciones F3. Instalación,
apertura y gate verde no prueban por sí solos todos los flujos Android. El PR sigue
draft y sin merge hasta recibir el resultado de supervisión y la autorización
explícita del autor. Los logs y APK locales permanecen fuera del repositorio.
