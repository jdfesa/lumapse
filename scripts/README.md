# Lumapse — Scripts de Automatización

Esta carpeta contiene scripts de shell (`.sh`) y Python (`.py`) diseñados para automatizar y estandarizar flujos de trabajo repetitivos o propensos a errores durante el desarrollo local de Lumapse.

## Por qué usamos scripts

Dado que la arquitectura de Lumapse combina tecnologías web (Vite) con frameworks nativos (Capacitor/Android), existen procesos que requieren interactuar tanto con el ecosistema de Node (`npm`) como con herramientas del sistema operativo (`adb`, `gradle`). Los scripts bash permiten centralizar esta lógica de forma segura y consistente.

---

## Comandos npm recomendados

Los scripts internos más usados también están expuestos desde `package.json` para que el flujo local y CI usen los mismos entrypoints:

| Comando | Equivalente | Uso principal |
|---|---|---|
| `npm run quality` | `bash scripts/quality.sh` | Puerta de calidad local completa. |
| `npm run verify` | `quality` + bundle budget + diálogos nativos + a11y | Validación final antes de cerrar una sesión. |
| `npm run check:session` | `bash scripts/check-session.sh` | Dashboard rápido de inicio. |
| `npm run check:health` | `python3 scripts/health-dashboard.py` | Dashboard detallado de salud. |
| `npm run check:size` | `bash scripts/bundle-budget.sh` | Guardia de tamaño de bundle. |
| `npm run check:a11y` | `python3 scripts/check-a11y.py` | Auditoría estática de accesibilidad. |
| `npm run check:native-dialogs` | `node scripts/check-native-dialogs.js` | Bloqueo de `alert`, `confirm` y `prompt` nativos fuera del seeder. |
| `npm run deploy:android` | `bash scripts/deploy-android.sh` | Build, sync e instalación Android segura. |

---

## Catálogo de scripts

### 1. `deploy-android.sh`
Automatiza el ciclo de compilación y despliegue de la aplicación en un dispositivo Android físico.

- **Problema que resuelve:** Permite instalar builds de Lumapse en Android sin repetir manualmente build, sync y ejecución de Capacitor. Desde el 2026-05-26 el modo normal preserva los datos locales de la app para no borrar accidentalmente la base SQLite durante pruebas de archivado, papelera o restauración.
- **Cambio importante:** Antes este script desinstalaba siempre la app para limpiar caché del WebView. Eso era útil para forzar assets frescos, pero también borraba SQLite y podía destruir exactamente el estado de prueba que se quería investigar. Ahora la desinstalación es explícita con `--clean`.
- **Funcionamiento:** 
  1. Verifica conexión ADB.
  2. Elige el dispositivo destino: si hay uno solo, lo usa automáticamente; si hay varios, exige `--target <deviceId>`.
  3. Ejecuta el build web (`npm run build`).
  4. Sincroniza el proyecto nativo (`npx cap sync`).
  5. Construye el APK y lo instala/lanza en el teléfono (`npx cap run android --target <deviceId>`).
- **Uso:**
  ```bash
  # Deploy normal: conserva SQLite, preferencias y estado local
  ./scripts/deploy-android.sh

  # Deploy a un dispositivo específico, sin selector interactivo
  ./scripts/deploy-android.sh --target ad071603088c2172aa

  # Deploy limpio: desinstala primero y borra datos/caché local
  ./scripts/deploy-android.sh --target ad071603088c2172aa --clean
  ```
- **Cuándo usar `--clean`:**
  - Cuando el WebView muestre assets viejos después de un cambio de UI.
  - Cuando se necesite simular una instalación completamente fresca.
  - Cuando la base local esté corrupta o se quiera reiniciar el estado manualmente.
- **Cuándo NO usar `--clean`:**
  - Cuando estás probando persistencia, archivado, papelera, restauraciones, migraciones o bugs que dependen del estado real de SQLite.
- **Ayuda integrada:**
  ```bash
  ./scripts/deploy-android.sh --help
  ```

### 2. `clean.sh`
Limpia cachés y artefactos de compilación para devolver el proyecto a un estado fresco. Ideal para solucionar "errores fantasma" causados por dependencias corruptas o código viejo atascado en memoria.

- **Qué limpia:**
  - `node_modules/.vite` (Caché de desarrollo de Vite).
  - `dist/` (Archivos web minificados).
  - `android/app/build/` y `android/.gradle/` (Cachés de compilación nativa Android).
  - `tmp/` (Opcional: se solicita confirmación interactiva `(y/N)` antes de vaciar su contenido. Esta precaución previene la eliminación accidental de archivos temporales que puedan estar en uso para análisis u otros procesos).
- **Uso:**
  ```bash
  ./scripts/clean.sh
  ```

### 3. `check-docs.sh` _(Superseded parcialmente por `lumapse-audit` #35)_
Realiza una auditoría rápida de consistencia en el proyecto antes de realizar operaciones importantes en Git. Esta herramienta ayuda a mantener la rigurosidad académica exigida en la documentación y el código fuente.

- **Qué verifica:**
  - Rastrea el código en `src/` buscando etiquetas `TODO` o `FIXME` que pudieran haber quedado olvidadas durante el desarrollo.
  - Presenta un resumen limpio del estado actual de Git (`git status --short`) para prevenir commits de archivos indeseados o fuera del alcance de la tarea actual.
- **Uso:**
  ```bash
  ./scripts/check-docs.sh
  ```

### 4. `quality.sh`
Ejecuta todos los chequeos de calidad del proyecto en un solo comando. Actúa como "puerta de calidad" antes de cerrar una sesión de trabajo o realizar commits importantes.

- **Qué ejecuta (en orden):**
  1. `npm run lint` (ESLint).
  2. `npm run test` (suite Vitest — 294 tests unitarios).
  3. `npm run build` (compilación de producción con Vite).
  4. Auditoría de código (con fallback cross-platform — ver abajo).
- **Estrategia de compatibilidad (Paso 4):** Intenta ejecutar `./scripts/lumapse-audit-bin --all` (Rust, ~2ms). Si el binario no existe o es incompatible con el OS actual (ej. profesor en Windows/Linux), **cae automáticamente** a los scripts Python/Shell originales:
  - `check-file-size.sh` (reemplaza `--code`)
  - `check-traceability.py` (reemplaza `--traceability`)
  - `check-schema-sync.py` (reemplaza `--schema`)
  - `check-doc-links.py` (reemplaza `--doc-links`)
  - `validate-subjects-hierarchy.py` (reemplaza `--hierarchy`)
- **Comportamiento:** Si algún paso falla, el script continúa los demás y al final reporta el resultado global. Si hay fallos, termina con código de salida 1.
- **Requisitos:** Node.js + Python 3.8+. Rust/cargo es **opcional** (optimización de rendimiento).
- **Uso:**
  ```bash
  ./scripts/quality.sh
  ```

### 5. `check-traceability.py` _(Superseded por `lumapse-audit` #35)_
Audita la coherencia y consistencia entre los documentos de trazabilidad del proyecto (RF, HU, ADR, CHANGELOG, BACKLOG) y el código fuente.

- **Problema que resuelve:** El proyecto depende de una estricta coherencia documental. Este script automatiza la verificación para asegurar que ningún requisito, historia de usuario o registro de decisión (ADR) quede "huérfano" o desactualizado respecto al código implementado.
- **Qué verifica (6 chequeos automáticos):**
  1. RFs mencionados en el código que no existen en los documentos formales.
  2. RFs marcados como implementados en el código o changelog, pero que siguen 'Pendientes' en los requisitos funcionales.
  3. HUs que referencian RFs inexistentes.
  4. RFs implementados que no tienen ninguna HU asociada.
  5. ADRs referenciados en documentos pero que no existen físicamente.
  6. Inconsistencias en la declaración del hito activo entre `BACKLOG.md` y `README.md`.
- **Características:** Es de sólo lectura (no modifica archivos), está escrito en Python 3.8+ puro sin dependencias externas.
- **Uso:**
  ```bash
  python3 scripts/check-traceability.py
  ```

### 6. `check-offline.sh` _(Superseded por `lumapse-audit` #35)_
Escanea el código fuente y los assets del proyecto en busca de referencias a URLs externas que rompan la arquitectura offline-first.

- **Problema que resuelve:** Como app pensada para funcionar completamente sin conexión y proteger la privacidad del usuario, cualquier referencia no intencional a recursos externos (imágenes, fuentes, scripts) es un riesgo crítico.
- **Qué verifica:** Busca las cadenas `http://` y `https://` en los archivos JS, CSS e HTML de las carpetas `src/` y `public/`.
- **Características:** Ignora inteligentemente directorios como `node_modules/` o `docs/`, y marca posibles "falsos positivos" (como comentarios en el código) para revisión manual.
- **Uso:**
  ```bash
  ./scripts/check-offline.sh
  ```

### 7. `check-doc-links.py` _(Superseded por `lumapse-audit` #35: `--doc-links`)_
Valida todos los enlaces internos dentro de la documentación Markdown del proyecto.

- **Problema que resuelve:** Con más de 45 documentos Markdown interconectados, renombrar o mover archivos puede romper enlaces relativos silenciosamente.
- **Qué verifica:**
  - Enlaces a otros archivos `.md`.
  - Rutas a imágenes locales.
- **Características:** No revisa URLs externas. Retorna código de salida de error si encuentra al menos 1 enlace roto.
- **Uso:**
  ```bash
  python3 scripts/check-doc-links.py
  ./scripts/lumapse-audit-bin --doc-links
  ```

### 8. `bundle-budget.sh`
Mide y controla el peso final de los archivos estáticos de producción contra límites (presupuestos) establecidos.

- **Problema que resuelve:** Asegura que la aplicación siga siendo extremadamente ligera para dispositivos móviles y contextos de conectividad limitada, alertando tempranamente si una nueva dependencia o feature dispara el tamaño del bundle.
- **Qué verifica:**
  - Ejecuta el build de producción.
  - Compara el tamaño comprimido (gzip) de archivos JS, CSS y HTML contra presupuestos predefinidos (ej. JS máximo 80kB).
- **Características:** Proporciona barras de progreso visuales directamente en la terminal. Falla automáticamente si se excede el presupuesto.
- **Uso:**
  ```bash
  ./scripts/bundle-budget.sh
  ```

### 9. `install-hooks.sh`
Instala hooks locales de Git para ejecutar automáticamente los chequeos mínimos antes de hacer commit o push.

- **Problema que resuelve:** Evita que se suban cambios que rompan lint, documentación, trazabilidad, arquitectura offline-first o presupuesto de bundle. Es una protección local para sostener la calidad del proyecto sin depender de recordar cada comando manualmente.
- **Compilación Rust opcional:** Si `cargo` está disponible en el sistema, compila el auditor Rust para hooks ultra-rápidos (~2ms). Si no está instalado (ej. profesor en Windows/Linux), muestra un mensaje informativo y los hooks usarán automáticamente los scripts Python/Shell como fallback.
- **Qué instala:**
  - `.git/hooks/pre-commit`: ejecuta `npm run lint` y auditoría de código (Rust → fallback a `check-file-size.sh`).
  - `.git/hooks/pre-push`: ejecuta `./scripts/quality.sh` y `./scripts/bundle-budget.sh`.
- **Requisitos:** Git + Node.js. Rust/cargo es **opcional**.
- **Cuándo usarlo:** Una vez por clon local del repositorio, especialmente al configurar una nueva máquina o después de clonar el proyecto nuevamente. No instala hooks globales.
- **Uso:**
  ```bash
  ./scripts/install-hooks.sh
  ```

### 10. `generate-migration.sh`
Genera el archivo base para una migración SQLite versionada.

- **Problema que resuelve:** La futura integración con `@capacitor-community/sqlite` necesita una forma ordenada de registrar cambios de esquema. Este script estandariza nombres, timestamps y estructura mínima de migraciones.
- **Qué genera:** Un archivo `.sql` en `src/store/migrations/` con secciones `UP` y `DOWN` listas para completar.
- **Cuándo usarlo:** Cada vez que se agregue, modifique o elimine estructura persistente de SQLite: tablas, índices, columnas, constraints o datos iniciales necesarios para el esquema.
- **Uso:**
  ```bash
  ./scripts/generate-migration.sh create_notes_table
  ```

### 11. `project-metrics.py`
Calcula métricas cuantitativas del proyecto para el informe final académico.

- **Problema que resuelve:** Recolecta datos objetivos sobre tamaño de código, volumen documental y distribución de módulos, evitando conteos manuales difíciles de reproducir.
- **Qué mide:**
  - Archivos JS/CSS y líneas de código fuente no vacías en `src/`.
  - Cantidad de componentes en `src/components/`.
  - Cantidad de servicios en `src/services/`.
  - Cantidad de documentos Markdown en `docs/`.
  - Palabras totales en los Markdown de `docs/` y de la raíz del proyecto.
- **Cuándo usarlo:** Antes de actualizar el informe final, anexos académicos, reportes de avance o presentaciones donde se necesiten métricas verificables del estado del proyecto.
- **Uso:**
  ```bash
  python3 scripts/project-metrics.py
  ```

### 12. `check-sql-migrations.py`
Audita las migraciones SQLite antes de que formen parte del flujo de persistencia local.

- **Problema que resuelve:** La base de datos local será una pieza crítica de Lumapse cuando se integre SQLite. Una migración mal nombrada, incompleta o destructiva puede dificultar upgrades, romper datos del usuario o dejar cambios sin posibilidad clara de reversión.
- **Qué verifica:**
  - Que los archivos `.sql` en `src/store/migrations/` sigan el formato `YYYYMMDD_HHMMSS_nombre.sql`.
  - Que cada migración tenga secciones `-- UP` y `-- DOWN`.
  - Que no aparezca `DROP TABLE` dentro del bloque `UP`, porque sería una operación destructiva durante la aplicación normal de cambios.
- **Cuándo usarlo:** Antes de probar migraciones SQLite, antes de un commit que agregue archivos `.sql` y como parte de un quality gate cuando la persistencia SQLite esté activa.
- **Uso:**
  ```bash
  python3 scripts/check-sql-migrations.py
  ```

### 13. `check-schema-sync.py` _(Superseded por `lumapse-audit` #35: `--schema`)_
Compara el esquema SQLite implementado en código contra el DDL documentado.

- **Problema que resuelve:** Lumapse mantiene el esquema de base de datos en dos lugares: el DDL real embebido en código y la documentación académica en `docs/diagramas/database/04-modelo-fisico-ddl.md`. Si se agrega una columna, tabla o tipo en un lado y se olvida actualizar el otro, el informe técnico queda desincronizado respecto del producto real.
- **Estado actual:** Se conserva como respaldo documental. El check vigente es `./scripts/lumapse-audit-bin --schema`, que apunta al servicio SQLite refactorizado en `src/services/sqlite/connection.js`.
- **Qué hace:**
  - Extrae sentencias `CREATE TABLE IF NOT EXISTS` desde strings SQL del servicio SQLite.
  - Extrae sentencias `ALTER TABLE ... ADD COLUMN` usadas por migraciones idempotentes.
  - Lee únicamente los bloques de código SQL del documento físico de base de datos.
  - Construye dos mapas `{tabla -> columna -> tipo}` y compara tablas, columnas y tipos.
  - Ignora constraints como `PRIMARY KEY`, `DEFAULT`, `REFERENCES`, `ON DELETE` o `NOT NULL`, porque el objetivo es auditar sincronización estructural básica y no reglas completas de integridad.
- **Cuándo usarlo:** Después de modificar el schema SQLite, después de actualizar `04-modelo-fisico-ddl.md`, antes de cerrar un hito que toque persistencia SQLite y antes de entregar documentación técnica de base de datos. Para el flujo actual, preferir `lumapse-audit --schema`.
- **Salida esperada:** Termina con código `0` si no hay diferencias y con código `1` si detecta tablas, columnas o tipos desincronizados.
- **Uso:**
  ```bash
  python3 scripts/check-schema-sync.py
  ./scripts/lumapse-audit-bin --schema
  ```

### 14. `assemble-report.py`
Ensambla los capítulos del informe final PP3 en un único documento Markdown.

- **Problema que resuelve:** El informe final se redacta por capítulos en `docs/informe-final/` para facilitar mantenimiento y revisión incremental, pero la entrega universitaria requiere un documento unificado. Ensamblarlo manualmente es repetitivo y puede introducir índices desactualizados, links inter-capítulo rotos o separadores inconsistentes.
- **Qué hace:**
  - Ignora `00-indice.md`, porque genera una tabla de contenidos nueva.
  - Lee en orden los capítulos `01-introduccion.md` a `07-conclusiones.md`.
  - Genera el encabezado institucional del informe completo.
  - Construye una tabla de contenidos automática desde headings `##` y `###`.
  - Concatena capítulos con separadores horizontales `---`.
  - Convierte links inter-capítulo como `04-arquitectura-diseno.md` en anclas internas.
  - Conserva links relativos externos como `../adr/...`, `../gestion/...` o `../diagramas/...`, porque el archivo final vive en la misma carpeta que los capítulos.
- **Cuándo usarlo:** Antes de preparar la entrega final, después de modificar cualquier capítulo del informe, antes de exportar el Markdown a PDF/DOCX y cada vez que se quiera revisar el documento completo como una unidad.
- **Salida generada:** `docs/informe-final/INFORME-FINAL-COMPLETO.md`.
- **Uso:**
  ```bash
  python3 scripts/assemble-report.py
  ```

### 15. `generate-changelog.py`
Genera un borrador de changelog a partir de los últimos commits del repositorio.

- **Problema que resuelve:** Mantener el `CHANGELOG.md` actualizado manualmente es fácil de olvidar y propenso a omisiones. Este script usa el historial Git como fuente inicial para preparar notas de versión coherentes.
- **Qué hace:**
  - Lee los últimos 40 commits con `git log --oneline`.
  - Ignora merges, reverts y mensajes que no sigan Conventional Commits.
  - Agrupa cambios en funcionalidades, correcciones, documentación y mantenimiento/refactorización.
  - Imprime Markdown en consola; no modifica `CHANGELOG.md`.
- **Cuándo usarlo:** Antes de cerrar una versión, preparar un informe de avance, redactar el changelog manual o revisar qué trabajo reciente debe comunicarse.
- **Uso:**
  ```bash
  python3 scripts/generate-changelog.py
  ```

### 16. `analyze-complexity.py`
Detecta señales simples de deuda técnica en archivos JavaScript.

- **Problema que resuelve:** Ayuda a identificar archivos que están creciendo demasiado o acumulando anidación excesiva, dos señales tempranas de código difícil de mantener. También aporta evidencia cuantitativa para justificar refactorizaciones en el informe final.
- **Qué mide:**
  - Líneas de código no vacías por archivo `.js` en `src/`.
  - Líneas con más de 12 espacios iniciales, usadas como indicador de anidación profunda.
  - Archivos largos (`> 250` líneas) y archivos complejos (`> 10` líneas profundamente anidadas).
- **Cuándo usarlo:** Antes de planificar refactors, al preparar una revisión técnica, después de implementar features grandes o cuando se necesite justificar deuda técnica con datos reproducibles.
- **Uso:**
  ```bash
  python3 scripts/analyze-complexity.py
  ```

### 17. `prepare-submission.sh`
Empaqueta el proyecto completo en un archivo `.zip` limpio y ligero.

- **Problema que resuelve:** Al enviar entregables universitarios, es fácil comprimir por error carpetas como `node_modules/` o `.git/`, resultando en archivos de cientos de megabytes.
- **Qué hace:** Crea automáticamente el archivo `Lumapse_Entrega_YYYYMMDD.zip` en la raíz del proyecto, incluyendo solo el código fuente, configuración y documentación, y omitiendo toda la basura temporal o pesada.
- **Cuándo usarlo:** Cuando necesites entregar el proyecto al campus virtual o enviar un backup limpio a un profesor.
- **Uso:**
  ```bash
  ./scripts/prepare-submission.sh
  ```

### 18. `generate-adr.sh`
Asistente para la creación de registros de decisiones arquitectónicas (ADR).

- **Problema que resuelve:** Mantener la numeración y el formato Markdown de los ADRs a mano es tedioso.
- **Qué hace:** Busca el número del último ADR creado, lo incrementa, y genera el archivo `.md` correspondiente en `docs/adr/` con la plantilla base oficial del proyecto. Convierte automáticamente el título a *kebab-case*.
- **Cuándo usarlo:** Antes de tomar una decisión importante en el proyecto (cambios de base de datos, frameworks, UI/UX).
- **Uso:**
  ```bash
  ./scripts/generate-adr.sh "Título de la Decisión"
  ```

### 19. `check-a11y.py`
Analizador estático simple para detectar problemas de accesibilidad web (W3C).

- **Problema que resuelve:** Validar controles básicos de accesibilidad de forma estática suma valor académico y empático al producto.
- **Qué mide:** Busca botones sin el atributo `aria-label`, imágenes sin atributo `alt`, y componentes con un `tabindex` forzado mayor a 0 (anti-patrón).
- **Características:** No interrumpe builds ni procesos, solo emite advertencias para solucionar proactivamente problemas de UI.
- **Uso:**
  ```bash
  python3 scripts/check-a11y.py
  ```

### 20. `generate-security-report.sh`
Audita las dependencias del proyecto y documenta el resultado automáticamente.

- **Problema que resuelve:** Presentar un proyecto académico o profesional sin un control explícito de vulnerabilidades (CVEs) es un descuido.
- **Qué hace:** Ejecuta `npm audit`, formatea el resultado y lo guarda de forma limpia en `docs/gestion/reporte-seguridad.md`.
- **Cuándo usarlo:** Al final de un hito o antes de la defensa final para demostrar rigor en la gestión de la seguridad.
- **Uso:**
  ```bash
  ./scripts/generate-security-report.sh
  ```

### 21. `generate-mock-data.py`
Generador de semillas de base de datos (Seed Data) para SQLite.

- **Problema que resuelve:** Cuando la base de datos se ponga en producción, se necesitan cientos de registros para probar el rendimiento, paginación y carga de la UI sin tener que crearlos a mano.
- **Qué hace:** Escribe el archivo `src/store/migrations/99999999_999999_seed_mock_data.sql` lleno de sentencias `INSERT` ficticias de aspecto realista (títulos, fechas, contenido markdown, UUIDs).
- **Cuándo usarlo:** Antes de realizar pruebas de estrés de la UI (Load testing). ¡NO ejecutar en producción!
- **Uso:**
  ```bash
  python3 scripts/generate-mock-data.py
  ```

### 22. `check-seo-metadata.py`
Analizador estático simple para validar atributos SEO y metadatos de Progressive Web App (PWA).

- **Problema que resuelve:** Asegura que la aplicación cumple con los estándares mínimos para ser indexada y comportarse correctamente en dispositivos móviles.
- **Qué mide:** Escanea `index.html` verificando atributos como `lang`, `viewport`, `theme-color`, `description`, y etiquetas táctiles de iOS.
- **Cuándo usarlo:** Antes de lanzar una versión de producción, para asegurar que la app no perderá puntuación en herramientas de auditoría como Google Lighthouse.
- **Uso:**
  ```bash
  python3 scripts/check-seo-metadata.py
  ```

### 23. `generate-velocity-report.py`
Calcula los Story Points entregados por hito a partir de la tabla de trazabilidad en `historias-de-usuario.md`.

- **Problema que resuelve:** Permite obtener de forma rápida y automatizada métricas de velocidad del proyecto y avance por hito para justificaciones ágiles.
- **Qué hace:** Parsea la tabla de trazabilidad de `docs/producto/historias-de-usuario.md`, extrae los Story Points (SP) y los hitos, y genera un reporte formateado en la terminal con la velocidad promedio (SP/hito) y los acumulados.
- **Uso:**
  ```bash
  python3 scripts/generate-velocity-report.py
  ```

### 24. `validate-subjects-hierarchy.py` _(Superseded por `lumapse-audit` #35: `--hierarchy`)_
Valida la integridad de la jerarquía de materias y secciones de acuerdo a la decisión de producto DP-004.

- **Problema que resuelve:** Protege la base de datos contra inconsistencias lógicas en el dominio, como relaciones recursivas infinitas (ciclos), materias huérfanas, o estructuras que excedan el límite físico de profundidad de 2 niveles.
- **Qué hace:** Analiza una base SQLite (o una mock en memoria) y ejecuta 4 chequeos de integridad estructural en cascada.
- **Uso:**
  ```bash
  python3 scripts/validate-subjects-hierarchy.py [ruta_base.db]
  # Para ejecutar pruebas con datos que violan las reglas intencionalmente:
  python3 scripts/validate-subjects-hierarchy.py --test-violations
  ./scripts/lumapse-audit-bin --hierarchy
  ```

### 25. `generate-dbml-from-code.py`
Generador de diagramas DBML a partir del DDL real implementado en JavaScript.

- **Problema que resuelve:** Garantiza la coherencia absoluta entre el código de base de datos (`src/services/sqlite/connection.js`) y el diagrama lógico de base de datos (`03-modelo-logico-relacional.dbml`), eliminando errores humanos de transcripción.
- **Qué hace:** Parsea y extrae la estructura SQL del servicio de persistencia, inyecta las notas de tablas/columnas y las relaciones configuradas, y exporta el archivo DBML válido para renderizar en dbdiagram.io.
- **Uso:**
  ```bash
  python3 scripts/generate-dbml-from-code.py
  # Para verificar la sincronización en pipelines de integración continua:
  python3 scripts/generate-dbml-from-code.py --check
  ```

### 26. `generate-defense-cheatsheet.py`
Genera una hoja de trucos consolidada (Cheat Sheet) de cara a la defensa del proyecto ante el tribunal.

- **Problema que resuelve:** Automatiza la recopilación de estadísticas del producto (líneas de código, requisitos, hitos, etc.) y sintetiza las justificaciones y preguntas difíciles más frecuentes del jurado en un único lugar de consulta rápida.
- **Qué hace:** Escanea el código fuente y las carpetas de documentación, calcula estadísticas en tiempo de ejecución, y escribe el resultado en `docs/gestion/cheatsheet-defensa.md`.
- **Uso:**
  ```bash
  python3 scripts/generate-defense-cheatsheet.py
  ```

### 27. `export-database-bundle.py`
Simula y valida la exportación integral de datos de Lumapse en un paquete ZIP de respaldo.

- **Problema que resuelve:** Permite comprobar el flujo de backup de HU-011 sin depender de un dispositivo Android real ni de una base generada por la app. Además, deja evidencia de integridad mediante hash SHA-256 del archivo SQLite exportado.
- **Qué hace:** Busca una base SQLite indicada por argumento o detectada en el workspace; si no encuentra una, crea una base mock temporal con `subjects`, `notes` y `metadata`. Luego copia la base como `lumapse.sqlite`, genera `metadata.json`, exporta cada nota como Markdown en `notes_markdown/`, empaqueta todo en `lumapse_backup_YYYYMMDD_HHMMSS.zip` y limpia los temporales.
- **Cuándo usarlo:** Antes de auditar la funcionalidad de exportación, al preparar evidencia de integridad de backups, o cuando se necesite un ZIP de prueba con la estructura esperada por Lumapse.
- **Uso:**
  ```bash
  python3 scripts/export-database-bundle.py
  python3 scripts/export-database-bundle.py ruta/a/lumapse.db --output-dir tmp/
  ```

### 28. `run-load-tests.py`
Ejecuta una prueba de carga en SQLite para validar la decisión DP-001 sobre el título desnormalizado.

- **Problema que resuelve:** Aporta una métrica empírica para justificar por qué Lumapse guarda el campo `title` en la base de datos en vez de parsear el Markdown completo cada vez que se listan muchas notas.
- **Qué hace:** Crea una base SQLite en memoria, inserta miles de notas con contenido Markdown realista, mide el tiempo de listado extrayendo el título desde `content`, mide el tiempo de listado leyendo directamente el campo `title`, y calcula la mejora relativa de rendimiento.
- **Cuándo usarlo:** Antes de la defensa, al armar anexos de rendimiento, o después de cambios en el modelo de datos/listado de notas que puedan afectar la validez de DP-001.
- **Uso:**
  ```bash
  python3 scripts/run-load-tests.py
  python3 scripts/run-load-tests.py --notes 10000
  ```

### 29. `release-helper.py`
Asistente de lanzamiento para versionado, changelog, build web, sincronización Capacitor y organización del APK.

- **Problema que resuelve:** Reduce errores manuales durante una publicación: olvidar actualizar `package.json`, dejar el `CHANGELOG.md` incompleto, ejecutar pasos de build fuera de orden o perder el APK generado por Gradle.
- **Qué hace:** Lee la versión actual de `package.json`, calcula el nuevo número semántico (`patch`, `minor` o `major`), actualiza archivos de versión y changelog, ejecuta limpieza/build/sync/Gradle cuando corresponde, y copia el APK final a `releases/vVERSION/lumapse-vVERSION.apk`.
- **Protecciones:** Incluye modo `--dry-run` para revisar el plan sin tocar archivos, `--skip-build` para validar solo la parte documental, `--yes` para ejecución no interactiva y `--allow-dirty` para permitir releases con worktree modificado cuando sea una decisión consciente.
- **Cuándo usarlo:** Al preparar una versión entregable, beta, build de defensa o paquete APK versionado. Lo recomendable es correr primero un dry-run y recién después ejecutar el flujo real.
- **Uso:**
  ```bash
  python3 scripts/release-helper.py --type patch --dry-run
  python3 scripts/release-helper.py --type minor --yes
  ```

### 30. `check-file-size.sh` _(Superseded por `lumapse-audit` #35)_
Guardia de tamano de archivos que escanea `src/` y reporta archivos que superan los limites saludables.

- **Problema que resuelve:** Los scripts existentes detectan deuda tecnica pero no la previenen. Este guardia reporta advertencias proactivamente para que los archivos no crezcan sin control.
- **Que hace:**
  - Escanea archivos JS, CSS y HTML en `src/`.
  - Cuenta lineas de codigo no vacias (LOC).
  - Reporta como AVISO los archivos que superan 250 LOC.
  - Reporta como PELIGRO los archivos que superan 400 LOC.
  - NUNCA bloquea el flujo de trabajo (siempre retorna exit code 0).
  - Soporta `--json` para integracion con otros scripts.
- **Uso:**
  ```bash
  ./scripts/check-file-size.sh
  ./scripts/check-file-size.sh --json
  ```

### 31. `check-session.sh`
Dashboard de inicio de sesion que muestra el estado completo del proyecto en ~3 segundos.

- **Problema que resuelve:** Evita perder tiempo averiguando donde estabas, que falta, y cual es el estado del proyecto cada vez que arrancas a trabajar.
- **Que muestra:**
  0. Rama activa (nombre, si es `main` o de trabajo, commits de ventaja, ramas mergeadas pendientes de limpiar).
  1. Hito activo (desde `CHANGELOG.md` y `BACKLOG.md`).
  2. Ultimos 5 commits.
  3. Estado de Git (archivos modificados, staged, sin rastrear).
  4. Deuda tecnica (archivos que superan 250 LOC).
  5. TODOs y FIXMEs pendientes en codigo fuente.
  6. Estado rapido de ESLint.
- **Uso:**
  ```bash
  ./scripts/check-session.sh
  ```

### 32. `split-guide.py`
Guia de refactorizacion por analisis estatico. Analiza archivos JS grandes y sugiere como dividirlos.

- **Problema que resuelve:** Cuando se detecta un archivo grande, no basta con decir "es largo" -- hace falta saber *como* dividirlo. Este script analiza la estructura del archivo y propone un plan de split.
- **Que hace:**
  - Detecta funciones exportadas vs internas.
  - Agrupa funciones por responsabilidad (renderizado, eventos, datos, navegacion, utilidades, etc.).
  - Sugiere nombres de archivo destino para cada grupo.
  - Calcula cuantas LOC se extraerian y cuantas quedarian.
  - Soporta `--all` para analizar todos los archivos que superan el limite.
  - Soporta `--md` para generar salida Markdown compatible con BACKLOG.
- **Uso:**
  ```bash
  python3 scripts/split-guide.py src/main.js
  python3 scripts/split-guide.py --all
  python3 scripts/split-guide.py --all --md
  ```

### 33. `health-dashboard.py`
Dashboard consolidado de salud del proyecto. Ejecuta multiples checks y genera un reporte unificado.

- **Problema que resuelve:** Consolida metricas de calidad en un unico lugar para monitoreo interno y para generar evidencia de buenas practicas en el informe final.
- **Que mide:**
  - Tabla de archivos con LOC, complejidad y estado.
  - TODOs y FIXMEs en codigo (con sugerencia de moverlos al BACKLOG).
  - Estado de ESLint.
  - Estadisticas generales (archivos JS/CSS, documentos MD, LOC totales).
  - Informacion de git (commit, branch).
- **Que genera:** Reporte en terminal por defecto. Con `--save` guarda `docs/gestion/health-dashboard.md`.
- **Uso:**
  ```bash
  python3 scripts/health-dashboard.py
  python3 scripts/health-dashboard.py --save
  ```

### 34. `daily-workflow.sh`
Orquestador maestro del flujo de trabajo diario. Centraliza los scripts de inicio y cierre.

- **Problema que resuelve:** Fuerza un flujo disciplinado sin tener que recordar que scripts correr al empezar o terminar una sesion.
- **Modos:**
  - `start`: Ejecuta `check-session.sh` como dashboard de inicio.
  - `end`: Ejecuta lint, build, guardia de tamano, TODOs, y resume los commits del dia.
  - `health`: Ejecuta `health-dashboard.py` con dashboard completo.
- **Uso:**
  ```bash
  ./scripts/daily-workflow.sh start
  ./scripts/daily-workflow.sh end
  ./scripts/daily-workflow.sh health
  ./scripts/daily-workflow.sh health --save
  ```

---

## Flujo de trabajo resultante

```
Al empezar a trabajar:
  ./scripts/daily-workflow.sh start

Durante el desarrollo:
  - ESLint advierte si un archivo supera 300 LOC
  - Pre-commit ejecuta lint y auditoria rapida de codigo con lumapse-audit

Cuando un archivo crece demasiado:
  python3 scripts/split-guide.py <archivo>
  python3 scripts/split-guide.py --all --md    # Para agregar al BACKLOG

Al cerrar la sesion:
  ./scripts/daily-workflow.sh end

Para un reporte completo de salud:
  ./scripts/daily-workflow.sh health --save
```

---

## 🦀 Toolchain Rust

La evolución completa del auditor Rust y la política de preservación de scripts reemplazados vive en [`scripts/docs/evolucion-toolchain-rust.md`](docs/evolucion-toolchain-rust.md).

### 35. `lumapse-audit` (Rust) — Opcional, con fallback automático a Python/Shell
Auditor concurrente unificado para chequeos críticos del proyecto.

- **Importante — Compatibilidad cross-platform:** El binario compilado (`lumapse-audit-bin`) funciona en el OS donde fue compilado (ej. macOS ARM64). Si el proyecto se clona en otro OS (Windows, Linux), **no se necesita Rust instalado**: tanto `quality.sh` como los hooks de Git detectan automáticamente la ausencia del binario y caen a los scripts Python/Shell originales que cubren la misma funcionalidad. Los scripts Python originales están preservados en el repositorio con este propósito.
- **Qué unifica:**
  - `--code`: LOC guard, TODO/FIXME y offline-first → fallback: `check-file-size.sh`
  - `--traceability`: RF, HU, ADR, CHANGELOG y BACKLOG → fallback: `check-traceability.py`
  - `--schema`: sincronización schema SQLite ↔ documentación DDL → fallback: `check-schema-sync.py`
  - `--doc-links`: links internos, imágenes y anclas Markdown → fallback: `check-doc-links.py`
  - `--hierarchy`: jerarquía de materias en memoria → fallback: `validate-subjects-hierarchy.py`
- **Uso:**
  ```bash
  ./scripts/lumapse-audit-bin --all
  ./scripts/lumapse-audit-bin --help
  ```
- **Compilación (requiere cargo):**
  ```bash
  cd scripts/lumapse-audit && cargo build --release
  cp target/release/lumapse-audit ../lumapse-audit-bin
  ```
- **Detalle técnico:** Ver [`scripts/docs/evolucion-toolchain-rust.md`](docs/evolucion-toolchain-rust.md).

---

### 36. `generate-icons.py`
Procesa el imagotipo original de Lumapse para generar todos los íconos de launcher adaptativos para Android de forma automatizada.

- **Problema que resuelve:** Android requiere hasta 15 combinaciones de íconos adaptativos distribuidos en 5 densidades de pantalla (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) en variantes normal, redonda y de primer plano (`foreground`). Generar y recortar cada uno a mano en herramientas de edición externa es un proceso extremadamente tedioso y propenso a errores de escalado o centrado dentro de la zona segura.
- **Funcionamiento:**
  1. Lee el logotipo maestro `public/icons/icon-512x512.png`.
  2. Redimensiona el logotipo al 61% de la lona para cumplir estrictamente con la "zona segura" (safe zone) de los íconos adaptativos de Android.
  3. Genera las 15 variaciones redimensionadas con interpolación de alta calidad (Lanczos/Pillow) y las guarda en sus correspondientes carpetas en `android/app/src/main/res/mipmap-*/`.
- **Entorno virtual `.venv-icons`:** Debido a que el procesamiento de imágenes requiere la biblioteca externa `Pillow` (que compila componentes binarios nativos de C) y con el fin de mantener el `.venv` de desarrollo principal libre de dependencias pesadas que ralenticen las auditorías, se optó por aislar estas herramientas de generación gráfica en un entorno virtual dedicado llamado `.venv-icons`.
- **Uso:**
  ```bash
  source .venv-icons/bin/activate
  python3 scripts/generate-icons.py
  deactivate
  ```

### 37. `generate-splash.py`
Genera las pantallas de bienvenida (splash screens) adaptativas de la aplicación móvil de forma consistente.

- **Problema que resuelve:** Las pantallas de inicio nativas requieren adaptarse dinámicamente a orientaciones vertical y horizontal, centrando el logotipo sin estiramiento ni distorsiones en 11 dimensiones distintas de assets en Android.
- **Funcionamiento:**
  1. Toma la imagen base del imagotipo y la escala proporcionalmente en relación a la dimensión más pequeña de cada lienzo de destino (~25%).
  2. Crea un fondo de color `#1a1d23` consistente con el tema oscuro de la UI de la app.
  3. Dibuja el imagotipo en el centro geométrico del lienzo.
  4. Escribe el texto de marca "Lumapse" alineado debajo en color blanco semitransparente (`rgba(255, 255, 255, 200)`).
  5. Exporta las 11 variaciones redimensionadas a `android/app/src/main/res/drawable-*/splash.png`.
- **Uso:**
  ```bash
  source .venv-icons/bin/activate
  python3 scripts/generate-splash.py
  deactivate
  ```
