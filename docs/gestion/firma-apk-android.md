# Firma de APK Android — Lumapse

**Hito:** 05 — Testing, Calidad y Distribucion  
**Version candidata:** 0.4.8  
**Estado:** Fase 2B completada localmente el 2026-06-30

---

## Objetivo

Generar una APK release firmada para distribucion controlada. La APK unsigned de la Fase 2A confirma que el proyecto compila, pero no debe publicarse en GitHub Releases. Para distribuirla, Android requiere una firma estable.

---

## Politica de secretos

- La keystore y las contrasenas no se commitean.
- Los archivos locales de firma se guardan bajo `android/keystores/`, ruta ignorada por Git.
- La keystore debe respaldarse fuera del repo. Si se pierde, no se podran publicar actualizaciones instalables sobre una APK firmada con esa misma clave.
- Las contrasenas se cargan mediante variables de entorno, no dentro de `build.gradle`.

---

## Variables que lee Gradle

`android/app/build.gradle` firma el build `release` solo si existen estas variables:

```bash
export LUMAPSE_RELEASE_STORE_FILE="/ruta/absoluta/lumapse-release.jks"
export LUMAPSE_RELEASE_STORE_PASSWORD="..."
export LUMAPSE_RELEASE_KEY_ALIAS="lumapse-release"
export LUMAPSE_RELEASE_KEY_PASSWORD="..."
```

Si alguna variable falta, `./gradlew assembleRelease` sigue generando una APK unsigned.

---

## Flujo de generacion

```bash
npm run build
npx cap sync android
source android/keystores/lumapse-release.env
cd android
./gradlew assembleRelease
```

Con las variables presentes, Gradle debe producir:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Luego se copia como artefacto local:

```text
releases/v0.4.8/lumapse-v0.4.8.apk
```

---

## Verificacion

La firma se verifica con `apksigner`:

```bash
apksigner verify --verbose --print-certs releases/v0.4.8/lumapse-v0.4.8.apk
```

El resultado esperado debe indicar esquemas de firma verificados y mostrar el certificado usado. El hash SHA-256 del APK firmado se registra en la checklist Android.

---

## Resultado 0.4.8

| Campo | Valor |
|---|---|
| APK firmada | `releases/v0.4.8/lumapse-v0.4.8.apk` |
| SHA-256 APK | `cad122d0329e1761816ac7ad07938673389c859a252d9cc63504359355db3d10` |
| Verificacion | `apksigner verify --verbose --print-certs` |
| Esquema validado | APK Signature Scheme v2 |
| Certificado | `CN=Jose David Sandoval, OU=Lumapse, O=Lumapse, L=Salta, ST=Salta, C=AR` |
| Respaldo externo | `/Users/jd/Library/CloudStorage/Dropbox/99_Archive/lumapse/release-0.4.8/` |

La APK firmada queda lista para validacion manual en dispositivo real. No publicar antes de completar la checklist Android.

El respaldo externo incluye la keystore, el archivo `.env` con variables de firma, la APK firmada, la APK unsigned de evidencia tecnica, checksums SHA-256 y una copia de este documento.
