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

### 13. `generate-changelog.py`
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

### 14. `analyze-complexity.py`
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
