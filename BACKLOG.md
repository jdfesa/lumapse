# Backlog y Deuda Técnica — Lumapse

Este documento funciona como una bandeja de entrada local para las tareas, mejoras y deuda técnica identificadas durante el desarrollo o en auditorías. Una vez que se inicia un Hito, las tareas relevantes de aquí se planifican y ejecutan.

> **Hito activo:** 05 — Testing, Calidad y Distribución
> **Hito 04:** Cerrado formalmente el 2026-06-01
> **Última actualización local:** 2026-06-01 — Cierre formal del Hito 04
> **Última auditoría del backlog:** 2026-06-01

---

## 📌 Corte actual — Cierre formal del Hito 04 2026-06-01

**Estado:** ✅ Cerrado formalmente. El Hito 04 queda concluido como bloque de Organización y UX. El cierre se realizó por implementación directa de los ajustes de menor fricción y por reclasificación explícita de funcionalidades opcionales que podían ensuciar la interfaz o sugerir capacidades que Lumapse todavía no ofrece.

**Decisiones de cierre aplicadas:**

- **RF-006 — Conteo de palabras/caracteres:** postergado. No se implementa en el MVP porque el núcleo actual de Lumapse es captura rápida de notas, no escritura con métricas editoriales. Si estudiantes reales lo solicitan después de la primera release, puede agregarse como metadato sutil calculado en UI, sin tocar SQLite.
- **RF-024 — Indicador offline/online:** postergado hasta que exista sincronización, backup o integración externa. Como Lumapse es offline-first y no depende de la red para crear, editar, buscar u organizar notas, mostrar un estado online/offline permanente podría sugerir falsamente que hay sincronización pendiente.
- **RF-022 — Onboarding carousel:** postergado. Para la primera entrega se prioriza que la app sea autoexplicativa mediante affordances, placeholders y empty states. Un onboarding obligatorio o demasiado visible agregaría fricción antes de tomar la primera nota.
- **Coach marks contextuales:** descartados para Hito 04 y movidos a feedback post-release. Las burbujas de primera vez pueden ser útiles, pero también interrumpen una experiencia mobile-first que busca ser directa.
- **DP-006 — Guía Markdown / Ayuda:** postergada para integrarse, si corresponde, con `RF-023 — Acerca de` en Hito 05. Lumapse no debe sentirse como un tutorial de Markdown; el usuario puede escribir texto plano sin aprender sintaxis.
- **Empty states amigables:** implementados como pulido de UX sin agregar pantallas nuevas. Feed, búsqueda, fechas, archivo y materia vacía ahora comunican mejor qué ocurre y cuál es el siguiente gesto natural.
- **Gráficos de base de datos:** quedan diferidos al cierre documental final, una vez congelado el modelo. La decisión no bloquea Hito 04 porque no implica deuda funcional ni inconsistencia del schema/DBML actual.

**Criterio de cierre:** Hito 04 se cierra sin sumar UI innecesaria. Las decisiones se basan en la filosofía del producto: tomador de notas sin fricción, offline-first, mobile-first, sin sincronización todavía y abierto a incorporar mejoras cuando exista evidencia de adopción real por estudiantes.

**Siguiente prioridad recomendada:** iniciar Hito 05 con foco en release: `verify`, release dry-run, APK firmado, pruebas manuales en Android y actualización final de artefactos de distribución.

---

## 📌 Corte actual — Fechas Académicas Discretas 2026-05-31

**Estado:** ✅ Completado. Se implementó RF-027 / HU-027 / DP-007 como funcionalidad discreta integrada al Heatmap, manteniendo a Lumapse como app de toma de notas y evitando convertirla en agenda general.

**Cambios aplicados:**

- Nueva tabla SQLite `academic_events`, migraciones idempotentes, CRUD bajo nivel y servicio de dominio.
- Store reactivo para cargar, crear, editar, eliminar, consultar por mes y consultar próximas fechas.
- Iconografía SVG minimalista para tipos académicos (`parcial`, `final`, `tp`, `exposicion`) sin emojis nativos en la UI de fechas.
- Dots discretos en Heatmap, mini-card de eventos del día seleccionado y botón "Agregar fecha".
- Modal accesible para crear/editar fechas académicas, con validación inline, Escape, foco controlado y sin diálogos nativos.
- Bloque colapsable de próximas fechas, visible solo si hay eventos futuros.
- Acciones de editar/eliminar desde mini-card y próximas fechas, con confirmación accesible para eliminar.
- QA de casos límite: tema claro/oscuro, ancho mobile, muchos eventos el mismo día, días con notas sin eventos, días con eventos sin notas, materia eliminada y materia archivada atenuada.

**Comandos de verificación ejecutados:**

```bash
npm test
npm run lint
npm run build
npm run check:schema
npm run check:dbml
npm run check:traceability
npm run quality
```

**Resultado:** 490 tests OK, lint OK, build OK, schema/DBML/trazabilidad sincronizados y quality gate completo OK. Quedan como deuda general no bloqueante los avisos históricos del auditor sobre archivos >250 LOC y TODO técnicos existentes del editor/slash commands.

**Siguiente prioridad recomendada:** decidir si se cierra formalmente este bloque como incremento de Hito 06 anticipado o si se lo agrupa dentro del cierre final del producto antes de distribución.

---

## 📌 Decisión de estado — Hitos 04/05 2026-06-01

**Estado formal:** Hito 04 queda **cerrado formalmente**. Los pendientes opcionales de cierre fueron resueltos por implementación mínima (empty states) o por decisión explícita de postergación/descarte para proteger la filosofía de Lumapse.

**Clasificación de la automatización reciente:** GitHub Actions, quality gate, comandos npm de auditoría y smoke tests Android pertenecen a **preparación técnica del Hito 05**, aunque se hayan implementado antes del cierre formal del Hito 04. Esto evita mezclar alcance UX/producto con alcance de testing/distribución.

**Regla operativa:** desde este corte, las nuevas tareas deben clasificarse como Hito 05, Hito 06 o backlog post-release. No reabrir Hito 04 salvo corrección crítica de documentación histórica.

---

## 📌 Corte actual — Preparación Hito 05: Quality Gate y CI 2026-05-26

**Estado:** ✅ Completado. Se cerró la capa pendiente del `TODO` raíz orientada a automatización y se reclasifica como preparación del Hito 05: los scripts internos quedaron expuestos como comandos npm, GitHub Actions dejó de correr solo lint y se agregó una guardia específica contra diálogos nativos no permitidos.

**Cambios aplicados:**

- `package.json`: nuevos scripts `quality`, `verify`, `check:session`, `check:health`, `check:size`, `check:a11y`, `check:native-dialogs`, `check:traceability`, `check:docs`, `check:schema`, `check:dbml`, `check:subjects` y `deploy:android`.
- `.github/workflows/lint.yml`: renombrado a `CI — Quality Gate`; ahora corre lint, tests, build, bundle budget, check de diálogos nativos, trazabilidad, links, schema, DBML, jerarquía de materias y a11y estática.
- `scripts/check-native-dialogs.js`: nuevo check que falla si aparece `alert(`, `confirm(` o `prompt(` en `src/`, excluyendo `src/utils/seeder.js`.
- `scripts/check-traceability.py`: entrypoint estable para el checker preservado en `check-traceability.py.replaced`, manteniendo compatibilidad con documentación y CI.
- `android/app/src/test/java/com/lumapse/app/LumapseUnitTest.java` y `android/app/src/androidTest/java/com/lumapse/app/LumapseInstrumentedTest.java`: reemplazo de los tests generados por template que referenciaban `com.getcapacitor.myapp`/`com.getcapacitor.app`.

**Comandos de verificación ejecutados:**

```bash
npm run check:native-dialogs
npm run check:traceability
npm run check:dbml
./gradlew testDebugUnitTest
```

**Resultado:** check de diálogos OK, trazabilidad OK, DBML sincronizado y test unitario Android OK. La tarea de actualizar gráficos de base de datos queda explícitamente postergada para el cierre final del Hito 04, tal como fue definido.

**Siguiente prioridad recomendada:** continuar con Hito 05: release dry-run, APK firmado, validación manual en Android y actualización final de artefactos de distribución.

---

## 📌 Corte actual — Integridad de Datos en Cascadas 2026-05-26

**Estado:** ✅ Completado. Se agregó una suite de invariantes para proteger que las notas activas no queden invisibles en los flujos de archivo/restauración, y se envolvieron las operaciones críticas de materias/secciones en transacciones SQLite explícitas.

**Cambios aplicados:**

- `src/services/sqlite/connection.js`: nuevo helper `runTransaction()` con `beginTransaction`, `commitTransaction` y `rollbackTransaction`.
- `src/services/sqlite/notes.js` y `src/services/sqlite/subjects.js`: las escrituras internas desactivan la transacción implícita de `db.run()` cuando ya hay una transacción explícita activa.
- `SubjectService.crud.js` y `SubjectService.trash.js`: cascadas de archivar, desarchivar, eliminar y restaurar materias/secciones ahora son atómicas.
- `tests/unit/store/noteVisibilityInvariants.test.js`: invariantes de visibilidad para evitar pérdida aparente de notas.
- `scripts/deploy-android.sh`: deploy Android ahora preserva SQLite por defecto; `--clean` borra datos de forma explícita y `--target <deviceId>` evita el selector interactivo de Capacitor.
- `scripts/README.md`: documentado el nuevo flujo operativo del deploy, cuándo usar `--clean` y cuándo evitarlo.

**Comandos de verificación ejecutados:**

```bash
npm run test -- tests/unit/store/noteVisibilityInvariants.test.js
npm run test -- tests/unit/services/sqlite/connection.test.js tests/unit/services/sqlite/notes.test.js tests/unit/services/sqlite/subjects.test.js tests/unit/SubjectService.test.js
npm test
npm run lint
npm run build
bash scripts/check-file-size.sh
bash scripts/deploy-android.sh --help
```

**Resultado:** tests focalizados OK, suite completa OK (371 tests), lint OK, build OK, guardia de tamaño sin archivos en `[PELIGRO]` y ayuda del script de deploy verificada.

---

## 📌 Corte actual — Refactorización LOC 2026-05-23

**Estado verificado:** el bloqueo técnico por archivos >400 LOC quedó resuelto mediante splits mecánicos sin cambio funcional. Los módulos públicos mantienen sus rutas/imports principales mediante barrel files o imports CSS nativos.

**Archivos reorganizados:**

- `src/services/SubjectService.js` → barrel + `SubjectService.validation.js`, `SubjectService.crud.js`, `SubjectService.trash.js`.
- `src/components/NoteList.js` → clase reducida + `NoteCardRenderer.js`, `TrashView.js`.
- `src/components/NoteList.css` → contenedor feed + `NoteCard.css`, `TrashView.css`.
- `src/styles/drawer.css` → base drawer + `drawer-subjects.css`, `drawer-trash.css`.
- `src/layout/drawerController.js` → orquestador + `drawerSubjects.js`, `drawerTheme.js`.

**Comandos de verificación ejecutados:**

```bash
npm run build
npm run test
bash scripts/check-file-size.sh
npm run lint
```

**Resultado:** build OK, 294 tests passing, 0 archivos en `[PELIGRO]` por tamaño, lint sin errores. Quedan 3 `[AVISO]` >250 LOC (`NoteCard.css`, `NoteList.js`, `drawerSubjects.js`) y 1 warning de complejidad en el delegador de clicks de `NoteList.js`.

---

## 📌 Corte anterior — Bug de Checkboxes Interactivos (Resuelto 2026-05-26)

**Estado:** ✅ Resuelto (2026-05-26). Se solucionó implementando un mapa de promesas pendientes para bloquear toques múltiples rápidos, previniendo el comportamiento nativo del browser, realizando el toggle visual directo y usando `NoteStore.updateNoteSilent` con un bloque catch/finally para rollback y desbloqueo. Adicionalmente se migró el identificador `data-line` para que mapee el número de línea real del Markdown en lugar de un índice secuencial del HTML.

**Detalle del problema:**
- Al tocar un checkbox, el evento de click es interceptado por un manejador delegado en `FeedActionRouter.js` que modifica de forma asíncrona la nota en SQLite.
- Al actualizarse el store, se dispara una notificación que fuerza un re-renderizado completo de la lista de tarjetas (`NoteList.js` usando `innerHTML`).
- Este re-renderizado destruye y recrea todo el DOM de las tarjetas a mitad de la interacción táctil en WebViews de Capacitor (Android), causando "ghost clicks", duplicación de eventos y toques fantasmas.
- Intentos de resolverlo interceptando el click y aplicando actualizaciones silenciosas o bloqueando la propagación resultaron en la pérdida completa de interactividad (checkboxes que ya no responden).

**Tareas de resolución pendientes (Hito 05 / Próxima sesión):**
- Rediseñar el flujo de actualización de la UI para que los cambios en checkboxes actualicen quirúrgicamente el DOM de la tarjeta específica sin forzar un re-renderizado completo de toda la lista.
- Agregar soporte para `event.preventDefault()` y control manual del estado visual en mobile para evitar que la acción por defecto del navegador WebView interfiera.
- Implementar un mecanismo de bloqueo temporal de interacción (locks/debounce) durante la persistencia asíncrona en SQLite.
- (Opcional) Reemplazar la asignación secuencial `data-line` (calculada en HTML sanitizado) por una referencia directa a la línea real del Markdown en `MarkdownService.js`.

---

## 📌 Corte histórico — Auditoría 2026-05-20

**Estado verificado en ese corte:** la base técnica para avanzar con materias ya estaba lista. SQLite estaba implementado, el schema real y la documentación DDL estaban sincronizados, el DBML generado desde código coincidía con el archivo documentado, la trazabilidad RF/HU/ADR no presentaba advertencias, y el README de scripts ya documentaba las herramientas principales.

**Comandos de verificación ejecutados:**

```bash
python3 scripts/check-traceability.py
python3 scripts/check-schema-sync.py
python3 scripts/generate-dbml-from-code.py --check
python3 scripts/generate-velocity-report.py
python3 scripts/validate-subjects-hierarchy.py
python3 scripts/analyze-complexity.py
python3 scripts/project-metrics.py
```

**Hallazgos relevantes para planificar en ese momento:**

- El schema ya incluye `subjects`, `subjects.parentSubjectId`, `subjects.archived`, `subjects.color` y `notes.subjectId`, pero todavía falta exponer CRUD de materias y la UI de asignación/filtro.
- `analyze-complexity.py` marcaba el servicio SQLite monolítico y `src/components/NoteList.js` como puntos de complejidad. Ese riesgo fue mitigado parcialmente con la refactorización posterior en módulos bajo `src/services/sqlite/`, `SubjectService.*`, `NoteStore.*`, `NoteCardRenderer` y `TrashView`.
- La documentación principal ya fue sincronizada en `README.md`, `CHANGELOG.md`, `BACKLOG.md` e informe final. Quedan pendientes específicos de cierre: seguimiento de velocidad, versionado `package.json`/`package-lock.json` y actualización final de gráficos de base de datos.

---

## 🎯 Próximos 3 Pasos (siguiente sesión)

Estos son los bloques recomendados para continuar. La prioridad es mantener trazabilidad, cerrar Hito 04 con evidencia y dejar Hito 05 listo para testing/distribución.

| Orden | Bloque | Objetivo | Criterio de cierre |
|---|---|---|---|
| 1 | ~~**Resolución de Checkboxes Interactivos**~~ | ✅ Completado (2026-05-26) | Solucionado de raíz usando preventDefault, lock map y mapeo a líneas reales en lugar de índices secuenciales. |
| 2 | ~~**Diálogos de Confirmación y Modo Enfoque**~~ | ✅ Completado (2026-05-26) | Modal `ConfirmDialog` accesible, reemplazo de confirm/alert nativos y Modo Enfoque fullscreen con botón de encoger. |
| 3 | ~~**Integridad de datos en cascadas**~~ | ✅ Completado (2026-05-26) | Invariantes de visibilidad agregadas y cascadas de materias/secciones protegidas por transacciones SQLite. |
| 4 | ~~**Deploy Android seguro**~~ | ✅ Completado (2026-05-26) | `deploy-android.sh --target <deviceId>` y `--clean` documentados; el script falla si hay múltiples dispositivos sin target. |
| 5 | ~~**Cierre funcional/documental Hito 04**~~ | ✅ Completado (2026-06-01) | RF-006/RF-024/RF-022/DP-006 evaluados con decisión explícita, empty states pulidos y README/estado de hito actualizados. |
| 6 | ~~**Preparación CI documental**~~ | ✅ Completado (2026-05-26) | Workflow `CI — Quality Gate` ejecuta lint, tests, build, bundle budget, trazabilidad, doc links, schema sync, DBML check, jerarquía de subjects, a11y y check de diálogos nativos. |

---

## 🗂️ Historial y plan detallado del Hito 04

### ~~Paso 1: Offline estricto — Fuentes locales + limpieza PWA~~ ✅ Completado (2026-05-16)

**Módulo:** Mobile-first / Offline-first
**Refs:** RNF-009, RNF-012, ADR-005

**Resumen:** Se descargó JetBrains Mono (woff2 variable, subsets latin + latin-ext) a `public/fonts/`, se reemplazó el `@import` CDN por `@font-face` locales en `main.css`, y se actualizó `vite.config.js` para incluir `woff2` en el precache del Service Worker (10 entries, 245 KiB).

- [x] Descargar `JetBrains Mono` (woff2, pesos 400-700 variable) a `public/fonts/`.
- [x] Reemplazar el `@import` remoto en `main.css` por `@font-face` locales.
- [x] Agregar `woff2` al `globPatterns` de `vite-plugin-pwa` en `vite.config.js`.
- [x] Verificar que `npm run build` incluye las fuentes en `dist/fonts/` y en el precache del SW.

---

### ~~Paso 2: Funcionalidad "Fijar" (Pin) y "Archivar" en el menú contextual~~ ✅ Completado (2026-05-17)

**Módulo:** Captura de notas / Core
**Refs:** RF-013 (organización), Hito 04

**Resumen:** Se implementó Pin y Archivar end-to-end: upgrade de IndexedDB a v2 con backfill de campos, acciones en NoteStore, botones en el dropdown del menú contextual, indicador visual de pin, y toggle "Ver archivadas" en el drawer.

- [x] **NoteService.js:** Schema v2 con campos `pinned` y `archived`. Backfill automático de notas existentes.
- [x] **NoteStore.js:** Acciones `togglePin()`, `toggleArchive()`, `setShowArchived()`. `getFilteredNotes()` filtra archivadas y ordena pinned al tope.
- [x] **NoteList.js:** Botones Fijar/Archivar en dropdown con labels dinámicos (Fijar/Desfijar, Archivar/Desarchivar). Indicador visual pin (ícono + borde izquierdo).
- [x] **main.js / Drawer:** Botón "Ver archivadas" / "Ver notas activas" con estilo activo.
- [x] Verificado visualmente: pin sube al tope, archivar oculta, vista archivadas funciona, toggle ida/vuelta correcto.

---

### ~~Paso 3: Sincronizar documentación viva con el estado real del código~~ ✅ Completado (2026-05-17)

**Módulo:** Documentación / Trazabilidad
**Refs:** Auditoría 2026-05-14

**Resumen:** Se cerró la brecha entre código y documentación actualizando todos los documentos vivos del proyecto.

- [x] **`requisitos-funcionales.md`:** RF-009/RF-021 marcados como Obsoleto (ADR-005). RF-013 actualizado a Pin/Archivar (implementado). RF-015 y RF-020 marcados como Implementado.
- [x] **`CHANGELOG.md`:** Sección `[0.4.0]` completada con todas las features del Hito 04: Pin/Archivar, búsqueda, heatmap, menú contextual, fuentes offline, UI Notion/Obsidian, remoción PWA.
- [x] **KI `lumapse_context.md`:** Actualizada estructura de archivos (android/, public/fonts/, Heatmap, hito-00), inconsistencias de auditoría marcadas como resueltas.
- [x] **`README.md`:** Limpiadas referencias a PWA plugin en estructura de carpetas y descripción de Hito 01.

---

### ~~Paso 4: Modo oscuro / modo claro con toggle (RF-019)~~ ✅ Completado (2026-05-18)

**Módulo:** UX / Diseño visual
**Refs:** RF-019, Hito 04

**Resumen:** Se implementó una paleta de tema claro (estilo Notion cálido) usando custom properties sobre `[data-theme="light"]` y se reemplazaron todos los valores rgba hardcodeados por variables. Se añadió el `ThemeService` modular con persistencia en `localStorage` y toggle en el drawer.

- [x] **`main.css`:** Crear set de CSS Custom Properties para `:root` (oscuro, actual por defecto) y `[data-theme="light"]` (claro). No duplicar reglas: solo sobrescribir los tokens de color.
- [x] **main.js / Drawer:** Agregar botón toggle en el drawer con ícono sol/luna. Persistir preferencia en `localStorage`.
- [x] **NoteList.css / NoteEditor.css / Heatmap.css:** Verificar que todos los componentes usan tokens (`var(--color-*)`) y no valores hardcodeados. Corregir si hay alguno.
- [x] **Verificación visual:** Testear ambos modos en el navegador (desktop y responsive mobile).

---

### ~~Paso 5: Capacitor sync y validación en dispositivo Android~~ ✅ Completado (2026-05-18)

**Módulo:** Infraestructura / Mobile
**Refs:** ADR-005, RNF-009, Hito 04

**Resumen:** Se reconstruyó el APK local, se validó el funcionamiento nativo en dispositivo real (Samsung S7) utilizando scrcpy. Se detectó y documentó el problema de caché persistente de WebView durante despliegues in-place, ajustando el flujo de desarrollo oficial.

- [x] `npm run build` → verificar que `dist/` contiene todos los assets (HTML, CSS, JS, fuentes, íconos).
- [x] `npx cap sync android` → sincronizar el contenido web con el proyecto Android.
- [x] Instalar en dispositivo real (S7) usando `cap run android` y visualizar vía scrcpy.
- [x] Documentar cualquier issue específico de Capacitor/Android que surja (caché persistente de WebView abordado actualizando el flujo con desinstalación limpia).

---

### ~~Paso 6: Deuda documental — HU de Hitos 03/04 + actualizar modelo de dominio~~ ✅ Completado (2026-05-18)

**Módulo:** Documentación / Trazabilidad
**Refs:** Auditoría 2026-05-14, Deuda técnica documentación

**Resumen:** Se cerró la brecha entre código y documentación académica: se redactaron 5 nuevas Historias de Usuario (HU-007 a HU-011, 26 SP), se actualizó el modelo de dominio eliminando la entidad Tag y agregando ThemeService, se corrigieron los casos de uso (PWA→APK, Tags→Pin/Archivar, SW→Tema) y se actualizó el informe del Hito 04 con el avance real.

- [x] **`historias-de-usuario.md`:** HU-007 a HU-011 redactadas con criterios de aceptación, SP y trazabilidad.
- [x] **`modelo-dominio.md`:** Entidad Note actualizada (pinned, archived), Tag eliminada, ThemeService agregada, schema IndexedDB v2.
- [x] **`casos-de-uso.md`:** UC-06/07 (Tags→Pin/Archivar), UC-13 (PWA→APK), UC-15 (SW→Tema). Actor SW→Capacitor.
- [x] **`hito-04-agosto.md`:** Tabla de RF/UX completa con 15 ítems y estado de avance real.

---

### ~~Paso 7: Hardening de seguridad XSS en MarkdownService~~ ✅ Completado (2026-05-19, rev. 2: 2026-05-23)

**Módulo:** Core / Seguridad
**Refs:** Deuda técnica (Auditoría 2026-05-14), MarkdownService.js
**Estimado:** ~30 min

**Resumen (rev. 2):** Política quirúrgica de `<img>`: se permiten imágenes con `src` local (`data:`, `blob:`, rutas relativas) y se bloquean URLs externas (`http://`, `https://`) para prevenir tracking por pixel espía sin quitarle funcionalidad al usuario. Defensa en profundidad de dos capas: (1) DOMPurify con hook `afterSanitizeAttributes` que filtra selectivamente `src` en `<img>`, y (2) CSP meta tag en `index.html` que restringe `img-src` a `'self' data: blob: capacitor://localhost http://localhost` a nivel de WebView. 15 tests de seguridad automatizados verifican la política.

**Tareas:**
- [x] **`MarkdownService.js`:** Revisar `ALLOWED_TAGS` y `ALLOWED_ATTR`. ~~Evaluar si `img` debe mantenerse o eliminarse.~~ → Rev. 2: `<img>` permitido con src local, bloqueado con src externo.
- [x] **`index.html`:** Agregar meta tag `Content-Security-Policy` como segunda capa de defensa (CSP).
- [x] **Test manual:** Crear una nota con payload `![test](https://externo.com/pixel.png)` y verificar que la imagen NO se carga (Network tab vacío).
- [x] **Tests automatizados:** 15 tests de seguridad en `MarkdownService.test.js` verifican la política de dos capas.
- [x] **Documentar:** Agregar comentario en el código justificando la decisión de seguridad (rev. 2 actualizado).

**Criterio de cierre:** No se realizan peticiones HTTP externas al renderizar Markdown. Imágenes locales (data:, blob:, relativas) funcionan correctamente. La sanitización está documentada en el código y reforzada por CSP a nivel de infraestructura.

---

### ~~Paso 8: Migración de persistencia a SQLite~~ ✅ Completado (2026-05-20)

**Módulo:** Core / Persistencia
**Refs:** ADR-002 (extensión), Hito 04/05
**Estimado:** ~1-2 sesiones

IndexedDB cumplió su rol para el MVP, pero la migración a SQLite vía `@capacitor-community/sqlite` es necesaria antes de implementar categorización por materias (Paso 9). SQLite ofrece queries relacionales (JOIN, FK), mejor rendimiento con volumen de datos, y es nativo en el contenedor Capacitor.

**Tareas:**
- [x] **Instalar dependencia:** `@capacitor-community/sqlite` + `npx cap sync`.
- [x] **Crear servicio SQLite:** Abstracción sobre el plugin con métodos equivalentes a los actuales de `NoteService` (CRUD, getAll, search). Actualmente refactorizado en módulos bajo `src/services/sqlite/`.
- [x] **Definir schema SQL:** Tabla `notes` con columnas `id`, `title`, `content`, `pinned`, `archived`, `created_at`, `updated_at`. Tabla `subjects` (preparación para Paso 9).
- [x] **Migrar datos:** Script de migración one-time que lee las notas de IndexedDB y las inserta en SQLite al primer arranque post-actualización.
- [x] **Actualizar `NoteStore.js`:** Reemplazar las llamadas a `NoteService` (IndexedDB) por el nuevo `SqliteService`.
- [x] **Eliminar dependencia `idb`:** `npm uninstall idb`. Limpiar imports.
- [x] **Verificar en dispositivo:** Build + deploy en S7 (`./scripts/deploy-android.sh`). Validar CRUD, pin, archivar, búsqueda.
- [x] **Documentar:** Redactar ADR-006 justificando la migración. Actualizar `modelo-dominio.md`.

**Criterio de cierre:** La app funciona exclusivamente con SQLite. IndexedDB ya no se usa. Los datos existentes se migran sin pérdida. APK funcional en dispositivo.

---

### ~~Paso 9: Categorización por materia (DP-002 / DP-004) — Modelo + UI~~ ✅ Completado (2026-05-20)

**Módulo:** Organización / Feature nueva
**Refs:** DP-002, DP-004, RF-014, encuesta P12 (69.2% carpetas)
**Estimado:** ~1-2 sesiones
**Dependencia:** Paso 8 (SQLite debe estar implementado)

La encuesta de validación confirmó que el 69.2% de los estudiantes prefiere organizar por carpeta/materia. Este paso implementa la estructura de carpetas como sistema de organización principal, aprovechando las capacidades relacionales de SQLite. Adicionalmente, se añade el renombrado inline directo desde el drawer para materias y secciones.

**Estado base:** el servicio SQLite ya crea las tablas `subjects`, `notes` y `metadata`. El campo `notes.subjectId` y la jerarquía `subjects.parentSubjectId` ya existen en el schema, pero aún no hay servicio/UI para que el usuario los use.

**Tareas:**
- [x] **`SubjectService.js`:** CRUD de materias/secciones (`id`, `name`, `parentSubjectId`, `archived`, `color`, `createdAt`). Validar nombre requerido, nombre único por nivel, y profundidad máxima 2 niveles (DP-004).
- [x] **Servicio SQLite:** Exponer operaciones para `subjectId` en `createNote()`/`updateNote()`, queries `getNotesBySubject(id)`, `getInboxNotes()` y conteos por materia para el drawer.
- [x] **`NoteStore.js`:** Agregar estado `subjects`, `activeSubjectId`, filtros Entrada/Materia/Archivo, y acciones para crear/editar/archivar materias.
- [x] **UI — Drawer:** Sección Materias con listado, botón crear, selector activo, estado vacío, colores y conteo de notas.
- [x] **UI — Composer/Editor:** Selector de materia al crear/editar nota. Mantener "Entrada" como default cuando `subjectId` es `NULL`.
- [x] **UI — Feed:** Indicador visual de materia en cada tarjeta de nota (badge de color) y badge de Archivada.
- [x] **Edición inline (Refinamiento):** Agregar funcionalidad para renombrar materias y secciones (RF-014) desde el drawer, con edición inline, auto-guardado en blur/Enter y cancelación con Escape.
- [x] **Validación offline:** Ejecutar `python3 scripts/validate-subjects-hierarchy.py` contra una base mock/exportada y verificar que no hay huérfanos, ciclos ni profundidad > 2.
- [x] **Verificar en dispositivo:** Build + deploy en S7 y testeo de UI.
- [x] **Documentar:** Actualizar RF-014, HU asociada, modelo de dominio, casos de uso, DDL/DBML si cambia el schema, README, CHANGELOG y cheatsheet.

**Criterio de cierre:** El usuario puede crear materias, asignar notas a una materia, filtrar el feed por materia y renombrarlas inline desde el drawer. La funcionalidad persiste en SQLite y está verificada en el dispositivo.

---

### Paso 10: Cierre funcional y documental del Hito 04

**Módulo:** UX / Documentación / Gestión
**Refs:** RF-006, RF-022, RF-024, Hito 04
**Estimado:** ~1 sesión
**Dependencia:** Paso 9 idealmente cerrado o en revisión.

**Tareas:**
- [x] **Branding visual de Lumapse:** Integrar logotipos reales e íconos en Android (launcher icons y splash screens) y en la UI web (header/drawer) eliminando la marca genérica de Capacitor.
- [x] **RF-006 — Conteo de palabras/caracteres:** postergado por decisión de diseño (2026-06-01). No se implementa como contador visible en el MVP para evitar ruido en el editor. Si la comunidad estudiantil lo solicita, puede agregarse luego como metadato sutil calculado en UI.
- [x] **RF-024 — Indicador offline/online:** postergado por decisión de producto (2026-06-01). Sin sincronización, backup o integraciones externas, mostrar un chip de red no cambia ninguna acción del usuario y puede inducir una expectativa falsa de sincronización.
- [x] **RF-022 — Onboarding carousel (3 pantallas + saltar):** postergado por decisión de diseño (2026-06-01). La primera release prioriza una experiencia autoexplicativa y sin fricción; se evaluará con feedback real si hace falta un onboarding más explícito.
- [x] **Empty states amigables:** Mensajes visuales y cálidos para pantallas vacías (feed sin notas, materia sin notas, búsqueda sin resultados, fechas sin notas y archivo vacío), sin agregar pantallas ni pasos extra.
- [x] **Coach marks contextuales (tooltips de primera vez):** descartados para Hito 04 y movidos a evaluación post-release. La guía emergente puede interrumpir el flujo mobile-first de captura rápida.
- [x] **Archivar materia/sección completa con cascada:** Permitir archivar una materia o sección entera de un solo toque, heredando dinámicamente visibilidad sin modificar el estado individual de notas y previniendo su pérdida (cascada pura sobre subjects). Drawer migrado a menú contextual y optimizaciones en store.
- [x] **Guía de Markdown accesible desde Ayuda (DP-006):** postergada para integrarse, si corresponde, con `RF-023 — Acerca de` en Hito 05. Lumapse debe funcionar como app de notas de texto plano sin exigir aprendizaje de Markdown.
- [x] **README principal:** sincronizar stack y roadmap con el estado real post-SQLite, reemplazando referencias obsoletas a IndexedDB. Completado 2026-05-26.
- [x] **Seguimiento de velocidad:** ✅ Completado (2026-05-26). `docs/gestion/seguimiento-velocidad.md` quedó sincronizado con `python3 scripts/generate-velocity-report.py` (17 HU, 78 SP, 26.0 SP/hito).
- [x] **Versionado:** ✅ Completado (2026-05-26). `package.json` y `package-lock.json` alineados a `0.4.7`, la última versión cerrada documentada en `CHANGELOG.md`.
- [x] **Informe final:** crear README de flujo por secciones, completar capítulos fuente iniciales y regenerar `INFORME-FINAL-COMPLETO.md`. Completado 2026-05-26.
- [x] **Cheatsheet de defensa:** actualizado con las decisiones de cierre de Hito 04 y el criterio de postergación intencional.

**Criterio de cierre:** Hito 04 cerrado formalmente el 2026-06-01. Documentación, backlog, requisitos y métricas reflejan el estado real; las tareas que podrían agregar ruido visual quedan postergadas con justificación explícita.

---

### ~~Paso 11: Preparación Hito 05 — Testing automatizado y CI de auditorías~~ ✅ Completado (2026-05-22)

**Módulo:** Testing / DevOps
**Refs:** Hito 05, deuda técnica testing
**Completado:** Suite Vitest implementada. 294 tests, 9 archivos, 90.15% cobertura statements, 93.91% funciones.

- [x] **Instalar/configurar Vitest:** `vitest.config.js` separado del config de Vite, con cobertura V8 y entorno jsdom. Scripts `test`, `test:watch`, `test:coverage`, `test:ui` en `package.json`.
- [x] **Tests prioritarios:** Cobertura completa de `ThemeService` (100%), `MarkdownService` (96%), `noteFilters` (100%), `SubjectService` (validaciones DP-004), `sqlite/notes`, `sqlite/subjects`, `sqlite/connection`, `NoteStore.data`, `NoteStore.ui`.
- [x] **CI documental:** ✅ Completado (2026-05-26). `.github/workflows/lint.yml` fue ampliado como `CI — Quality Gate` y ejecuta `check:traceability`, `check:docs`, `check:schema`, `check:dbml` y `check:subjects`, además de lint, tests, build, bundle budget, a11y y diálogos nativos.
- [ ] **Release dry-run:** usar `python3 scripts/release-helper.py --type patch --dry-run` para validar que el flujo de release está listo antes de generar un APK real.

---

## 📝 Deuda Técnica — Documentación y Diseño

- [x] ~~**Historias de Usuario (Hitos 03 y 04):**~~ ✅ Completado (2026-05-18). HU-007 a HU-011 redactadas con criterios de aceptación, SP y trazabilidad.
- [x] ~~**Actualizar Modelo de Dominio y Casos de Uso:**~~ ✅ Completado (2026-05-18). Entidad Tag eliminada, campos pinned/archived agregados, casos de uso corregidos (PWA→APK, Tags→Pin/Archivar).
- [x] **Sincronizar README principal post-SQLite:** ✅ Completado (2026-05-26). El stack presenta SQLite como persistencia actual e IndexedDB queda como antecedente histórico/migración legacy.
- [x] **Actualizar seguimiento de velocidad:** ✅ Completado (2026-06-01). El documento refleja las HU reales actuales, registra el cierre formal del Hito 04 y activa operativamente el Hito 05.
- [ ] **Revisar documentos generados:** regenerar informe completo y cheatsheet cuando se cierren nuevos cambios, para evitar que los artefactos finales queden con métricas anteriores.
- [ ] **Manual de usuario:** evaluar en Hito 05/06 un documento breve solo si la primera release evidencia fricción real de uso. No bloquear el cierre de Hito 04 con documentación que duplique la UI.
- [x] ~~**Documentar Papelera de Reciclaje (Hito 04):**~~ ✅ Completado (2026-05-22). Añadido RF-026 y HU-016 (8 SP, 6 CA). Actualizado `CHANGELOG.md`, `modelo-dominio.md` (reescrito con Subject, deletedAt, statusEmoji, SQLite), DBML, DDL, normalización, y casos de uso (UC-16).
- [ ] **Actualizar gráficos de base de datos:** Los gráficos exportados del diagrama Entidad-Relación (notación Chen) y el modelo lógico relacional han quedado desactualizados tras la adición de `deletedAt`, `statusEmoji` y `academic_events`. Se difiere al cierre documental final para regenerarlos una sola vez con el modelo congelado.

## 💻 Deuda Técnica — Código y Arquitectura

- [x] **🔴 ~~Eliminar `vite-plugin-pwa` y artefactos PWA:~~** ✅ Completado (2026-05-17). Se removió `vite-plugin-pwa` (289 paquetes), `public/manifest.json`, config `VitePWA()` de `vite.config.js`, `<link rel="manifest">` de `index.html`, y referencias PWA en `package.json`. Build limpio: sin `sw.js`, sin `registerSW.js`.
- [x] ~~**Seguridad (XSS en Markdown):**~~ ✅ Resuelto (2026-05-19, Paso 7). `img` y `src` eliminados de whitelist DOMPurify. Agregados `FORBID_TAGS`, `FORBID_ATTR` y hook `afterSanitizeAttributes`.
- [x] **Assets Manifest:** Agregar los íconos requeridos (`icon-192.png`, `icon-512.png`) en `public/icons/` para cumplir con las validaciones del `manifest.json`.
- [x] ~~**Bloqueo técnico inmediato del Quality Gate — split de `NoteList`/drawer:**~~ ✅ Completado (2026-05-23). Se resolvieron los archivos en `[PELIGRO]` >400 LOC mediante splits mecánicos, preservando comportamiento e imports públicos. `check-file-size.sh` reporta 0 `[PELIGRO]`.
- [x] ~~**Refactor de archivos grandes (Deuda Técnica detectada):**~~ ✅ Completado (2026-05-23). Se separaron `SubjectService`, `NoteList`, `NoteList.css`, `drawer.css` y `drawerController` en submódulos especializados. Verificado con `npm run build`, `npm run test`, `bash scripts/check-file-size.sh` y `npm run lint`.
- [x] **Reducir complejidad restante de `NoteList.js`:** ✅ Completado (2026-05-25). Se extrajo el handling de clicks al router especializado `FeedActionRouter.js`, reduciendo la complejidad ciclomática de 19 a < 10 y aprobando los límites de ESLint.
- [x] ~~**UI para sub-secciones de Materias (Profundidad > 0):**~~ ✅ Completado (Paso 9). El drawer permite crear y navegar secciones hijas, con validación DP-004, herencia de color y conteos por materia/sección.
- [x] **Manejo de Errores y Excepciones (Resiliencia):** ✅ Completado (2026-05-25). Implementados `DatabaseError` en la capa SQLite para fallos nativos y try/catch robustos en el store. Errores y notificaciones se presentan con el nuevo componente `Toast.js` sin crashear la UI.
- [x] **Optimización Extrema de Renderizado (Virtualización de DOM):** ✅ Completado (2026-05-25). Componente `VirtualFeed.js` con list virtualization, IntersectionObserver y prefix sum height cache. Resuelve el renderizado para más de 10,000 notas con 60FPS fluidos en dispositivos antiguos de testeo.
- [x] **Bug de Checkboxes Interactivos (Ghost Clicks):** ✅ Completado (2026-05-26). Corregido el problema de toques fantasma/falta de respuesta al usar un lock map para taps duplicados, preventDefault, y mapeo a línea real del markdown en vez de data-line secuencial.
- [x] **Modo Enfoque / Focus Mode (Captura sin distracciones):** ✅ Completado (2026-05-26). Implementado compositor fullscreen (`composer--focus`, `focus-mode-active`), ocultando el App Shell y el resto de la interfaz web, con botón de encoger para salir y cierre automático al guardar.
- [x] **Diálogos de Confirmación Personalizados (UX consistente):** ✅ Completado (2026-05-26). Implementado ConfirmDialog.js/css y reemplazado confirm() y alert() nativos en toda la aplicación por confirmDialog() y showErrorToast(). Tests unitarios en vitest agregados y pasando.

## ⚙️ Deuda Técnica — DevOps y Procesos

- [x] ~~**Script de trazabilidad (`check-traceability.py`):**~~ ✅ Completado (2026-05-19). Audita coherencia entre RF, HU, ADR, CHANGELOG y código fuente con 6 chequeos automáticos. Python 3.8+, sin dependencias externas.
- [x] ~~**Templates de GitHub con trazabilidad:**~~ ✅ Completado (2026-05-20). Issues y PRs piden RF/HU/ADR/Hito y checklist de trazabilidad.
- [x] ~~**Scripts académicos y operativos Tanda 2/3:**~~ ✅ Completado (2026-05-20). Quedaron documentados `check-schema-sync.py`, `assemble-report.py`, `generate-velocity-report.py`, `validate-subjects-hierarchy.py`, `generate-dbml-from-code.py`, `generate-defense-cheatsheet.py`, `export-database-bundle.py`, `run-load-tests.py` y `release-helper.py`.
- [x] **CI de scripts críticos:** ✅ Completado (2026-05-26). GitHub Actions ejecuta trazabilidad, links, schema sync, DBML check, jerarquía de materias, lint, tests, build, bundle budget, a11y y guardia contra diálogos nativos.
- [x] **Versionado del paquete:** ✅ Completado (2026-05-26). `package.json` y `package-lock.json` quedaron alineados en `0.4.7`, la última versión cerrada documentada en `CHANGELOG.md`.

## 🧪 Deuda Técnica — Testing (Crítico para Tribunal)

- [x] ~~**Suite de tests automatizados (Vitest/Jest):**~~ ✅ Completado (2026-05-22). 294 tests unitarios en 9 archivos. Cobertura 90.15% statements / 93.91% functions sobre scope crítico (servicios y store). Tests de sanitización XSS, validaciones DP-004, filtrado, store reactivo y SQL nativo.
  - `SqliteService` (operaciones CRUD y fallos): cubierto en `sqlite/notes.test.js`, `sqlite/subjects.test.js`, `sqlite/connection.test.js`.
  - `MarkdownService` (sanitización XSS): 12 tests de seguridad + 30 de sintaxis/edge cases. 
  - Lógica del `Store` (filtrado, ordenamiento, pin/archivar): `noteFilters.test.js` (100%), `NoteStore.data.test.js`, `NoteStore.ui.test.js`.
- [ ] **Tests pendientes menores (deuda post-auditoría):** Agregar 2 tests para `moveNote()` en `NoteStore.data.test.js` (líneas 65-68 sin cubrir). Eliminar clave `deleteSection` duplicada en el mock de la línea 30.

## 💡 Feedback de Producto — Sesión 2026-05-25

> **Origen:** Revisión crítica externa, que señaló el riesgo de sobreingeniería y falta de usabilidad percibida ante el tribunal. Las siguientes ideas surgieron de esa discusión y apuntan a cerrar la brecha entre la solidez técnica del proyecto y la experiencia del usuario final.

| Idea | Tipo | Prioridad | Estado | Ubicación en Backlog |
|---|---|---|---|---|
| Empty states amigables (feed, papelera, materia vacía) | UX | Alta | Completado | Paso 10 |
| Onboarding carousel — 3 pantallas + saltar (RF-022) | UX | Alta | Postergado | Hito futuro / feedback post-release |
| Coach marks contextuales (tooltips de primera vez) | UX | Media | Descartado Hito 04 | Feedback post-release |
| Archivar materia/sección completa con cascada | Funcionalidad | Alta | Completado | Paso 10 |
| Guía de Markdown opcional en Ayuda (DP-006) | UX | Media | Postergado | Hito 05 / RF-023 |

**Decisión de diseño — Notas precargadas descartadas:** Se evaluó y descartó la idea de precargar 2-3 notas de ejemplo en Markdown al primer inicio. Motivo: el usuario podría interpretar erróneamente que necesita aprender sintaxis Markdown para usar la app, cuando en realidad Lumapse funciona perfectamente con texto plano. Los empty states amigables cumplen la misma función de orientación sin generar esa fricción cognitiva.

**Decisión de diseño — Onboarding no forzado:** Se descartó la modalidad de tutorial interactivo obligatorio ("creá una nota, creá una carpeta") por generar fricción innecesaria. Se optó por un enfoque pasivo (carousel informativo + coach marks contextuales) que respeta el ritmo del usuario.

---

## 🚀 Ideas a Largo Plazo (Post-Defensa / Hitos Futuros)

- [ ] **Sincronización / Backup en la Nube (Google Drive):** Para mantener la filosofía Offline-First pero evitar la pérdida de datos si el usuario pierde el celular, agregar un botón de "Exportar/Respaldar" que comprima la base SQLite o las notas en un `.zip` y lo suba a una carpeta privada en el Google Drive del usuario mediante la API de Google (requiere setup de OAuth). Es un backup unidireccional manual, no una sincronización P2P bidireccional en tiempo real.
