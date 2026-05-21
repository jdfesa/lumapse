# Backlog y Deuda Técnica — Lumapse

Este documento funciona como una bandeja de entrada local para las tareas, mejoras y deuda técnica identificadas durante el desarrollo o en auditorías. Una vez que se inicia un Hito, las tareas relevantes de aquí se planifican y ejecutan.

> **Hito activo:** 04 — Organización y UX (Agosto 2026)
> **Último commit:** `8b3de19` — docs(scripts): documentar scripts de Tanda 3 y actualizar .gitignore
> **Última auditoría del backlog:** 2026-05-20

---

## 📌 Corte actual — Auditoría 2026-05-20

**Estado verificado:** la base técnica para avanzar con materias ya está lista. SQLite está implementado, el schema real y la documentación DDL están sincronizados, el DBML generado desde código coincide con el archivo documentado, la trazabilidad RF/HU/ADR no presenta advertencias, y el README de scripts ya documenta 29 herramientas.

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

**Hallazgos relevantes para planificar:**

- El schema ya incluye `subjects`, `subjects.parentSubjectId`, `subjects.archived`, `subjects.color` y `notes.subjectId`, pero todavía falta exponer CRUD de materias y la UI de asignación/filtro.
- `analyze-complexity.py` marca `src/services/SqliteService.js` como archivo largo y `src/components/NoteList.js` con anidamiento alto. No bloquea el avance, pero conviene abordarlo antes de que Paso 9 agrande esos módulos.
- La documentación principal todavía tiene zonas a sincronizar post-SQLite/post-scripts: `README.md`, `docs/gestion/seguimiento-velocidad.md`, versiones en `package.json`/`package-lock.json` vs `CHANGELOG.md`, y documentos que aún hablan de IndexedDB como persistencia actual.

---

## 🎯 Próximos 3 Pasos (siguiente sesión)

Estos son los 3 bloques recomendados para continuar. La prioridad es mantener trazabilidad, cerrar Hito 04 con evidencia y dejar Hito 05 listo para testing.

| Orden | Bloque | Objetivo | Criterio de cierre |
|---|---|---|---|
| 1 | **Paso 9 — Materias y secciones** | Implementar organización por materias sobre el schema SQLite ya disponible. | Crear materias/secciones, asignar notas, filtrar el feed y validar jerarquía con `validate-subjects-hierarchy.py`. |
| 2 | **Cierre funcional/documental Hito 04** | Completar RF pequeños pendientes y sincronizar documentación viva. | RF-006/RF-024 evaluados o implementados, docs actualizados, `check-traceability.py` sin advertencias. |
| 3 | **Preparación Hito 05 — Testing y CI** | Empezar suite Vitest y convertir scripts críticos en chequeos de CI. | Primeros tests unitarios + workflow que ejecute lint, trazabilidad, schema sync, DBML check y links. |

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

### ~~Paso 7: Hardening de seguridad XSS en MarkdownService~~ ✅ Completado (2026-05-19)

**Módulo:** Core / Seguridad
**Refs:** Deuda técnica (Auditoría 2026-05-14), MarkdownService.js
**Estimado:** ~30 min

**Resumen:** Se eliminó `<img>` de `ALLOWED_TAGS` y `src`/`alt` de `ALLOWED_ATTR` en DOMPurify para prevenir peticiones HTTP externas (pixel tracking, IP leaks). Se agregaron `FORBID_TAGS` y `FORBID_ATTR` como defensa en profundidad, y un hook `afterSanitizeAttributes` que bloquea `javascript:`/`data:` en hrefs y fuerza `rel="noopener noreferrer nofollow"` en enlaces externos. Verificado visualmente con payloads XSS: cero peticiones externas, cero ejecución de scripts, Markdown seguro renderiza correctamente.

**Tareas:**
- [x] **`MarkdownService.js`:** Revisar `ALLOWED_TAGS` y `ALLOWED_ATTR`. Evaluar si `img` debe mantenerse o eliminarse. Si se mantiene, agregar un hook de DOMPurify que fuerce `src` a solo data URIs o que elimine `img` por completo.
- [x] **Test manual:** Crear una nota con payload `![test](https://externo.com/pixel.png)` y verificar que la imagen NO se carga (Network tab vacío).
- [x] **Documentar:** Agregar comentario en el código justificando la decisión de seguridad.

**Criterio de cierre:** No se realizan peticiones HTTP externas al renderizar Markdown. La sanitización está documentada en el código.

---

### ~~Paso 8: Migración de persistencia a SQLite~~ ✅ Completado (2026-05-20)

**Módulo:** Core / Persistencia
**Refs:** ADR-002 (extensión), Hito 04/05
**Estimado:** ~1-2 sesiones

IndexedDB cumplió su rol para el MVP, pero la migración a SQLite vía `@capacitor-community/sqlite` es necesaria antes de implementar categorización por materias (Paso 9). SQLite ofrece queries relacionales (JOIN, FK), mejor rendimiento con volumen de datos, y es nativo en el contenedor Capacitor.

**Tareas:**
- [x] **Instalar dependencia:** `@capacitor-community/sqlite` + `npx cap sync`.
- [x] **Crear `SqliteService.js`:** Abstracción sobre el plugin con métodos equivalentes a los actuales de `NoteService` (CRUD, getAll, search).
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

La encuesta de validación confirmó que el 69.2% de los estudiantes prefiere organizar por carpeta/materia. Este paso implementa la estructura de carpetas como sistema de organización principal, aprovechando las capacidades relacionales de SQLite.

**Estado base:** `SqliteService.js` ya crea las tablas `subjects`, `notes` y `metadata`. El campo `notes.subjectId` y la jerarquía `subjects.parentSubjectId` ya existen en el schema, pero aún no hay servicio/UI para que el usuario los use.

**Tareas:**
- [x] **`SubjectService.js`:** CRUD de materias/secciones (`id`, `name`, `parentSubjectId`, `archived`, `color`, `createdAt`). Validar nombre requerido, nombre único por nivel, y profundidad máxima 2 niveles (DP-004).
- [x] **`SqliteService.js`:** Exponer operaciones para `subjectId` en `createNote()`/`updateNote()`, queries `getNotesBySubject(id)`, `getInboxNotes()` y conteos por materia para el drawer.
- [x] **`NoteStore.js`:** Agregar estado `subjects`, `activeSubjectId`, filtros Entrada/Materia/Archivo, y acciones para crear/editar/archivar materias.
- [x] **UI — Drawer:** Sección Materias con listado, botón crear, selector activo, estado vacío, colores y conteo de notas.
- [x] **UI — Composer/Editor:** Selector de materia al crear/editar nota. Mantener "Entrada" como default cuando `subjectId` es `NULL`.
- [x] **UI — Feed:** Indicador visual de materia en cada tarjeta de nota (badge de color) y badge de Archivada.
- [x] **Validación offline:** Ejecutar `python3 scripts/validate-subjects-hierarchy.py` contra una base mock/exportada y verificar que no hay huérfanos, ciclos ni profundidad > 2.
- [x] **Verificar en dispositivo:** Build + deploy en S7 y testeo de UI.
- [x] **Documentar:** Actualizar RF-014, HU asociada, modelo de dominio, casos de uso, DDL/DBML si cambia el schema, README, CHANGELOG y cheatsheet.

**Criterio de cierre:** El usuario puede crear materias, asignar notas a una materia, y filtrar el feed por materia desde el drawer. La funcionalidad persiste en SQLite.

---

### Paso 10: Cierre funcional y documental del Hito 04

**Módulo:** UX / Documentación / Gestión
**Refs:** RF-006, RF-022, RF-024, Hito 04
**Estimado:** ~1 sesión
**Dependencia:** Paso 9 idealmente cerrado o en revisión.

El Hito 04 ya tiene varias piezas implementadas (SQLite, pin/archivar, búsqueda, dark mode, responsive), pero quedan requisitos menores y documentos de gestión que deben alinearse antes de pasar fuerte a Hito 05.

**Tareas:**
- [ ] **RF-006 — Conteo de palabras/caracteres:** decidir si se implementa en `NoteEditor` como contador visible y actualizar HU/RF según corresponda.
- [ ] **RF-024 — Indicador offline/online:** decidir si se implementa como chip de estado en drawer/header usando eventos `online`/`offline`.
- [ ] **RF-022 — Onboarding:** mantener como COULD; implementar solo si no desplaza materias/testing.
- [ ] **README principal:** sincronizar stack y roadmap con el estado real post-SQLite, evitando hablar de IndexedDB como persistencia actual.
- [ ] **Seguimiento de velocidad:** actualizar `docs/gestion/seguimiento-velocidad.md` usando `python3 scripts/generate-velocity-report.py`.
- [ ] **Versionado:** alinear `package.json`/`package-lock.json` con la versión documentada en `CHANGELOG.md` antes de preparar release.
- [ ] **Informe final/cheatsheet:** regenerar `INFORME-FINAL-COMPLETO.md` y `docs/gestion/cheatsheet-defensa.md` si hubo cambios documentales relevantes.

**Criterio de cierre:** Documentación, backlog, requisitos y métricas reflejan el estado real del Hito 04; `check-traceability.py`, `check-doc-links.py`, `check-schema-sync.py` y `generate-dbml-from-code.py --check` pasan sin advertencias.

---

### Paso 11: Preparación Hito 05 — Testing automatizado y CI de auditorías

**Módulo:** Testing / DevOps
**Refs:** Hito 05, deuda técnica testing
**Estimado:** ~1-2 sesiones
**Dependencia:** Paso 9 cerrado o estabilizado.

El proyecto ya cuenta con muchos scripts de auditoría, pero hoy solo ESLint corre en GitHub Actions. El siguiente salto de calidad es automatizar pruebas unitarias y convertir los scripts críticos en una red de seguridad repetible.

**Tareas:**
- [ ] **Instalar/configurar Vitest:** agregar `test`/`test:run` a `package.json` y configuración mínima compatible con Vite.
- [ ] **Tests prioritarios:** cubrir `MarkdownService` (sanitización XSS), `ThemeService` (persistencia/detección), `NoteStore` (filtros, búsqueda, pin/archivar) y lógica pura agregada para materias.
- [ ] **CI documental:** extender `.github/workflows/lint.yml` o crear workflow separado para `check-traceability.py`, `check-doc-links.py`, `check-schema-sync.py`, `generate-dbml-from-code.py --check` y `validate-subjects-hierarchy.py`.
- [ ] **Release dry-run:** usar `python3 scripts/release-helper.py --type patch --dry-run` para validar que el flujo de release está listo antes de generar un APK real.

**Criterio de cierre:** El proyecto tiene al menos una suite mínima de tests unitarios ejecutable localmente y un workflow de CI que audita código + documentación sin depender de pasos manuales.

---

## 📝 Deuda Técnica — Documentación y Diseño

- [x] ~~**Historias de Usuario (Hitos 03 y 04):**~~ ✅ Completado (2026-05-18). HU-007 a HU-011 redactadas con criterios de aceptación, SP y trazabilidad.
- [x] ~~**Actualizar Modelo de Dominio y Casos de Uso:**~~ ✅ Completado (2026-05-18). Entidad Tag eliminada, campos pinned/archived agregados, casos de uso corregidos (PWA→APK, Tags→Pin/Archivar).
- [ ] **Sincronizar README principal post-SQLite:** el stack debe presentar SQLite como persistencia actual y dejar IndexedDB solo como antecedente histórico/migración legacy.
- [ ] **Actualizar seguimiento de velocidad:** `docs/gestion/seguimiento-velocidad.md` debe reflejar las HU reales actuales (14 HU, 59 SP totales según `generate-velocity-report.py`) y no solo la planificación previa del Hito 04.
- [ ] **Revisar documentos generados:** regenerar informe completo y cheatsheet cuando se cierren nuevos cambios, para evitar que los artefactos finales queden con métricas anteriores.
- [ ] **Manual de usuario:** Crear un breve manual de usuario explicando los flujos principales, ya que el sistema tiene atajos visuales (Paso 9).

## 💻 Deuda Técnica — Código y Arquitectura

- [x] **🔴 ~~Eliminar `vite-plugin-pwa` y artefactos PWA:~~** ✅ Completado (2026-05-17). Se removió `vite-plugin-pwa` (289 paquetes), `public/manifest.json`, config `VitePWA()` de `vite.config.js`, `<link rel="manifest">` de `index.html`, y referencias PWA en `package.json`. Build limpio: sin `sw.js`, sin `registerSW.js`.
- [x] ~~**Seguridad (XSS en Markdown):**~~ ✅ Resuelto (2026-05-19, Paso 7). `img` y `src` eliminados de whitelist DOMPurify. Agregados `FORBID_TAGS`, `FORBID_ATTR` y hook `afterSanitizeAttributes`.
- [x] **Assets Manifest:** Agregar los íconos requeridos (`icon-192.png`, `icon-512.png`) en `public/icons/` para cumplir con las validaciones del `manifest.json`.
- [ ] **Refactor de archivos grandes (Deuda Técnica detectada):** Utilizar la guía de `python3 scripts/split-guide.py` para subdividir archivos con alta complejidad y LOC:
  - `src/services/SqliteService.js` (PELIGRO: >400 LOC). Extraer operaciones CRUD a `SqliteService.data.js`.
  - `src/styles/main.css` (PELIGRO: >400 LOC). Subdividir en módulos (variables, layout, componentes).
  - `src/store/NoteStore.js` (AVISO: >250 LOC). Extraer UI/Navegación y lógica CRUD.
  - `src/main.js` (AVISO: >250 LOC). Extraer templates HTML en línea.
- [ ] **Reducir complejidad de `NoteList.js`:** extraer renderizado de cards/dropdowns/empty states a funciones auxiliares o componente menor. Hoy `check-file-size.sh` y ESLint advierten sobre anidamiento profundo.
- [ ] **UI para sub-secciones de Materias (Profundidad > 0):** El modelo de datos (SQLite) y las validaciones de `SubjectService` ya soportan anidamiento (ej. "Materia" -> "TPs" / "Unidad 1"), pero falta implementar la interfaz visual (UX) para crear y navegar estas carpetas hijas dentro de una materia principal.
- [ ] **Manejo de Errores y Excepciones (Resiliencia):** Revisar todo el "camino triste" de la app. Implementar bloques `try/catch` robustos en operaciones críticas (ej. fallo de escritura en SQLite por falta de espacio), asegurar que la UI muestre un mensaje amigable ("Error al guardar") sin crashear en silencio, e implementar un mecanismo de loggeo estructurado.

## ⚙️ Deuda Técnica — DevOps y Procesos

- [x] ~~**Script de trazabilidad (`check-traceability.py`):**~~ ✅ Completado (2026-05-19). Audita coherencia entre RF, HU, ADR, CHANGELOG y código fuente con 6 chequeos automáticos. Python 3.8+, sin dependencias externas.
- [x] ~~**Templates de GitHub con trazabilidad:**~~ ✅ Completado (2026-05-20). Issues y PRs piden RF/HU/ADR/Hito y checklist de trazabilidad.
- [x] ~~**Scripts académicos y operativos Tanda 2/3:**~~ ✅ Completado (2026-05-20). Quedaron documentados `check-schema-sync.py`, `assemble-report.py`, `generate-velocity-report.py`, `validate-subjects-hierarchy.py`, `generate-dbml-from-code.py`, `generate-defense-cheatsheet.py`, `export-database-bundle.py`, `run-load-tests.py` y `release-helper.py`.
- [ ] **CI de scripts críticos:** llevar a GitHub Actions los checks que hoy se ejecutan manualmente: trazabilidad, links, schema sync, DBML check, jerarquía de materias y lint.
- [ ] **Versionado del paquete:** `package.json` y `package-lock.json` siguen en `0.1.0` mientras `CHANGELOG.md` documenta `0.4.0` en progreso. Resolver antes de cualquier release/APK.

## 🧪 Deuda Técnica — Testing (Crítico para Tribunal)

- [ ] **Suite de tests automatizados (Vitest/Jest):** *Requisito ineludible para la defensa final.* Incorporar Vitest como framework de testing unitario. La cobertura no necesita ser del 100%, pero **es obligatorio** testear:
  - `SqliteService` (operaciones CRUD y fallos).
  - `MarkdownService` (sanitización XSS).
  - Lógica del `Store` (filtrado, ordenamiento, pin/archivar).
  Objetivo: demostrar calidad de software profesional y prevenir regresiones en la lógica de negocio core.

## 🚀 Ideas a Largo Plazo (Post-Defensa / Hitos Futuros)

- [ ] **Sincronización / Backup en la Nube (Google Drive):** Para mantener la filosofía Offline-First pero evitar la pérdida de datos si el usuario pierde el celular, agregar un botón de "Exportar/Respaldar" que comprima la base SQLite o las notas en un `.zip` y lo suba a una carpeta privada en el Google Drive del usuario mediante la API de Google (requiere setup de OAuth). Es un backup unidireccional manual, no una sincronización P2P bidireccional en tiempo real.
