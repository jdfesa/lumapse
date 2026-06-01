# Backlog y Deuda Técnica — Lumapse

Este documento funciona como bandeja viva de tareas, deuda y decisiones pendientes. El historial detallado de hitos cerrados se conserva en [`docs/gestion/historico/`](docs/gestion/historico/) y en los informes de [`docs/hitos/`](docs/hitos/).

> **Hito activo:** 05 — Testing, Calidad y Distribución
> **Hito 04:** Cerrado formalmente el 2026-06-01
> **Última actualización:** 2026-06-01 — revisión exportación/importación local
> **Snapshot histórico:** [`docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md`](docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md)

---

## Estado Actual

Hito 04 quedó cerrado formalmente como bloque de Organización y UX. El cierre combinó implementación mínima de pulido UX (empty states) y decisiones explícitas de postergación/descarte para funcionalidades opcionales que podían agregar ruido visual o sugerir capacidades no presentes todavía.

Hito 05 queda activo con foco en estabilización, calidad y distribución. La prioridad ya no es sumar funcionalidad nueva, salvo `RF-016` en alcance mínimo, sino validar el producto, preparar el APK y ordenar los artefactos finales.

La revisión de exportación/importación corrige una sobrepromesa documental: existen servicios base (`ExportService`/`ImportService`), pero la UI actual no expone esos flujos. Para Hito 05 se conserva solo el alcance mínimo de compartir/exportar una nota individual; backup `.zip` e importación quedan como deuda de más largo plazo.

---

## Prioridad Inmediata — Hito 05

| Orden | Tarea | Criterio de cierre |
|---|---|---|
| 1 | Release dry-run | `python3 scripts/release-helper.py --type patch --dry-run` ejecutado y resultado documentado |
| 2 | Gate local completo | `npm run verify` pasa sin fallos o deja bloqueos explícitos |
| 3 | Checklist Android | Flujo manual de prueba en dispositivo real documentado |
| 4 | APK firmado | Artefacto generado con versión definida |
| 5 | Distribución | Release o mecanismo de entrega documentado |
| 6 | RF-023 — Acerca de | Sección mínima con versión, autor y licencia, sin convertirla en tutorial |
| 7 | RF-016 — Compartir/exportar nota individual | Acción secundaria implementada y validada en Android real |

---

## Decisiones Postergadas por Diseño

Estas tareas no bloquean el MVP. Se conservan como decisiones trazables para reabrir solo con feedback real de estudiantes o por madurez del producto.

| ID | Decisión | Estado | Justificación |
|---|---|---|---|
| RF-006 | Conteo de palabras/caracteres | Postergado | Lumapse prioriza captura rápida; un contador permanente agregaría ruido al editor |
| RF-022 | Onboarding carousel | Postergado | La primera release valida si la UI y los empty states ya son suficientes |
| RF-024 | Indicador online/offline | Postergado | Sin sincronización o backup, el estado de red no modifica el flujo y puede crear expectativas falsas |
| DP-006 | Guía Markdown dedicada | Postergado | Lumapse funciona con texto plano; Markdown no debe sentirse como requisito de entrada |
| Coach marks | Tooltips de primera vez | Descartado para Hito 04 | Pueden interrumpir el flujo mobile-first de captura rápida |

---

## Portabilidad local — Alcance decidido

| ID | Decisión | Complejidad | Recomendación |
|---|---|---|---|
| RF-016 | Compartir/exportar nota individual | Baja/Media | Implementado en menú secundario; pendiente validación en Android real |
| RF-017 | Exportar respaldo `.zip` local | Media | Deuda técnica de largo plazo; útil para portabilidad, pero requiere formato de backup, destino Android y pruebas reales |
| RF-018 | Importar `.md` o `.zip` | Media/Alta | Deuda de más largo plazo; si se retoma una nota individual, debe entrar en `Entrada` y no reconstruir materias/secciones automáticamente |

---

## Deuda Técnica Viva

| Área | Tarea | Prioridad | Notas |
|---|---|---|---|
| Testing | Agregar tests menores para `moveNote()` en `NoteStore.data.test.js` | Baja | Deuda post-auditoría, no bloquea release si el gate pasa |
| Testing | Eliminar clave `deleteSection` duplicada en mock de tests | Baja | Limpieza de test fixture |
| Documentación | Revisar documentos generados antes del corte final | Media | Informe completo y cheatsheet deben reflejar la versión de release |
| Diagramas | Actualizar gráficos DB exportados | Media | Regenerar al cierre documental final con modelo congelado |
| Release | Definir versión del próximo corte | Media | Evaluar si Fechas Académicas discretas sale como `0.4.8` |

---

## Alcance Congelado

No incorporar en Hito 05 salvo decisión explícita:

- Agenda completa.
- Notificaciones push.
- Recurrencias, horarios o duración de eventos.
- Sincronización externa.
- Backup en nube.
- Importación automática de backups complejos sin política de merge.
- Tutoriales obligatorios.
- Nuevas capas de organización más allá de Materia / Sección / Nota.

---

## Largo Plazo / Post-Defensa

- [ ] Sincronización o backup manual en la nube, por ejemplo Google Drive, si la comunidad estudiantil adopta el producto y lo pide.
- [ ] Backup local `.zip` de workspace completo, con formato documentado y prueba en Android real.
- [ ] Importación de notas/backups, empezando por nota individual hacia `Entrada` y dejando merge de materias/secciones para una etapa posterior.
- [ ] Ayuda ampliada o mini guía Markdown dentro de una sección `Acerca de/Ayuda`, solo si el feedback demuestra fricción real.
- [ ] Métricas de escritura como contador de palabras/caracteres, solo si aparecen casos de uso académicos concretos.
- [ ] Onboarding o coach marks, solo si la primera release muestra problemas de descubrimiento.

---

## Archivos Históricos

- [`docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md`](docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md): backlog completo antes de la limpieza.
- [`docs/gestion/historico/plan-fechas-academicas-discretas-2026-05-31.md`](docs/gestion/historico/plan-fechas-academicas-discretas-2026-05-31.md): plan operativo completo de Fechas Académicas discretas.
- [`docs/hitos/hito-04-agosto.md`](docs/hitos/hito-04-agosto.md): informe formal del Hito 04.
- [`CHANGELOG.md`](CHANGELOG.md): registro histórico de cambios por versión.
