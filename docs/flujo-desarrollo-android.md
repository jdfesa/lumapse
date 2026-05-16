# Flujo de Desarrollo Android — Lumapse

> **Documento:** Guía operativa de desarrollo, compilación y testing en dispositivos Android.  
> **Última actualización:** Mayo 2026  
> **Autor:** José David Sandoval

---

## 1. Visión general

Lumapse es una aplicación web (HTML/CSS/JS) empaquetada como app Android nativa
mediante **Capacitor**. El desarrollo se realiza en macOS y las pruebas se ejecutan
en dispositivos Android físicos conectados por USB.

### Diagrama del flujo

```
┌──────────────────────────────────────────────────────────────┐
│  DESARROLLO (macOS)                                          │
│                                                              │
│  Código JS/CSS/HTML  →  npm run build  →  dist/             │
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

## 2. Dispositivos de prueba

| Dispositivo | Samsung Galaxy S7 Edge | Samsung Galaxy S20 FE |
|---|---|---|
| **Android** | 10 | 13 |
| **Root** | Sí (Magisk) | No |
| **Rol** | Desarrollo y debugging diario | Validación final y demos |
| **Conexión** | Micro USB | USB-C |
| **Pantalla** | ⚠️ Módulo dañado (no se ve) — se usa scrcpy | Funcional |
| **ADB** | Configurado y autorizado | Disponible |
| **Notas** | Soporta nativamente hasta Android 8; actualizado a Android 10 mediante ROM custom (root previo). Al tener el módulo de pantalla dañado, **toda la interacción se realiza remotamente desde macOS usando scrcpy**. | Teléfono de uso diario. Se usa para verificar que la app funcione correctamente en un dispositivo estándar (sin root, Android actualizado), simulando la experiencia del usuario final. |

### ¿Por qué dos dispositivos?

- **S7 Edge (desarrollo):** Al estar rooteado y ser un dispositivo dedicado (no de uso personal),
  permite debugging profundo (logcat, inspección de bases de datos, reinstalación frecuente)
  sin riesgo de afectar datos personales.
- **S20 FE (validación):** Representa al usuario real. Si la app funciona bien en un dispositivo
  sin root, con Android 13 y sin configuración especial, es evidencia de que funcionará para
  los estudiantes del IES 6023.

---

## 3. Herramientas del entorno

### 3.1 scrcpy — Screen Copy

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

### 3.2 ADB — Android Debug Bridge

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

## 4. Flujo de trabajo paso a paso

### 4.1 Desarrollo de UI (ciclo rápido — sin compilar APK)

Para cambios de interfaz (CSS, layout, textos), el ciclo más rápido es usar el
servidor de desarrollo de Vite directamente desde el navegador del celular:

```bash
# 1. Levantar el servidor de desarrollo
npm run dev

# 2. Anotar la URL de red local (ej: http://192.168.x.x:5173)
# 3. Abrir esa URL en Chrome del celular (misma red WiFi)
# 4. Los cambios se reflejan en tiempo real (HMR)
```

> **Limitación:** Este modo NO tiene acceso a plugins nativos de Capacitor
> (SQLite, filesystem, etc.). Solo sirve para UI.

### 4.2 Compilación y despliegue en dispositivo (ciclo completo)

Cuando se necesita probar funcionalidades nativas o validar la app como APK:

```bash
# 1. Compilar la web app
npm run build

# 2. Sincronizar los assets con el proyecto Android
npx cap sync android

# 3. Compilar el APK e instalar en el dispositivo conectado
npx cap run android

# Si hay un solo dispositivo conectado, se instala automáticamente.
# Si hay varios, se puede especificar:
npx cap run android --target <DEVICE_ID>
```

### 4.3 Interacción con el S7 Edge (pantalla dañada)

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

### 4.4 Ciclo completo resumido

```bash
# Editar código → Build → Sync → Run → Verificar en scrcpy
npm run build && npx cap sync android && npx cap run android
scrcpy --turn-screen-off -K
```

---

## 5. Resolución de problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| `adb devices` no muestra el celular | Cable USB o depuración USB desactivada | Verificar que "Depuración USB" esté activada en Opciones de Desarrollador |
| `npx cap run android` falla con error de Gradle | Primera ejecución o caché corrupto | Ejecutar `cd android && ./gradlew clean && cd ..` y reintentar |
| La app muestra pantalla en blanco | `dist/` no está generado o desactualizado | Ejecutar `npm run build` antes de `npx cap sync` |
| scrcpy no conecta | ADB no autorizado en el dispositivo | Verificar el popup de autorización en el celular (o usar `adb kill-server && adb start-server`) |
| El APK no se instala en el S20 FE | "Fuentes desconocidas" deshabilitado | Habilitar instalación de apps de fuentes desconocidas en Configuración |

---

## 6. Ubicación de artefactos generados

| Artefacto | Ruta | Descripción |
|---|---|---|
| Web app compilada | `dist/` | Output de `npm run build` (no se commitea) |
| Proyecto Android | `android/` | Generado por Capacitor (se commitea) |
| APK debug | `android/app/build/outputs/apk/debug/app-debug.apk` | APK para testing (no se commitea) |
| Config de Capacitor | `capacitor.config.json` | AppId, webDir y plugins |

---

> **Nota:** Este documento se actualiza cada vez que se incorpore una nueva herramienta
> o cambie el flujo de trabajo. Para el flujo de contribución al código fuente
> (branches, commits, pull requests), ver [`CONTRIBUTING.md`](../CONTRIBUTING.md).
