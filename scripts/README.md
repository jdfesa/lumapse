# Lumapse — Scripts de Automatización

Esta carpeta contiene scripts de shell (`.sh`) diseñados para automatizar y estandarizar flujos de trabajo repetitivos o propensos a errores durante el desarrollo local de Lumapse.

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
