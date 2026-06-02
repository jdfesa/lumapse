# Informe inicial de Hito 05 — Testing, Calidad y Distribución

**Período:** Septiembre 2026 (en curso)
**Hito:** 05 — Testing, Calidad y Distribución
**Proyecto:** Lumapse
**Estado:** Activo formalmente tras el cierre del Hito 04
**Última actualización:** 2026-06-02

---

## Resumen Ejecutivo

El Hito 05 tiene como objetivo garantizar la calidad del producto y preparar su distribución. Parte de su base técnica se adelantó antes del cierre formal del Hito 04 para reducir riesgo: suite de tests, quality gate, auditorías automatizadas y CI en GitHub Actions.

Desde el 2026-06-01, el Hito 04 queda cerrado formalmente y este hito pasa a ser el foco operativo del proyecto: release dry-run, APK firmado, validación manual en Android y preparación de artefactos de distribución.

---

## Avance Inicial

| Área | Estado | Evidencia |
|---|---|---|
| Suite Vitest | ✅ Implementada | `npm run test` con 494 tests |
| Quality gate local | ✅ Verificado | `npm run verify` ejecutado sin fallos el 2026-06-02 |
| GitHub Actions | ✅ Implementado | Workflow `CI — Quality Gate` |
| Auditorías documentales/schema | ✅ Implementadas | `check:traceability`, `check:docs`, `check:schema`, `check:dbml`, `check:subjects` |
| Guardia de diálogos nativos | ✅ Implementada | `npm run check:native-dialogs` |
| Smoke tests Android | ✅ Corregidos | Tests bajo `com.lumapse.app` |
| Checklist Android | ✅ Preparado | [`checklist-validacion-android.md`](../gestion/checklist-validacion-android.md) |
| Distribución APK | ⏳ Pendiente | APK firmado y GitHub Releases |
| Testing en dispositivo real | ⏳ Pendiente | Validación manual formal |
| Release dry-run | ✅ Completado | `scripts/release-helper.py --type patch --dry-run` propone `0.4.8` sin bloqueos |

---

## Estrategia de Release Candidata

El corte `0.4.8` se toma como **release candidata funcional** para validacion controlada, no como cierre final del producto ni como apertura de nuevas funcionalidades. Su objetivo es demostrar que el nucleo de Lumapse ya puede probarse como APK: captura de notas, organizacion por materias/secciones, busqueda, Markdown, estados academicos, papelera, fechas academicas discretas, persistencia local SQLite y funcionamiento offline.

Cualquier feedback recibido durante esta etapa debe clasificarse en tres grupos:

- **Bug bloqueante:** impide usar, instalar, guardar datos o navegar flujos principales.
- **Mejora menor:** ajuste de claridad, texto, accesibilidad o friccion que no cambia el alcance.
- **Feature post-release:** ideas valiosas, como adjuntos de imagen, backup o sincronizacion, que se registran en backlog sin entrar al corte actual.

Esta estrategia evita que la beta se convierta en expansion de alcance. La prioridad del Hito 05 sigue siendo estabilizar, probar en Android real y preparar distribucion.

---

## Criterios de Cierre Propuestos

- `npm run verify` pasa sin fallos.
- CI `Quality Gate` pasa en GitHub Actions.
- APK firmado generado y documentado.
- APK publicado en GitHub Releases.
- Pruebas manuales en dispositivo Android real registradas.
- Bugs y edge cases críticos cerrados o documentados con severidad.
- Documentación final actualizada: README, CHANGELOG, informe final, cheatsheet y líneas base.

---

## Relación con Hito 04

La preparación de Hito 05 comenzó como trabajo técnico adelantado. Con el cierre formal del Hito 04, las tareas nuevas se clasifican en Hito 05, Hito 06 o backlog post-release. El Hito 04 solo debería reabrirse por correcciones críticas de documentación histórica.
