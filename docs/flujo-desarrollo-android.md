# Flujo de Desarrollo Android — Lumapse

> **Documento:** Guía operativa de desarrollo, compilación y testing en dispositivos Android.  
> **Última actualización:** 2026-09-05 (`0.5.0`, versionado verificado y despliegue seguro con conservación de datos)
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
# Instalar Node.js 22.20.0 con un gestor que permita fijar la versión exacta.
# No usar `brew install node`: puede instalar una línea distinta.

# Git
brew install git

# Verificar
node --version    # v22.20.0
npm --version     # 10.9.3
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

# Activar el pin de .nvmrc (ejemplo con nvm ya instalado)
nvm install
nvm use
npm run check:runtime

# Instalar exactamente las dependencias del lockfile
npm ci

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
| Node.js | v22.20.0 | v22.20.0 |
| npm | v10.9.3 | v10.9.3 |
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

> **Protección de datos:** usar el script habitual con autorización de instalación; el modo normal conserva SQLite y preferencias, siempre que la firma sea compatible. `--clean`, desinstalación, borrado o importación de datos requieren permiso específico y recuperación acordada, no son remedios automáticos para assets viejos. Un ZIP no respalda borradores ni papelera; ante firma incompatible, detenerse sin desinstalar.

```bash
# Flujo recomendado: build, sync e instalación conservando los datos
npm run deploy:android

# Selección explícita cuando hay más de un dispositivo
npm run deploy:android -- --target <DEVICE_ID>

# Solo con permiso específico y recuperación acordada: BORRA datos
npm run deploy:android -- --target <DEVICE_ID> --clean
```

El script rechaza estados ambiguos de ADB, exige `--target` cuando hay varios dispositivos y muestra si el despliegue preservará o borrará datos.

#### Identificación de compilaciones en Acerca de

Vite calcula estos datos al cargar el módulo de metadatos en dev/build, sin Git,
red ni telemetría en el teléfono:

- **Versión base:** `package.json.version`; no identifica por sí sola un binario.
- **Compilación:** intención del flujo que produjo los assets, no certificación.
- **Origen:** SHA completo del commit y estado local del código relevante. Sin Git,
  HEAD válido o metadata legible: **No disponible**; si solo falla el estado, se
  muestra **estado local no disponible**, nunca se presume limpio.

| Flujo existente | Etiqueta automática |
|---|---|
| `npm run dev` (incluso con modo production) | Desarrollo (servidor local) |
| `npm run build` / CI sin variante declarada | Prueba optimizada (variante no declarada) |
| `npm run deploy:android -- --target <DEVICE_ID>` | Android debug · prueba privada |
| Build web de `scripts/release-helper.py` | Android · candidato (firma/publicación no verificadas) |

Los scripts declaran internamente `LUMAPSE_BUILD_CHANNEL`; no se exige una variable
manual para cada prueba. Solo se aceptan los dos canales Android conocidos; otros
valores no se exponen ni convierten un build Vite production en release. La etiqueta
candidato **no** demuestra firma, publicación o validación, incluso si el helper
produce un APK unsigned. No habilita debugging en release.

El estado incluye archivos seguidos y nuevos no ignorados de `src/`, `public/`,
`android/`, package/lock, entrada/configuración de build y scripts participantes;
excluye docs, tests y artefactos ignorados. **Cambios locales** indica que el SHA no
describe por sí solo lo compilado. El snapshot no cambia en una APK ya instalada;
recompilar para otro origen. En dev se invalida con HMR del código existente;
reiniciar el servidor tras commits, altas/bajas de archivos o cambios solo de Git.
No modificar fuentes durante el build que se utiliza como evidencia.

Una prueba debug privada autorizada usa el deploy habitual, sin bump ni publicación
por cada cambio; registrar canal/origen, **SHA-256 del APK** y certificado en la
evidencia. El SHA fuente no es identidad binaria ni equivale al hash del APK.
La entrega/candidata posterior es un corte separado, con versión/code nuevos y
autorización específica; el asset publicado previo permanece inmutable. Seguir el
[plan vigente](./gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) para revisión
y prueba: estos metadatos no completan F3 ni autorizan operaciones de teléfono.

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
| La app muestra una versión vieja después del deploy | Assets anteriores o APK distinto | Comparar Acerca de/origen con la evidencia del APK y repetir el deploy habitual autorizado; no usar `--clean` sin permiso específico y recuperación acordada |
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

La firma y publicación de un artefacto de release siguen un flujo separado, documentado en [`gestion/firma-apk-android.md`](./gestion/firma-apk-android.md). La beta firmada vigente es `v0.5.0`; no debe confundirse el asset publicado con un APK debug o con un build equivalente usado para preservar datos durante una validación incremental.

---

> **Nota:** Este documento se actualiza cada vez que se incorpore una nueva herramienta
> o cambie el flujo de trabajo. Para el flujo de contribución al código fuente
> (branches, commits, pull requests), ver [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## 8. Estación de pruebas en Arch Linux con Android Emulator

**Incorporación y comprobación del entorno: 2026-10-04.** Esta sección amplía el
flujo anterior sin reemplazarlo: las instrucciones macOS y la evidencia de los
Samsung se conservan. Desde esta incorporación, esta estación **Arch Linux x86_64**
se utilizará para las pruebas habituales de desarrollo de Lumapse mediante el
**emulador de Android Studio**, con interacción manual o asistencia por ADB.

### 8.1 Alcance y estado comprobado

El emulador ejecuta la APK dentro de Android, no la versión web en el navegador del
host. Permite comprobar interfaz, escritura, guardado y otros flujos nativos que se
prueben expresamente. Su perfil Pixel 6 **no es un teléfono Pixel físico** ni
reproduce todas las condiciones de los Samsung, sus ABI, sensores o aplicaciones
disponibles para compartir archivos.

| Componente | Estado observado en esta estación el 2026-10-04 |
|---|---|
| Android Studio | Paquete `android-studio 2026.2.1.8-2`, instalado mediante `yay`; IDE en `/opt/android-studio` |
| Runtime del IDE | JBR incluido en `/opt/android-studio/jbr`, OpenJDK `25.0.3` |
| SDK de usuario | `~/Android/sdk`; Command-line Tools `22.0` |
| Herramientas del SDK | Platform-Tools `37.0.1`, Android Emulator `37.2.12`, Build-Tools `36.0.0` |
| Plataforma e imagen | Android 16 / API 36, plataforma revisión 2; `system-images;android-36;google_apis;x86_64`, revisión 7, sin Play Store |
| Dispositivo virtual | AVD `Lumapse_API_36`, perfil Pixel 6, pantalla 1080 × 2400, densidad 420 dpi |
| Recursos del AVD | 2 CPU virtuales; RAM configurada en 2 GiB, ajustada por el emulador a 2560 MiB en ejecución; gráficos `auto` |
| Aceleración | KVM utilizable; `-accel-check` devuelve código 0 |
| Teclado | `hw.keyboard=yes`; escritura con teclado físico confirmada por el autor |
| JDK de compilación | **Pendiente:** `pacman -Q` no encuentra `jdk21-openjdk`; no se ha validado un build Android desde Arch |
| Paquetes auxiliares del sistema | `android-tools` y `android-udev` no instalados; se utiliza el ADB del SDK |

Las versiones de esta tabla identifican la instalación observada, **no son mínimos
universales ni un bloqueo de futuras actualizaciones**. Para compilar el proyecto
prevalecen `.nvmrc`, `package.json` y la configuración versionada de `android/`.
No se cambió el runtime global de Node/Java ni se editaron perfiles de la shell
durante la puesta en marcha del emulador.

### 8.2 Instalación en Arch: `yay`, rutas y Java

Con `yay` ya instalado, ejecutar como usuario normal y revisar el PKGBUILD del
[paquete comunitario de Android Studio en AUR](https://aur.archlinux.org/packages/android-studio)
antes de confirmar su instalación:

```bash
yay -S --needed android-studio

# Necesario para preparar la compilación del proyecto, no para abrir una APK existente:
yay -S --needed jdk21-openjdk

# Opcionales: ADB/Fastboot del sistema y reglas USB para dispositivos físicos:
yay -S --needed android-tools android-udev
```

`jdk21-openjdk`, `android-tools` y `android-udev` pertenecen a los repositorios
oficiales de Arch: [JDK 21](https://archlinux.org/packages/extra/x86_64/jdk21-openjdk/),
[herramientas Android](https://archlinux.org/packages/extra/x86_64/android-tools/)
y [reglas udev](https://archlinux.org/packages/extra/any/android-udev/).
No ejecutar `sudo yay`: el helper solicita privilegios cuando corresponde.
La contraseña de administración se ingresa localmente, no se comparte con el asistente.
El intento de instalar estos tres paquetes durante la preparación se canceló ante
la solicitud de `sudo`; no debe registrarse como una instalación completada.

Situarse en `~/yay` es válido para invocar el helper, pero esa carpeta contiene sus
fuentes de construcción: **no determina el destino de Android Studio, del SDK ni
del AVD**. Para ejecutar comandos del proyecto, trabajar desde `~/github/lumapse`
o desde la ubicación real del clon.

Hay dos usos distintos de Java:

- **IDE:** mantener el JBR distribuido con Android Studio. No establecer
  `STUDIO_JDK` apuntando a Java 21 para forzar el arranque de este IDE con otro runtime.
- **Build de Lumapse:** usar JDK 21, como indica la sección 2.3 y
  [`android/app/capacitor.build.gradle`](../android/app/capacitor.build.gradle)
  (`sourceCompatibility` y `targetCompatibility` en `VERSION_21`). El JDK 17 del
  tutorial externo no satisface esa compatibilidad de fuentes. El JBR 25 del IDE
  tampoco se adopta automáticamente como entorno de build del proyecto.

La distinción entre runtime del IDE y JDK de Gradle está documentada en la
[guía oficial de Java para builds Android](https://developer.android.com/build/jdks).
Después de instalar JDK 21, se puede preparar **solo la terminal de trabajo**:

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export ANDROID_HOME="$HOME/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
java -version
javac -version
```

Si se compila desde Android Studio, seleccionar ese JDK de forma independiente en
Settings → Build, Execution, Deployment → Build Tools → Gradle. Comprobar la
configuración efectiva antes del primer build; no migrar el tooling ni instalar
Gradle globalmente para esta puesta en marcha. El repositorio usa su wrapper
Gradle `8.14.3` y Android Gradle Plugin `8.13.0` en el corte revisado.

### 8.3 SDK, aceleración y creación del dispositivo virtual

En Android Studio, abrir **SDK Manager**, comprobar que el SDK esté en
`~/Android/sdk` e instalar Platform-Tools, Android Emulator, Android SDK Platform
36, Build-Tools 36.0.0 y la imagen **Google APIs / API 36 / x86_64**. Las herramientas
y la imagen se descargan por separado del paquete del IDE; requieren espacio en
disco, conexión para la descarga y aceptación informada de las licencias.

En esta estación se instalaron desde las Command-line Tools oficiales de Google,
verificando el SHA-256 publicado del archivo descargado antes de extraerlo en
`~/Android/sdk/cmdline-tools/latest`. El comando empleado fue:

```bash
env JAVA_HOME=/opt/android-studio/jbr \
  "$HOME/Android/sdk/cmdline-tools/latest/bin/sdkmanager" \
  --sdk_root="$HOME/Android/sdk" --install \
  "platform-tools" "emulator" "platforms;android-36" \
  "build-tools;36.0.0" "system-images;android-36;google_apis;x86_64"
```

Esto describe la preparación realizada, no un build con JBR 25. `sdkmanager`
emitió un aviso de deprecación, aunque la instalación terminó correctamente;
la [referencia oficial](https://developer.android.com/tools/sdkmanager) remite a
Android CLI. Para una nueva instalación, usar el SDK Manager del IDE; no asumir
que ese comando histórico seguirá disponible ni migrar herramientas sin revisión.

En Linux, el emulador utiliza KVM para acelerar la máquina virtual. Comprobarlo
desde el host con el mismo usuario que ejecutará el emulador:

```bash
"$HOME/Android/sdk/emulator/emulator" -accel-check
```

En esta máquina informó `KVM (version 12) is installed and usable.` No fue necesario
modificar permisos, grupos ni módulos. Si falla en otro equipo, revisar la
virtualización del firmware, los módulos KVM y el acceso del usuario a `/dev/kvm`;
no aplicar permisos globales inseguros como solución automática. Un sandbox del
asistente puede ocultar `/dev/kvm`: su fallo no prueba por sí solo un fallo del
host. Consultar la [guía oficial de aceleración](https://developer.android.com/studio/run/emulator-acceleration).

En **Device Manager → Create Virtual Device**, elegir Pixel 6, la imagen anterior
y nombre `Lumapse_API_36`. Ajustar 2 CPU virtuales, RAM inicial 2 GiB, gráficos
automáticos y **Enable Keyboard Input**. El perfil y la imagen se eligen para esta
estación Intel x86_64; no copiar esa ABI como requisito para equipos ARM.
La [guía oficial de AVD](https://developer.android.com/studio/run/managing-avds)
describe su creación y las opciones de teclado.

La configuración queda en `~/.android/avd/Lumapse_API_36.avd/config.ini` y los datos
del dispositivo en ese directorio. `hardware-qemu.ini` es una salida generada y no
se edita a mano. No recrear ni borrar el AVD para resolver un problema de teclado.

### 8.4 Inicio del emulador y corrección de entrada de teclado

Se puede iniciar el AVD desde Device Manager o desde el acceso local
**Emulador Lumapse API 36**, creado en
`~/.local/share/applications/lumapse-emulator.desktop`. El comando equivalente es:

```bash
QT_QPA_PLATFORM=xcb "$HOME/Android/sdk/emulator/emulator" \
  -avd Lumapse_API_36 -accel on -gpu auto -no-metrics
```

`QT_QPA_PLATFORM=xcb` corresponde a esta sesión Wayland/Hyprland con Xwayland;
no es un requisito general de Lumapse. `-no-metrics` deshabilita el envío de métricas
del emulador. No abrir una segunda instancia del mismo AVD si ya está ejecutándose.
La [referencia de inicio por terminal](https://developer.android.com/studio/run/emulator-commandline)
explica las opciones de arranque.

Durante la configuración, los clics respondían pero el teclado no escribía y
Gboard mostraba entrada manuscrita. Se comprobó `hw.keyboard=no`, se cambió a
`hw.keyboard=yes` con el emulador cerrado y se hizo un arranque en frío agregando
**una vez** `-no-snapshot-load` al comando anterior. Esto evita cargar el snapshot;
**no es Wipe Data y no borra el almacenamiento de la app**.

Tras el arranque, se aplicaron los siguientes ajustes en el Android del emulador
ya identificado (ver selección de `ADB` y `SERIAL` en 8.5):

```bash
"$ADB" -s "$SERIAL" shell settings put secure stylus_handwriting_enabled 0
"$ADB" -s "$SERIAL" shell settings put secure show_ime_with_hard_keyboard 1

# Leer el estado efectivo: en esta sesión devolvieron 0 y 1.
"$ADB" -s "$SERIAL" shell settings get secure stylus_handwriting_enabled
"$ADB" -s "$SERIAL" shell settings get secure show_ime_with_hard_keyboard
```

Son ajustes comprobados en esta imagen Android 16, no una API portable garantizada
para todas las versiones. El autor confirmó «Ahora puedo escribir» usando su
teclado físico. No se necesita un lápiz óptico. Si reaparece tras otro arranque,
revisar los valores y el método de entrada; no asumir su persistencia en todas las
imágenes ni borrar datos como remedio.

### 8.5 Control desde esta estación y desde el asistente

La interacción manual se realiza con mouse y teclado sobre la ventana del
emulador: clic para tocar, foco en el campo para escribir y controles laterales
para navegación. **scrcpy no es necesario** para esta ventana; conserva su papel
en el flujo con teléfonos físicos de las secciones anteriores.

El asistente controla el AVD mediante comandos locales del **ADB del SDK** y
capturas de pantalla que inspecciona antes de actuar. No accede al editor escribiendo
directamente en SQLite. Las restricciones del entorno de ejecución pueden requerir
aprobación para acceder al ADB del host o abrir la ventana; no se eluden ni se
comparten contraseñas.

En una terminal, identificar primero el destino. Las variables siguientes se
reutilizan en los ejemplos posteriores de esta sección:

```bash
ADB="$HOME/Android/sdk/platform-tools/adb"
"$ADB" devices -l

# Ejemplo observado: sustituir si devices informa otro serial.
SERIAL=emulator-5554
"$ADB" -s "$SERIAL" emu avd name
"$ADB" -s "$SERIAL" shell getprop sys.boot_completed
```

Continuar solo si el destino figura como `device`, el nombre es `Lumapse_API_36`
y el arranque devuelve `1`. El serial puede cambiar; **no enviar comandos a un
destino supuesto ni usar ADB sin `-s`**, aunque solo se espere un emulador. Esto
evita afectar un teléfono conectado. Ver [selección de destino en ADB](https://developer.android.com/tools/adb).

Con Lumapse instalada y una prueba autorizada:

```bash
"$ADB" -s "$SERIAL" shell am start -W -n com.lumapse.app/.MainActivity

# Captura privada con nombre nuevo; no incorporarla automáticamente al repositorio.
mkdir -p "$HOME/.cache/lumapse-android-setup"
"$ADB" -s "$SERIAL" exec-out screencap -p \
  > "$HOME/.cache/lumapse-android-setup/lumapse-$(date -u +%Y%m%dT%H%M%S%N).png"

# Solo sobre el campo enfocado y con datos sintéticos autorizados:
"$ADB" -s "$SERIAL" shell input text 'Nota%sde%sprueba'
```

También se usaron toques por coordenadas mediante `shell input tap X Y`, después
de inspeccionar la pantalla. Esas coordenadas dependen de resolución, teclado,
scroll y estado del editor: no constituyen un selector estable ni una suite
automática. En la inspección realizada, UIAutomator expuso el contenedor WebView,
no los campos HTML internos. El texto de prueba se envió en ASCII, con `%s` para
espacios; no acredita entrada Unicode ni sustituye la prueba manual del teclado.
Antes de Guardar, comprobar visualmente título, cuerpo y posibles borradores.

**Seguridad del destino:** la autorización del autor para manipular notas
sintéticas de este AVD no autoriza intervenir datos personales ni otros
dispositivos. Instalación, importación, terminación y borrado requieren el permiso
pertinente. No usar `--clean`, desinstalación, `pm clear`, `-wipe-data` o **Wipe Data**
como pasos habituales. Las capturas pueden contener notas: conservarlas en privado
y anonimizar la evidencia que vaya a publicarse.

### 8.6 APK existente y compilación futura desde Arch

Para probar una APK ya construida basta con el AVD, ADB y un artefacto compatible;
**no se requiere completar un build local ni instalar JDK 21 para esa ejecución**.
Con autorización para instalar sobre este AVD, destino comprobado y firma compatible:

```bash
# Registrar identidad del archivo antes de instalar; ajustar la ruta real.
sha256sum /ruta/al/archivo.apk
"$ADB" -s "$SERIAL" install -r /ruta/al/archivo.apk
```

La opción `-r` reinstala conservando datos. Ante incompatibilidad de firma,
detenerse: no desinstalar para forzar el reemplazo. Registrar versión/code,
canal/origen cuando esté disponible, SHA-256 y certificado del APK, conforme a
[Identificación de compilaciones en Acerca de](#identificación-de-compilaciones-en-acerca-de).
La versión visible y el SHA del repositorio no identifican por sí solos el binario.

Para el ciclo futuro **código → build → instalación** desde el clon, primero
completar JDK 21, preparar SDK/Java de 8.2 y activar **Node 22.20.0 / npm 10.9.3**
según `.nvmrc` y [ADR-010](./adr/ADR-010-gate-portable-y-entorno-canonico.md).
Usar `npm ci` cuando corresponda preparar las dependencias del lockfile; comprobar
`npm run check:runtime`. Después, con instalación expresamente autorizada:

```bash
# Desde la raíz del repositorio, con el destino del AVD comprobado:
npm run deploy:android -- --target "$SERIAL"
```

Se conserva el script habitual de la sección 5.2, sin bump, publicación ni modo
limpio por prueba. **Este ciclo de compilación no se ejecutó ni quedó validado en
Arch durante la instalación del emulador**; su primer resultado debe registrarse
por separado. Tampoco se reinstaló la APK para escribir la nota de prueba inicial.

### 8.7 Smoke inicial y criterio para las siguientes pruebas

El 2026-10-04, con una APK instalada por el autor, se realizó este smoke acotado:

| Paso | Resultado observado |
|---|---|
| Identificar aplicación y entorno | `com.lumapse.app`, versión `0.5.0`, code `500`; AVD `Lumapse_API_36`, Android 16 / API 36, x86_64 |
| Probar teclado físico | El autor confirmó escritura después del ajuste de 8.4 |
| Conservar el borrador previo | Se guardó como otra nota mediante la UI, antes de crear la nota nueva |
| Escribir y guardar | Título «Prueba de teclado en emulador» y cuerpo sintético enviados por ADB; botón Guardar accionado en la UI; nota visible en Entrada y editor limpio |
| Reabrir el proceso de la app | Tras `am force-stop com.lumapse.app` y nuevo inicio autorizado, la nota y las anteriores seguían visibles |

Las capturas locales de escritura, guardado y reapertura quedaron en
`~/.cache/lumapse-android-setup`; no se versionan. **No se registró el hash ni el
certificado de esa APK**, por lo que esta observación no se atribuye a un commit,
al asset publicado ni al HEAD descargado posteriormente. La inyección de texto por
ADB y la confirmación manual del teclado son comprobaciones distintas.

Este resultado demuestra únicamente el flujo observado de captura/guardado y
persistencia de una nota final tras reiniciar el proceso. No prueba reinicio del
dispositivo, borradores ante terminación inesperada, ventana de 500 ms, funcionamiento
en modo avión, restauración ZIP, rendimiento a 500 notas ni compatibilidad general.
**No cierra RNF-002, RNF-004, RNF-009, RNF-010 ni F3**, y no sustituye la aceptación
del autor en un teléfono físico.

Para cada prueba posterior, registrar fecha, host Arch, AVD/API/ABI, versiones de
emulador y WebView cuando correspondan, identidad del APK, datos sintéticos y
conteos, pasos realmente ejecutados, resultado y evidencia privada/anonimizada.
Distinguir **planeado**, **ejecutado**, **fallido** y **pendiente**; no presentar una
compilación o una observación visual como una medición de latencia/FPS.
Las pruebas de esta estación complementan la validación física; las series RNF y
sus criterios permanecen en el [protocolo canónico de validación del núcleo](./beta-core-validation/protocolo.md)
y su [registro de evidencia](./beta-core-validation/README.md).
