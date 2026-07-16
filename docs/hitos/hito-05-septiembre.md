# Informe de cierre de Hito 05 — Testing, Calidad y Distribución

**Período planificado:** Septiembre 2026

**Período operativo:** 2026-06-01 a 2026-07-15

**Hito:** 05 — Testing, Calidad y Distribución

**Proyecto:** Lumapse

**Estado:** Cerrado documentalmente

**Última actualización:** 2026-07-15

---

## Resumen Ejecutivo

Hito 05 se cierra con su objetivo principal cumplido: Lumapse dispone de un quality gate repetible, una APK firmada, validación inicial en Android real y una beta controlada publicada. La línea base operativa es [`v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8), asociada al commit `a808de7`.

El hito también incorporó mejoras funcionales acotadas que aumentaron la utilidad de la beta sin abandonar la arquitectura offline-first: borradores persistentes (`RF-005`), backup manual externo (`RF-017`), importación de backup ZIP (`RF-018`), sección Acerca de (`RF-023`), fechas académicas discretas (`RF-027`) y editor enriquecido (`RF-028`).

`v0.4.8` sigue siendo una beta/candidata operativa, no la versión estable final. En el checkpoint previo a la reconciliación documental se contaban 12 commits posteriores al tag en `main`; no forman parte de la APK publicada, el conteo puede crecer y no se promueven automáticamente a `0.4.9`.

## Resultado Final

| Área | Resultado | Evidencia |
|---|---|---|
| Suite Vitest | ✅ Verificada | `npm run verify` registró 773 tests unitarios pasando en el corte de release |
| Quality gate local | ✅ Verificado | Gate ejecutado sin fallos el 2026-06-30 y repetido el 2026-07-01 |
| GitHub Actions | ✅ Operativo | Workflow `CI — Quality Gate` |
| Auditorías | ✅ Operativas | Trazabilidad, links, schema, DBML, jerarquía, a11y, tamaño y diálogos nativos |
| Smoke tests Android | ✅ Corregidos | Tests bajo `com.lumapse.app` |
| Versionado Android | ✅ Congelado | `versionName "0.4.8"`, `versionCode 408` |
| APK unsigned | ✅ Generada como evidencia | `lumapse-v0.4.8-unsigned.apk`, no publicable |
| APK firmada | ✅ Verificada | `lumapse-v0.4.8.apk`, firma v2 |
| Validación Android | ✅ Aprobada inicialmente | Samsung Galaxy S20 FE (`SM-G780G`), Android 13 |
| Distribución | ✅ Publicada | GitHub Release `v0.4.8` como pre-release/beta controlada |
| Bugs críticos | ✅ Sin bloqueantes registrados | No se observaron crashes ni pérdida de datos |
| Documentación operativa | ✅ Sincronizada | README, CHANGELOG, línea base, cheatsheet y este informe |

## Artefacto de Salida

| Campo | Valor |
|---|---|
| Release | [`Lumapse v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8) |
| Commit del tag | `a808de7` |
| Asset | `lumapse-v0.4.8.apk` |
| SHA-256 | `cad122d0329e1761816ac7ad07938673389c859a252d9cc63504359355db3d10` |
| Tipo | Pre-release / beta controlada |
| Dispositivo validado | Samsung Galaxy S20 FE, Android 13 |

El artefacto unsigned se conserva solo como evidencia técnica local. La keystore y las credenciales de firma permanecen fuera de Git; Gradle recibe los secretos mediante variables de entorno.

## Cronología de Release

1. **2026-06-30 — Corte candidato:** el dry-run de release no reportó bloqueos, `npm run verify` pasó y `package.json`, `package-lock.json` y Android quedaron alineados con `0.4.8` / `408`.
2. **2026-06-30 — Build y firma:** se generaron la APK unsigned y la APK firmada; `apksigner` confirmó APK Signature Scheme v2.
3. **2026-07-01 — Validación real:** la APK se instaló y probó en el S20 FE sin crashes ni pérdida de datos.
4. **2026-07-01 — Publicación:** se creó la GitHub Release `v0.4.8` y se adjuntó la APK firmada.
5. **2026-07-01 a 2026-07-04 — Trabajo posterior:** `main` acumuló 12 commits documentales y refactors de TypeScript que no pertenecen al artefacto publicado.
6. **2026-07-15 — Cierre documental:** se normalizó el changelog, se cerró este hito y se activó Hito 06.

## Cambios de Alcance Controlados

| RF/HU | Cambio | Resultado |
|---|---|---|
| `RF-005 / HU-005` | Borradores persistentes | Verificado con cambio de app y restauración del trabajo en curso |
| `RF-017 / HU-030` | Backup manual `.zip` externo | Implementado y validado en Android real |
| `RF-018 / HU-031` | Importación de backup ZIP | Preview, transacción y duplicados no destructivos verificados |
| `RF-023 / HU-023` | Sección Acerca de | Implementada con versión, autor, licencia y alcance |
| `RF-027 / HU-027` | Fechas académicas discretas | Implementadas sin agenda completa, recurrencias ni sync |
| `RF-028 / HU-028` | Editor enriquecido | Comandos `/`, `+`, `Aa`, callouts y Modo Enfoque implementados |

Estos cambios suman 36 SP entregados en Hito 05. No reabren Hito 04 y no habilitan nuevas features durante el cierre final.

## Criterios de Cierre

- [x] `npm run verify` pasó en el corte de release.
- [x] El workflow `CI — Quality Gate` quedó operativo.
- [x] La APK firmada fue generada, verificada y documentada.
- [x] La APK fue publicada en GitHub Releases.
- [x] La validación manual en Android real quedó registrada.
- [x] No quedaron bugs bloqueantes conocidos para la beta controlada.
- [x] README, CHANGELOG, línea base, velocidad y cheatsheet reflejan el corte operativo.
- [x] El trabajo documental final y los gráficos DB quedaron transferidos explícitamente a Hito 06.

## Observaciones No Bloqueantes Transferidas

- **Interacción `Mover a`:** en el S20 FE algunas pulsaciones parecieron requerir una interacción prolongada. La acción pudo completarse y no bloqueó la beta.
- **Rendimiento con más datos:** la prueba inicial fue correcta con pocas notas; Hito 06 debe registrar evidencia con un conjunto mayor y más representativo.

Estas observaciones se revisarán en la validación final. Solo una reproducción con impacto real sobre el uso o la integridad de datos justificaría reabrir código antes de la entrega.

## Transferencia a Hito 06

Hito 06 comienza con cuatro frentes: revisión editorial final, gráficos de base de datos, validación final y presentación. El plan y sus criterios de salida se registran en [`hito-06-octubre.md`](hito-06-octubre.md).

Hito 04 y Hito 05 permanecen cerrados. Solo deberían reabrirse para corregir evidencia histórica crítica; cualquier trabajo nuevo se clasifica en Hito 06 o en backlog post-defensa.
