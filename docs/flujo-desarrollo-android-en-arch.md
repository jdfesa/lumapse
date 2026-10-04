# Flujo de Desarrollo Android en Arch Linux — Lumapse

**Incorporación y comprobación del entorno: 2026-10-04.** Esta guía describe la
instalación y las pruebas habituales de desarrollo de Lumapse desde esta estación
**Arch Linux x86_64**, mediante el **emulador de Android Studio**, con interacción
manual o asistencia por ADB.

Complementa el [flujo con dispositivos físicos desde macOS](./flujo-desarrollo-android.md).
No reemplaza las instrucciones ni la evidencia de los Samsung conservadas en ese
documento.

## Contenido

- [1. Alcance y estado comprobado](#1-alcance-y-estado-comprobado)
- [2. Instalación en Arch: yay, rutas y Java](#2-instalación-en-arch-yay-rutas-y-java)
- [3. SDK, aceleración y creación del dispositivo virtual](#3-sdk-aceleración-y-creación-del-dispositivo-virtual)
- [4. Inicio del emulador y corrección de entrada de teclado](#4-inicio-del-emulador-y-corrección-de-entrada-de-teclado)
- [5. Control desde esta estación y desde el asistente](#5-control-desde-esta-estación-y-desde-el-asistente)
- [6. APK existente y compilación futura desde Arch](#6-apk-existente-y-compilación-futura-desde-arch)
- [7. Smoke inicial y criterio para las siguientes pruebas](#7-smoke-inicial-y-criterio-para-las-siguientes-pruebas)

## 1. Alcance y estado comprobado

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

## 2. Instalación en Arch: `yay`, rutas y Java

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
- **Build de Lumapse:** usar JDK 21, como indica la
  [guía de JDK del flujo con dispositivos físicos](./flujo-desarrollo-android.md#23-jdk-java-development-kit) y
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

## 3. SDK, aceleración y creación del dispositivo virtual

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

## 4. Inicio del emulador y corrección de entrada de teclado

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
ya identificado (ver selección de `ADB` y `SERIAL` en la
[sección 5](#5-control-desde-esta-estación-y-desde-el-asistente)):

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

## 5. Control desde esta estación y desde el asistente

La interacción manual se realiza con mouse y teclado sobre la ventana del
emulador: clic para tocar, foco en el campo para escribir y controles laterales
para navegación. **scrcpy no es necesario** para esta ventana; conserva su papel
en el [flujo con teléfonos físicos](./flujo-desarrollo-android.md#41-scrcpy--screen-copy).

El asistente controla el AVD mediante comandos locales del **ADB del SDK** y
capturas de pantalla que inspecciona antes de actuar. No accede al editor escribiendo
directamente en SQLite. Las restricciones del entorno de ejecución pueden requerir
aprobación para acceder al ADB del host o abrir la ventana; no se eluden ni se
comparten contraseñas.

En una terminal, identificar primero el destino. Las variables siguientes se
reutilizan en los ejemplos posteriores de esta guía:

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

## 6. APK existente y compilación futura desde Arch

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
[Identificación de compilaciones en Acerca de](./flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de).
La versión visible y el SHA del repositorio no identifican por sí solos el binario.

Para el ciclo futuro **código → build → instalación** desde el clon, primero
completar JDK 21, preparar SDK/Java de la
[sección 2](#2-instalación-en-arch-yay-rutas-y-java) y activar **Node 22.20.0 / npm 10.9.3**
según `.nvmrc` y [ADR-010](./adr/ADR-010-gate-portable-y-entorno-canonico.md).
Usar `npm ci` cuando corresponda preparar las dependencias del lockfile; comprobar
`npm run check:runtime`. Después, con instalación expresamente autorizada:

```bash
# Desde la raíz del repositorio, con el destino del AVD comprobado:
npm run deploy:android -- --target "$SERIAL"
```

Se conserva el
[script habitual de despliegue](./flujo-desarrollo-android.md#52-compilación-y-despliegue-en-dispositivo-ciclo-completo),
sin bump, publicación ni modo limpio por prueba. **Este ciclo de compilación no se
ejecutó ni quedó validado en Arch durante la instalación del emulador**; su primer
resultado debe registrarse por separado. Tampoco se reinstaló la APK para escribir
la nota de prueba inicial.

## 7. Smoke inicial y criterio para las siguientes pruebas

El 2026-10-04, con una APK instalada por el autor, se realizó este smoke acotado:

| Paso | Resultado observado |
|---|---|
| Identificar aplicación y entorno | `com.lumapse.app`, versión `0.5.0`, code `500`; AVD `Lumapse_API_36`, Android 16 / API 36, x86_64 |
| Probar teclado físico | El autor confirmó escritura después del ajuste de la sección 4 |
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
