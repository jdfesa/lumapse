# Candidato APK 0.6.0 — presentación

**Fecha:** 2026-10-22<br>
**Rama:** `chore/presentation-rc1`<br>
**Base integrada:** `9ab9c006bc38dd59d9e275968aa583a3ba1e56b6` (PR #41)<br>
**Estado:** controles de fuente aprobados; generación firmada y validación del
binario pendientes.

## Objetivo y alcance acordados

Preparar la APK `0.6.0/600`, identificada como **Release Candidate 1**, sin nuevas
funciones, refactors ni mejoras. RC describe el candidato de presentación y no
obliga a anunciar `1.0.0` o estabilidad comercial. Se mantiene la versión numérica
admitida por el tooling; `RC1` forma parte del título previsto.

El autor autorizó generar la APK y recuperar la firma existente en almacenamiento
temporal privado fuera del repositorio. La identidad pública del certificado se
comprobó contra la [beta publicada](firma-apk-android.md#resultado-publicado-050);
no se creó ni sustituyó una clave. No se versionan secretos ni sus ubicaciones.

Quedan fuera publicación, creación de tag, merge, instalación en dispositivo,
desinstalación y cambios de datos. Los permisos necesarios se solicitan aparte.
Las betas publicadas no se reemplazan. El título previsto para una eventual
publicación es `Lumapse v0.6.0 — Release Candidate 1`, tag `v0.6.0`, marcada
**Pre-release**; esto no acredita que existan el tag o la publicación.

## Preparación inicial comprobada

- `main` limpio y sincronizado con `origin/main` tras fetch/pull; sin PR abiertos.
  PR #41 integrado y sus checks de calidad y GitGuardian aprobados.
- Node 22.20.0/npm 10.9.3 existentes seleccionados solo para estos procesos.
  `npm run check:runtime` PASS. El runtime global no se modificó.
- `npm run check:docs`: 111 Markdown/1007 enlaces, sin errores.
- `npm run check:traceability`: sin advertencias.
- `python3 scripts/release-helper.py --check`: base `0.5.0/500` alineada.
- Dry-run minor: candidato `0.6.0/600`, firma configurada. Se aplicó el helper
  con `--skip-build` para versionar antes de compilar desde una fuente limpia.

## Controles de la fuente candidata

Ejecutados con el runtime canónico, sin reutilizar métricas de otro corte:

```bash
npm run verify
npm audit --json
npm audit --omit=dev --json
npm run test:coverage -- --maxWorkers=1 --allowOnly=false
```

| Control | Resultado |
|---|---|
| Gate completo de la fuente candidata | PASS, exit 0; 79 archivos/1211 tests de app y 105 de tooling; tres avisos previos de lint, cero errores |
| Auditoría completa/productiva | Ambas exit 0, cero vulnerabilidades conocidas en la consulta del 2026-10-22 |
| Coverage de servicios JS/TS, incluidos subdirectorios | 96,06% de statements (2095/2181), 42 archivos; supera el 70%; suite 1211/1211 PASS |

Enlaces del gate: 112 Markdown/1011 referencias, sin errores. Trazabilidad y
versiones `0.6.0/600` alineadas. `npx cap sync android` conserva los cuatro plugins
existentes y no produce cambios nativos seguidos adicionales. Los logs y resúmenes
crudos quedan fuera del repositorio; no contienen ni publican la configuración de firma.

## Identidad del binario

Se compilará sin volver a incrementar la versión, desde fuente confirmada limpia:
build web con canal `android-candidate`, `npx cap sync android` y
`./gradlew assembleRelease` con la firma existente. No se usa el deploy debug ni
se instala como parte de la compilación. Se verifican firma, manifest, metadata y
hash antes de copiar al directorio local de releases.

| Campo | Valor |
|---|---|
| Versión/code previstos | `0.6.0/600` |
| Canal previsto | `android-candidate` |
| Fuente incorporada en Acerca de | Pendiente |
| APK local previsto | `releases/v0.6.0/lumapse-v0.6.0.apk` |
| SHA-256 del APK | Pendiente |
| Certificado SHA-256 esperado | `91d719826e632e10f331913c3835c51e38cf780eb139940eb3b0bf1ed6a157cd` |
| Firma del APK y variante no-debuggable | Pendiente |
| Tag/publicación | No creados |

## Aceptación del binario y congelación

Aplican los [cinco no negociables del precorte](revision-precorte-2026-10-22.md#no-negociables-y-decisión-de-corte).
Esta preparación no convierte los resultados debug en pruebas del candidato ni
certifica ausencia universal de defectos.

- [ ] Autorizar y comprobar actualización desde la beta firmada pública, sin
  desinstalar ni perder notas, borrador o preferencias. Una firma incompatible
  detiene la operación; no se pide borrar datos como solución.
- [ ] Comprobar instalación/apertura, núcleo offline, conservación de datos y
  borrador, organización/búsqueda, fechas y ZIP local sobre este binario exacto.
- [ ] Repetir tráfico/trackers de RNF-012/013 sobre este binario exacto.
- [ ] Registrar aceptación del autor, con límites PC-02 a PC-08 conservados y
  RNF-020 en evidencia parcial; RNF-002/004 y RNF-005 mantienen su tratamiento.
- [ ] Fijar el artefacto aceptado y su congelación; después adaptar manual,
  emitir matriz RNF, actualizar informe y preparar defensa sobre el mismo corte.

El feedback voluntario no bloquea esos entregables ni abre correcciones de forma
automática. Solo un bloqueo grave confirmado justificaría consultar una excepción
acotada; no se reabre el desarrollo por rutina.
