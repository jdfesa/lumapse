# Firma de APK Android — Lumapse

**Hito:** 06 — Entrega Final  
**Versión publicada vigente:** 0.5.0<br>
**Candidato local:** 0.6.0/600 — Release Candidate 1<br>
**Estado:** beta publicada preservada; candidato firmado instalado mediante
actualización desde la pública `0.5.0`, con apertura y conservación del conjunto
de prueba verificadas. Resto de validación, aceptación y publicación pendientes.

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
releases/vVERSION/lumapse-vVERSION.apk
```

---

## Verificacion

La firma se verifica con `apksigner`:

```bash
apksigner verify --verbose --print-certs releases/vVERSION/lumapse-vVERSION.apk
```

El resultado esperado debe indicar esquemas de firma verificados y mostrar el certificado usado. El hash SHA-256 del APK firmado se registra junto al corte.

---

## Candidato local 0.6.0 — RC1

La [fuente y verificación del candidato](candidato-apk-0.6.0.md#identidad-del-binario)
identifican la APK generada el 2026-10-22, no una nueva publicación:

| Campo | Valor |
|---|---|
| APK local | `releases/v0.6.0/lumapse-v0.6.0.apk` |
| Versión/code | `0.6.0/600` |
| SHA-256 APK | `70d98d5da883651fd9ce7a25ad2e5e15208424f6337dfb6d5b7ed42db9e278c7` |
| Certificado SHA-256 | `91d719826e632e10f331913c3835c51e38cf780eb139940eb3b0bf1ed6a157cd` |
| Verificación | `apksigner` PASS/v2, `zipalign` PASS, manifest no-debuggable |

Se reutilizó la identidad de distribución existente; claves y configuración se
mantienen en almacenamiento temporal privado fuera del repositorio. No se generó
otra clave ni se modificaron los assets de `v0.4.8`/`v0.5.0`. La coincidencia del
certificado **no** verifica por sí sola una actualización conservando datos.
La [actualización desde la beta pública](candidato-apk-0.6.0.md#actualización-pública-050-a-060--2026-10-22)
se comprobó después con la APK exacta, sin borrar/restaurar desde la referencia:
apertura, datos, borrador y tema conservados. Los recorridos restantes del candidato,
tráfico/trackers y aceptación del autor permanecen pendientes antes de publicar.

## Resultado publicado 0.5.0

| Campo | Valor |
|---|---|
| APK firmada | `releases/v0.5.0/lumapse-v0.5.0.apk` |
| SHA-256 APK | `d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884` |
| Versión Android | `versionName 0.5.0` / `versionCode 500` |
| Tag / commit | `v0.5.0` / `5840755` |
| Publicación | [GitHub pre-release `Lumapse v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) |
| Asset publicado | [`lumapse-v0.5.0.apk`](https://github.com/jdfesa/lumapse/releases/download/v0.5.0/lumapse-v0.5.0.apk), 25.762.498 bytes |
| Verificación | `apksigner verify --verbose --print-certs` |
| Esquema validado | APK Signature Scheme v2 |
| Certificado | `CN=Jose David Sandoval, OU=Lumapse, O=Lumapse, L=Salta, ST=Salta, C=AR` |
| Certificado SHA-256 | `91d719826e632e10f331913c3835c51e38cf780eb139940eb3b0bf1ed6a157cd` |
| Estado Android | Build equivalente `0.5.0/500` instalado sobre `0.4.8` sin desinstalar; datos conservados y funcionamiento aprobado manualmente |

La APK publicada usa el mismo certificado de producción que `v0.4.8`. GitHub informa para el único asset el digest `sha256:d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884`, coincidente con el cálculo local. El dispositivo de prueba tenía una compilación debug instalada; por ello la validación conservando datos utilizó el mismo código `0.5.0/500` firmado con la clave debug. Esa ejecución no debe presentarse como instalación del asset firmado de GitHub: la comprobación pendiente de ese binario queda explicitada en la checklist Android.

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
