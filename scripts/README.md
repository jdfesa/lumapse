# Lumapse — Scripts de Automatización

Esta carpeta contiene scripts de shell (`.sh`) y Python (`.py`) diseñados para automatizar y estandarizar flujos de trabajo repetitivos o propensos a errores durante el desarrollo local de Lumapse.

## Por qué usamos scripts

Dado que la arquitectura de Lumapse combina tecnologías web (Vite) con frameworks nativos (Capacitor/Android), existen procesos que requieren interactuar tanto con el ecosistema de Node (`npm`) como con herramientas del sistema operativo (`adb`, `gradle`). Los scripts bash permiten centralizar esta lógica de forma segura y consistente.

---

## Catálogo de scripts

### 1. `deploy-android.sh`
Automatiza el ciclo de compilación y despliegue de la aplicación en un dispositivo Android físico.

- **Problema que resuelve:** El WebView de Android cachea agresivamente los assets web (HTML/JS/CSS). Si solo se compila encima de una instalación existente, a menudo la interfaz no se actualiza, generando falsos positivos durante el testing.
- **Funcionamiento:** 
  1. Verifica conexión ADB.
  2. Fuerza la desinstalación de la app (limpiando el caché del WebView).
  3. Ejecuta el build web (`npm run build`).
  4. Sincroniza el proyecto nativo (`npx cap sync`).
  5. Construye el APK y lo lanza en el teléfono (`npx cap run`).
- **Uso:**
  ```bash
  ./scripts/deploy-android.sh
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

### 3. `check-docs.sh`
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
  2. `npm run build` (compilación de producción con Vite).
  3. `./scripts/check-docs.sh` (auditoría de TODOs y estado Git).
- **Comportamiento:** Si algún paso falla, el script continúa los demás y al final reporta el resultado global. Si hay fallos, termina con código de salida 1.
- **Uso:**
  ```bash
  ./scripts/quality.sh
  ```

### 5. `check-traceability.py`
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

### 6. `check-offline.sh`
Escanea el código fuente y los assets del proyecto en busca de referencias a URLs externas que rompan la arquitectura offline-first.

- **Problema que resuelve:** Como app pensada para funcionar completamente sin conexión y proteger la privacidad del usuario, cualquier referencia no intencional a recursos externos (imágenes, fuentes, scripts) es un riesgo crítico.
- **Qué verifica:** Busca las cadenas `http://` y `https://` en los archivos JS, CSS e HTML de las carpetas `src/` y `public/`.
- **Características:** Ignora inteligentemente directorios como `node_modules/` o `docs/`, y marca posibles "falsos positivos" (como comentarios en el código) para revisión manual.
- **Uso:**
  ```bash
  ./scripts/check-offline.sh
  ```

### 7. `check-doc-links.py`
Valida todos los enlaces internos dentro de la documentación Markdown del proyecto.

- **Problema que resuelve:** Con más de 45 documentos Markdown interconectados, renombrar o mover archivos puede romper enlaces relativos silenciosamente.
- **Qué verifica:**
  - Enlaces a otros archivos `.md`.
  - Rutas a imágenes locales.
- **Características:** No revisa URLs externas. Retorna código de salida de error si encuentra al menos 1 enlace roto.
- **Uso:**
  ```bash
  python3 scripts/check-doc-links.py
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
- **Qué instala:**
  - `.git/hooks/pre-commit`: ejecuta `npm run lint`, `./scripts/check-offline.sh` y `./scripts/check-docs.sh`.
  - `.git/hooks/pre-push`: ejecuta `./scripts/quality.sh`, `python3 ./scripts/check-traceability.py` y `./scripts/bundle-budget.sh`.
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

### 13. `check-schema-sync.py`
Compara el esquema SQLite implementado en código contra el DDL documentado.

- **Problema que resuelve:** Lumapse mantiene el esquema de base de datos en dos lugares: el DDL real embebido en `src/services/SqliteService.js` y la documentación académica en `docs/diagramas/database/04-modelo-fisico-ddl.md`. Si se agrega una columna, tabla o tipo en un lado y se olvida actualizar el otro, el informe técnico queda desincronizado respecto del producto real.
- **Qué hace:**
  - Extrae sentencias `CREATE TABLE IF NOT EXISTS` desde los strings SQL de `SqliteService.js`.
  - Extrae sentencias `ALTER TABLE ... ADD COLUMN` usadas por migraciones idempotentes.
  - Lee únicamente los bloques de código SQL del documento físico de base de datos.
  - Construye dos mapas `{tabla -> columna -> tipo}` y compara tablas, columnas y tipos.
  - Ignora constraints como `PRIMARY KEY`, `DEFAULT`, `REFERENCES`, `ON DELETE` o `NOT NULL`, porque el objetivo es auditar sincronización estructural básica y no reglas completas de integridad.
- **Cuándo usarlo:** Después de modificar `SqliteService.js`, después de actualizar `04-modelo-fisico-ddl.md`, antes de cerrar un hito que toque persistencia SQLite y antes de entregar documentación técnica de base de datos.
- **Salida esperada:** Termina con código `0` si no hay diferencias y con código `1` si detecta tablas, columnas o tipos desincronizados.
- **Uso:**
  ```bash
  python3 scripts/check-schema-sync.py
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

### 24. `validate-subjects-hierarchy.py`
Valida la integridad de la jerarquía de materias y secciones de acuerdo a la decisión de producto DP-004.

- **Problema que resuelve:** Protege la base de datos contra inconsistencias lógicas en el dominio, como relaciones recursivas infinitas (ciclos), materias huérfanas, o estructuras que excedan el límite físico de profundidad de 2 niveles.
- **Qué hace:** Analiza una base SQLite (o una mock en memoria) y ejecuta 4 chequeos de integridad estructural en cascada.
- **Uso:**
  ```bash
  python3 scripts/validate-subjects-hierarchy.py [ruta_base.db]
  # Para ejecutar pruebas con datos que violan las reglas intencionalmente:
  python3 scripts/validate-subjects-hierarchy.py --test-violations
  ```

### 25. `generate-dbml-from-code.py`
Generador de diagramas DBML a partir del DDL real implementado en JavaScript.

- **Problema que resuelve:** Garantiza la coherencia absoluta entre el código de base de datos (`SqliteService.js`) y el diagrama lógico de base de datos (`03-modelo-logico-relacional.dbml`), eliminando errores humanos de transcripción.
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

