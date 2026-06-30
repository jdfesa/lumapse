# Informe inicial de Hito 05 — Testing, Calidad y Distribución

**Período:** Septiembre 2026 (en curso)
**Hito:** 05 — Testing, Calidad y Distribución
**Proyecto:** Lumapse
**Estado:** Activo formalmente tras el cierre del Hito 04
**Última actualización:** 2026-06-30

---

## Resumen Ejecutivo

El Hito 05 tiene como objetivo garantizar la calidad del producto y preparar su distribución. Parte de su base técnica se adelantó antes del cierre formal del Hito 04 para reducir riesgo: suite de tests, quality gate, auditorías automatizadas y CI en GitHub Actions.

Desde el 2026-06-01, el Hito 04 queda cerrado formalmente y este hito pasa a ser el foco operativo del proyecto: release dry-run, APK firmado, validación manual en Android y preparación de artefactos de distribución.

Durante esta etapa también se aceptaron mejoras funcionales controladas que elevan la utilidad real de la beta sin cambiar la arquitectura offline-first: borradores persistentes del editor (`RF-005`), backup manual externo (`RF-017`), importación de backup ZIP (`RF-018`), sección Acerca de (`RF-023`), fechas académicas discretas (`RF-027`) y editor enriquecido (`RF-028`). Quedan registradas en requisitos, HU, changelog y seguimiento de velocidad para evitar que parezcan trabajo fuera de hito.

---

## Avance Inicial

| Área | Estado | Evidencia |
|---|---|---|
| Suite Vitest | ✅ Implementada | `npm run verify` con 773 tests unitarios pasando el 2026-06-30 |
| Quality gate local | ✅ Verificado | `npm run verify` ejecutado sin fallos el 2026-06-30 |
| GitHub Actions | ✅ Implementado | Workflow `CI — Quality Gate` |
| Auditorías documentales/schema | ✅ Implementadas | `check:traceability`, `check:docs`, `check:schema`, `check:dbml`, `check:subjects` |
| Guardia de diálogos nativos | ✅ Implementada | `npm run check:native-dialogs` |
| Smoke tests Android | ✅ Corregidos | Tests bajo `com.lumapse.app` |
| Checklist Android | ✅ Preparado | [`checklist-validacion-android.md`](../gestion/checklist-validacion-android.md) |
| Distribución APK | ⏳ Pendiente | APK firmado y GitHub Releases |
| Testing en dispositivo real | ⏳ Pendiente | Validación manual formal |
| Release dry-run | ✅ Completado | `scripts/release-helper.py --type patch --dry-run` propone `0.4.8` sin bloqueos |
| Release candidata `0.4.8` | ✅ Preparada | `package.json`, `package-lock.json` y `CHANGELOG.md` actualizados con `scripts/release-helper.py --type patch --skip-build --yes` |
| Borradores persistentes del editor | ✅ Verificado | `RF-005 / HU-005`, plan histórico archivado y validación manual con cambio de app/PDF |
| Backup manual externo | ✅ Implementado | `RF-017 / HU-030`, plan histórico archivado |
| Importación de backup ZIP | ✅ Implementado | `RF-018 / HU-031`, preview, importación no destructiva y validación Android real |
| Sección Acerca de | ✅ Implementado | `RF-023 / HU-023`, versión, autor, licencia y alcance offline/local |
| Fechas académicas discretas | ✅ Implementado | `RF-027 / HU-027`, mejora adelantada y acotada |
| Editor enriquecido | ✅ Implementado | `RF-028 / HU-028`, slash commands, `+`, `Aa`, callouts y foco |

---

## Estrategia de Release Candidata

El corte `0.4.8` se toma como **release candidata funcional** para validacion controlada, no como cierre final del producto ni como apertura de nuevas funcionalidades. Su objetivo es demostrar que el nucleo de Lumapse ya puede probarse como APK: captura de notas, organizacion por materias/secciones, busqueda, Markdown, estados academicos, papelera, fechas academicas discretas, backup ZIP manual, persistencia local SQLite y funcionamiento offline.

El 2026-06-30 se congelo la Fase 1 del flujo operativo de release: el dry-run no reporto bloqueos, `npm run verify` paso completo y la version candidata `0.4.8` quedo reflejada en `package.json`, `package-lock.json` y `CHANGELOG.md`. La generacion del APK queda separada como Fase 2 para conservar evidencia clara entre corte candidato, artefacto Android y validacion manual.

Cualquier feedback recibido durante esta etapa debe clasificarse en tres grupos:

- **Bug bloqueante:** impide usar, instalar, guardar datos o navegar flujos principales.
- **Mejora menor:** ajuste de claridad, texto, accesibilidad o friccion que no cambia el alcance.
- **Feature post-release:** ideas valiosas, como adjuntos de imagen, backup automático en nube o sincronizacion, que se registran en backlog sin entrar al corte actual.

Esta estrategia evita que la beta se convierta en expansion de alcance. La prioridad del Hito 05 sigue siendo estabilizar, probar en Android real y preparar distribucion.

## Cambios de Alcance Controlados

| RF/HU | Cambio | Justificación | Estado |
|---|---|---|---|
| `RF-005 / HU-005` | Borradores persistentes del editor | Protege trabajo en curso sin crear ni actualizar notas finales sin confirmación | Verificado |
| `RF-017 / HU-030` | Backup manual `.zip` externo | Evita vendor lock-in y permite salida local antes de la beta | Implementado |
| `RF-018 / HU-031` | Importación de backup ZIP | Permite recuperar un respaldo Lumapse sin sincronización automática ni sobrescritura silenciosa | Implementado |
| `RF-023 / HU-023` | Sección Acerca de | Muestra identidad, licencia y alcance sin sumar tutorial obligatorio | Implementado |
| `RF-027 / HU-027` | Fechas académicas discretas | Aporta recordatorios pasivos sin agenda completa, notificaciones ni sync | Implementado |
| `RF-028 / HU-028` | Editor enriquecido y slash commands | Mejora la toma de notas sin obligar a aprender Markdown ni introducir formato propietario | Implementado |

Estos cambios no reabren Hito 04. Se consideran parte de Hito 05 porque fueron definidos, implementados y documentados después del cierre formal del 2026-06-01.

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
