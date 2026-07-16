# Flujo de Desarrollo Android — Lumapse

> **Documento:** Guía operativa de desarrollo, compilación y testing en dispositivos Android.  
> **Última actualización:** 2026-07-15 (`0.4.8`, despliegue seguro con conservación de datos)
> **Autor:** José David Sandoval

---

## 1. Visión general

Lumapse es una aplicación cliente (HTML/CSS/JavaScript y TypeScript gradual) empaquetada como app Android
mediante **Capacitor**. El desarrollo se realiza en macOS y las pruebas se ejecutan
en dispositivos Android físicos conectados por USB.

### Diagrama del flujo

```
┌──────────────────────────────────────────────────────────────┐
│  DESARROLLO (macOS)                                          │
│                                                              │
│  Código JS/TS/CSS/HTML → npm run build → dist/              │
│                                              │               │
│                                     npx cap sync android     │
│                                              │               │
│                                              ▼               │
│                                     android/app/src/main/    │
│                                     assets/public/           │
│                                              │               │
│                                     npx cap run android      │
│                                              │               │
└──────────────────────────────────────────────┼───────────────┘
                                               │ USB + ADB
                                               ▼
                                    ┌─────────────────────┐
                                    │  DISPOSITIVO ANDROID │
                                    │  com.lumapse.app     │
                                    └─────────────────────┘
                                               │
                                          scrcpy (mirror)
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │  PANTALLA EN macOS   │
                                    │  (interacción real)  │
                                    └─────────────────────┘
```

---

## 2. Prerequisitos e instalación desde cero

Si estás clonando el repositorio por primera vez y necesitás compilar el APK Android,
seguí estos pasos en orden.

### 2.1 Herramientas base

Estas herramientas son necesarias para **cualquier** contribución al proyecto (web o nativa):

```bash
# Node.js 22+ y npm
brew install node

# Git
brew install git

# Verificar
node --version    # v22+
npm --version
git --version     # v2+
```

### 2.2 Android Studio y SDK

Android Studio incluye el SDK, Gradle embebido, el emulador y las herramientas de
compilación. Es el único instalador que se necesita para la parte nativa:

1. **Descargar** desde [developer.android.com/studio](https://developer.android.com/studio)
2. **Instalar** arrastrando a `/Applications/`
3. **Abrir** Android Studio → SDK Manager → instalar:
   - SDK Platform: **API 36**
   - Build Tools compatibles con API 36
   - Command-line Tools (latest)
   - Platform-Tools (incluye ADB)

> **Nota:** No es necesario instalar Gradle globalmente. El proyecto Android generado
> por Capacitor incluye su propio `gradlew` (Gradle Wrapper) que descarga la versión
> correcta automáticamente.

### 2.3 JDK (Java Development Kit)

El proyecto Android actual compila con compatibilidad Java 21. Se usa OpenJDK 21:

```bash
# Instalar OpenJDK 21 vía Homebrew
brew install openjdk@21

# Verificar
java -version    # openjdk 21.x.x
```

### 2.4 Variables de entorno

Agregar al archivo `~/.zshrc` (o `~/.bashrc`):

```bash
# Java
export JAVA_HOME="/usr/local/opt/openjdk@21"

# Android SDK (ajustar según la instalación)
export ANDROID_HOME="$HOME/Library/Android/sdk"
# O bien si se instaló vía Homebrew:
# export ANDROID_HOME="/usr/local/share/android-commandlinetools"

export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

Aplicar los cambios:

```bash
source ~/.zshrc
```

### 2.5 scrcpy (mirror de pantalla Android)

Solo necesario si se trabaja con un dispositivo de pantalla dañada (ver [sección 4.1](#41-scrcpy--screen-copy)):

```bash
brew install scrcpy

# Verificar
scrcpy --version    # 3.x.x
```

### 2.6 Dependencias del proyecto

```bash
# Clonar el repositorio
git clone https://github.com/jdfesa/lumapse.git
cd lumapse

# Instalar dependencias de Node
npm install

# Compilar la web app
npm run build

# Sincronizar con el proyecto Android
npx cap sync android

# (Opcional) Correr en un dispositivo conectado
npx cap run android
```

### 2.7 Verificación del entorno

Para verificar que todo está configurado correctamente:

```bash
echo "=== Node ===" && node --version
echo "=== Java ===" && java -version 2>&1 | head -1
echo "=== ADB ===" && adb version | head -1
echo "=== SDK ===" && ls $ANDROID_HOME/platforms/
echo "=== Build Tools ===" && ls $ANDROID_HOME/build-tools/
echo "=== Dispositivos ===" && adb devices
```

| Herramienta | Versión mínima | Versión utilizada en este proyecto |
|---|---|---|
| Node.js | v22+ | v22 |
| npm | Incluido con Node 22 | v10 |
| JDK | 21 | OpenJDK 21 |
| Android SDK (compile/target) | API 36 | API 36 |
| Android mínimo de ejecución | API 24 | Configurado en `android/variables.gradle` |
| Build Tools | Compatible con API 36 | Verificar con Android Studio/SDK Manager |
| ADB | 30+ | 36.0.2 |
| scrcpy | 2.0+ | 3.3.4 |
| Capacitor | 8.x | 8.3.x *(ver `package.json`)* |

---

## 3. Dispositivos de prueba

| Dispositivo | Samsung Galaxy S7 Edge | Samsung Galaxy S20 FE |
|---|---|---|
| **Android** | 10 | 13 |
| **Root** | Sí (Magisk) | No |
| **Rol** | Desarrollo y debugging diario | Validación inicial de la beta, controles de referencia y demos |
| **Conexión** | Micro USB | USB-C |
| **Pantalla** | ⚠️ Módulo dañado (no se ve) — se usa scrcpy | Funcional |
| **ADB** | Configurado y autorizado | Disponible |
| **Notas** | Soporta nativamente hasta Android 8; actualizado a Android 10 mediante ROM custom (root previo). Al tener el módulo de pantalla dañado, **toda la interacción se realiza remotamente desde macOS usando scrcpy**. | Teléfono de uso diario y sin root. Aporta evidencia sobre una configuración Android concreta; no sustituye la validación final ni una prueba con estudiantes. |

### ¿Por qué dos dispositivos?

- **S7 Edge (desarrollo):** Al estar rooteado y ser un dispositivo dedicado (no de uso personal),
  permite debugging profundo (logcat, inspección de bases de datos, reinstalación frecuente)
  sin riesgo de afectar datos personales.
- **S20 FE (referencia de beta):** Permite comprobar instalación y flujos en un dispositivo
  sin root con Android 13. El resultado solo evidencia compatibilidad con esa configuración;
  no se generaliza a otros dispositivos ni demuestra comprensión o aceptación por estudiantes.
  La validación final permanece en Hito 06.

---

## 4. Herramientas del entorno

### 4.1 scrcpy — Screen Copy

**scrcpy** es una herramienta open source desarrollada por [Genymobile](https://github.com/Genymobile/scrcpy)
que permite **proyectar y controlar la pantalla de un dispositivo Android** desde la
computadora, en tiempo real, a través de USB o WiFi.

| Campo | Detalle |
|---|---|
| **Versión utilizada** | 3.3.4 |
| **Instalación** | `brew install scrcpy` (macOS) |
| **Licencia** | Apache 2.0 |
| **Requisitos** | ADB instalado y dispositivo con depuración USB activada |

#### ¿Por qué se usa en este proyecto?

El Samsung Galaxy S7 Edge utilizado como dispositivo de desarrollo tiene el **módulo de
pantalla dañado** (la pantalla no muestra imagen). Sin scrcpy, sería imposible interactuar
con el dispositivo. scrcpy permite:

- Ver la pantalla del celular en una ventana de macOS.
- Enviar toques, gestos y texto desde el teclado y mouse de la Mac.
- Apagar la pantalla física del dispositivo (ahorra batería ya que no se necesita).

#### Comando utilizado

```bash
scrcpy --turn-screen-off -K
```

| Flag | Significado |
|---|---|
| `--turn-screen-off` | Apaga la pantalla física del dispositivo al conectar. Útil para ahorrar batería ya que la pantalla del S7 Edge está dañada y no se usa directamente. |
| `-K` | Habilita la entrada de teclado desde la computadora. Permite escribir texto directamente desde el teclado de la Mac hacia las apps del celular (indispensable para probar el editor de notas). |

#### Otros comandos útiles de scrcpy

```bash
# Proyectar con resolución reducida (útil si la conexión es lenta)
scrcpy --turn-screen-off -K --max-size 800

# Grabar la sesión en video (útil para documentar demos)
scrcpy --turn-screen-off -K --record demo-lumapse.mp4

# Conectar por WiFi (sin cable USB)
adb tcpip 5555
adb connect 192.168.x.x:5555
scrcpy -K
```

### 4.2 ADB — Android Debug Bridge

ADB es la herramienta de línea de comandos del Android SDK que permite comunicarse
con dispositivos Android conectados.

#### Comandos frecuentes en este proyecto

```bash
# Ver dispositivos conectados
adb devices

# Verificar que la app está instalada
adb shell pm list packages | grep lumapse

# Ver logs de la app en tiempo real (útil para debugging)
adb logcat -s "Capacitor" "Capacitor/Console"

# Desinstalar la app (para reinstalación limpia)
adb uninstall com.lumapse.app

# Instalar un APK manualmente
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. Flujo de trabajo paso a paso

### 5.1 Desarrollo de UI (ciclo rápido — sin compilar APK)

Para cambios de interfaz (CSS, layout, textos), el ciclo más rápido es usar el
servidor de desarrollo de Vite directamente desde el navegador del celular:

```bash
# 1. Levantar el servidor de desarrollo
npm run dev

# 2. Anotar la URL de red local (ej: http://192.168.x.x:5173)
# 3. Abrir esa URL en Chrome del celular (misma red WiFi)
# 4. Los cambios se reflejan en tiempo real (HMR)
```

> **Limitación:** El modo web usa SQLite/WASM mediante `jeep-sqlite`, pero no reproduce de forma completa los plugins y condiciones del dispositivo. Es apropiado para UI y pruebas rápidas; Filesystem/Share y la validación SQLite nativa deben probarse dentro de Android.

### 5.2 Compilación y despliegue en dispositivo (ciclo completo)

Cuando se necesita probar funcionalidades nativas o validar la app como APK.

> **Protección de datos:** El despliegue normal conserva SQLite y las preferencias. Usar `--clean` solo cuando se necesite una instalación fresca o se hayan detectado assets viejos; esa opción desinstala la app y borra todos sus datos locales. Antes de usarla sobre información relevante, exportar un backup.

```bash
# Flujo recomendado: build, sync e instalación conservando los datos
npm run deploy:android

# Selección explícita cuando hay más de un dispositivo
npm run deploy:android -- --target <DEVICE_ID>

# Instalación fresca: BORRA SQLite y preferencias
npm run deploy:android -- --target <DEVICE_ID> --clean
```

El script rechaza estados ambiguos de ADB, exige `--target` cuando hay varios dispositivos y muestra si el despliegue preservará o borrará datos.

### 5.3 Interacción con el S7 Edge (pantalla dañada)

```bash
# 1. Conectar el S7 Edge por USB
# 2. Verificar que ADB lo detecta
adb devices

# 3. Abrir scrcpy para ver e interactuar con la pantalla
scrcpy --turn-screen-off -K

# 4. La ventana de scrcpy muestra la pantalla del celular
#    - Click = toque en pantalla
#    - Teclado Mac = teclado del celular
#    - Scroll = desplazamiento
```

### 5.4 Ciclo completo resumido

```bash
# Build → Sync → Run conservando datos
npm run deploy:android

# Verificar en el dispositivo de desarrollo
scrcpy --turn-screen-off -K
```

---

## 6. Resolución de problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| `adb devices` no muestra el celular | Cable USB o depuración USB desactivada | Verificar que "Depuración USB" esté activada en Opciones de Desarrollador |
| `npx cap run android` falla con error de Gradle | Primera ejecución o caché corrupto | Ejecutar `cd android && ./gradlew clean && cd ..` y reintentar |
| La app muestra pantalla en blanco | `dist/` no está generado o desactualizado | Ejecutar `npm run build` antes de `npx cap sync` |
| La app muestra una versión vieja después del deploy | El WebView conserva assets del paquete anterior | Exportar datos relevantes y ejecutar `npm run deploy:android -- --target <DEVICE_ID> --clean` |
| scrcpy no conecta | ADB no autorizado en el dispositivo | Verificar el popup de autorización en el celular (o usar `adb kill-server && adb start-server`) |
| El APK no se instala en el S20 FE | "Fuentes desconocidas" deshabilitado | Habilitar instalación de apps de fuentes desconocidas en Configuración |

---

## 7. Ubicación de artefactos generados

| Artefacto | Ruta | Descripción |
|---|---|---|
| Web app compilada | `dist/` | Output de `npm run build` (no se commitea) |
| Proyecto Android | `android/` | Generado por Capacitor (se commitea) |
| APK debug | `android/app/build/outputs/apk/debug/app-debug.apk` | APK para testing (no se commitea) |
| Config de Capacitor | `capacitor.config.json` | AppId, webDir y plugins |

La firma y publicación de un artefacto de release siguen un flujo separado, documentado en [`gestion/firma-apk-android.md`](./gestion/firma-apk-android.md). No debe confundirse un APK debug con la beta firmada publicada.

---

> **Nota:** Este documento se actualiza cada vez que se incorpore una nueva herramienta
> o cambie el flujo de trabajo. Para el flujo de contribución al código fuente
> (branches, commits, pull requests), ver [`CONTRIBUTING.md`](../CONTRIBUTING.md).
