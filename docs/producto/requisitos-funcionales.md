# Requisitos Funcionales — Lumapse

**Fase Design Thinking:** Idear / Prototipar  
**Última actualización:** 2026-06-19 (sección Acerca de)
**Autor:** José David Sandoval

---

## Convenciones

- **ID:** `RF-XXX` (Requisito Funcional)
- **Prioridad:** `MUST` (obligatorio) · `SHOULD` (deseable) · `COULD` (opcional si hay tiempo)
- **Persona:** Persona de usuario que motiva el requisito → ver [personas.md](./personas.md)
- **Hito:** Hito del roadmap donde se implementa → ver [README.md](../../README.md#roadmap)
- **Estado:** `Pendiente` · `En desarrollo` · `Implementado` · `Verificado` · `Postergado` · `Obsoleto`

---

## Módulo 1 — Gestión de Notas (Core)

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-001 | El sistema debe permitir **crear una nueva nota** con título y contenido en texto plano/Markdown. | MUST | Lucía, Martín | 02 | Implementado |
| RF-002 | El sistema debe permitir **editar** el título y contenido de una nota existente. | MUST | Lucía, Martín | 02 | Implementado |
| RF-003 | El sistema debe permitir **eliminar** una nota, con confirmación previa para evitar borrado accidental. | MUST | Lucía | 02 | Implementado |
| RF-004 | El sistema debe mostrar un **listado de todas las notas** ordenadas por fecha de última modificación (más reciente primero). | MUST | Lucía | 02 | Implementado |
| RF-005 | El sistema debe conservar un **borrador persistente local del editor** mientras el usuario crea o edita una nota, restaurarlo al volver a la app y eliminarlo al guardar, actualizar o descartar, sin crear ni modificar notas finales sin confirmación explícita. | MUST | Lucía | 05 | Verificado |
| RF-006 | El sistema debe mostrar el **conteo de palabras y caracteres** de la nota activa. | COULD | Martín | Futuro | Postergado |

---

## Módulo 2 — Persistencia y Almacenamiento

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-007 | El sistema debe almacenar todas las notas de forma **local en el dispositivo**, sin enviar datos a ningún servidor. Actualmente implementado con IndexedDB; la migración a SQLite está aprobada en [ADR-005](../adr/ADR-005-pivote-app-nativa.md). | MUST | Lucía, Martín | 02 | Implementado |
| RF-008 | El sistema debe funcionar **completamente offline** después de la instalación. Los assets (HTML, CSS, JS, fuentes) se empaquetan dentro del APK nativo. | MUST | Lucía | 03 | Implementado |
| RF-009 | ~~El sistema debe registrar **Service Workers** para cachear los assets.~~ Obsoleto: la arquitectura migró a APK nativa con Capacitor ([ADR-005](../adr/ADR-005-pivote-app-nativa.md)). Los assets son locales por diseño; `vite-plugin-pwa` fue removido en `ee90559`. | MUST | Lucía | 03 | Obsoleto (ADR-005) |

---

## Módulo 3 — Markdown

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-010 | El sistema debe renderizar **Markdown en tiempo real** (preview) mientras el usuario escribe. | MUST | Martín | 03 | Implementado |
| RF-011 | El sistema debe soportar al menos la sintaxis Markdown básica: encabezados, negritas, cursivas, listas, código inline, bloques de código, y enlaces. | MUST | Martín | 03 | Implementado |
| RF-012 | El sistema debe ofrecer un **modo de solo lectura** (preview) y un **modo de edición** para cada nota. | SHOULD | Martín | 03 | Implementado |
| RF-028 | El sistema debe ofrecer herramientas opcionales de **formato e inserción Markdown** desde comandos `/`, botón `+`, botón `Aa` y comportamiento de continuidad inteligente, manteniendo texto plano como experiencia base. | SHOULD | Lucía, Martín | 05 | Implementado |

---

## Módulo 4 — Organización

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-013 | El sistema debe permitir **fijar (pin) y archivar** notas para organizar el feed. Las notas fijadas aparecen al tope; las archivadas se ocultan del feed principal y son accesibles desde el drawer. *(Pivote de etiquetas a pin/archivar — ver DP-002)* | SHOULD | Lucía | 04 | Implementado |
| RF-014 | El sistema debe permitir **filtrar notas por materia y sección** en el listado principal. *(Pivote de etiquetas a organización por materias — ver DP-002)* | SHOULD | Lucía | 04 | Implementado |
| RF-015 | El sistema debe ofrecer una **búsqueda por texto** que filtre notas activas en tiempo real por título y contenido, de forma global y tolerante a mayúsculas/minúsculas y tildes. | MUST | Lucía, Martín | 04 | Implementado |
| RF-026 | El sistema debe implementar una **papelera de reciclaje** con eliminación lógica (soft-delete). Al eliminar una nota o materia, esta se mueve a la papelera (campo `deletedAt`) en lugar de borrarse físicamente. El usuario puede restaurar elementos desde la papelera o vaciarla permanentemente. La eliminación de una materia aplica cascada a sus secciones hijas y notas asociadas. Un badge en el drawer muestra el conteo de items en papelera, con advertencia visual cuando supera los 50 elementos. | SHOULD | Lucía | 04 | Implementado |

---

## Módulo 4.1 — Fechas Académicas

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-027 | El sistema debe permitir marcar **fechas académicas puntuales** en el calendario existente, con tipo de evento (parcial, final, trabajo práctico o exposición), fecha obligatoria, descripción breve opcional y asociación opcional a una materia o sección. La funcionalidad debe actuar como recordatorio visual pasivo integrado al Heatmap, sin notificaciones, recurrencia, horarios ni sincronización externa. | SHOULD | Lucía | 05 | Implementado |

---

## Módulo 5 — Exportación e Importación

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-016 | El sistema debe permitir **compartir o exportar una nota individual** como Markdown desde una acción secundaria. | SHOULD | Martín | Futuro | Postergado |
| RF-017 | El sistema debe permitir **exportar un respaldo local** del workspace como archivo `.zip`, con manifiesto, datos estructurados y notas `.md` legibles, usando salida externa por share sheet o gestor de archivos. | SHOULD | Martín | 05 | Implementado |
| RF-018 | El sistema debe permitir **importar contenido local** desde archivos `.md` o respaldos `.zip`, con política explícita para duplicados y materias existentes. | COULD | Martín | Futuro | Postergado |

---

## Módulo 6 — Experiencia de Usuario (UX)

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-019 | El sistema debe ofrecer un **modo oscuro** y un modo claro, con toggle visible. | SHOULD | Martín | 04 | Implementado |
| RF-020 | El sistema debe ser **responsive**, adaptándose a pantallas desde 320px (móvil) hasta 1920px (desktop). | MUST | Lucía | 04 | Implementado |
| RF-021 | ~~El sistema debe ser **instalable como PWA** desde el navegador.~~ Obsoleto: la distribución será como APK nativa con Capacitor ([ADR-005](../adr/ADR-005-pivote-app-nativa.md)). | MUST | Lucía | 03 | Obsoleto (ADR-005) |
| RF-022 | El sistema debe mostrar una **pantalla de bienvenida** (onboarding) solo en el primer uso, explicando las funcionalidades principales. | COULD | Lucía | Futuro | Postergado |
| RF-025 | El sistema debe permitir al usuario asignar un **marcador de estado visual** (emoji curado) a cada nota, eligiendo entre un set de 4 opciones con significado académico (📖 ❓ 🔥 ✅). *(DP-005)* | SHOULD | Lucía | 04 | Implementado |

---

## Módulo 7 — Información del Sistema

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-023 | El sistema debe mostrar una sección **"Acerca de"** con información de la versión, autor, licencia, propósito y alcance offline/local, sin convertirse en onboarding ni guía de uso obligatoria. | SHOULD | Prof. Ramos | 05 | Implementado |
| RF-024 | El sistema debe mostrar un **indicador de estado offline/online** visible para el usuario. | COULD | Lucía | Futuro | Postergado |

---

## Decisión de revisión — RF-005 y borradores persistentes

La revisión del 2026-06-07 reemplaza la interpretación inicial de `RF-005` como auto-guardado final silencioso por un modelo de borrador persistente del editor.

La decisión protege la intención del usuario: Lumapse debe evitar pérdida de trabajo en curso si el estudiante sale de la app, consulta un PDF, copia texto, bloquea el teléfono o vuelve más tarde, pero no debe crear notas incompletas ni actualizar una nota final sin que el usuario toque `Guardar` o `Actualizar`.

El borrador conserva localmente título, contenido, materia/sección seleccionada y, cuando corresponde, la nota original que se está editando. Se restaura al volver al editor, muestra un indicador sutil de cambios pendientes y puede descartarse explícitamente. El borrador se limpia solo después de guardar/actualizar con éxito o de confirmar el descarte. Si la nota original editada desaparece antes de restaurar, el contenido pendiente se conserva como borrador de nota nueva para no perder texto.

Validación manual: el flujo fue probado saliendo de Lumapse para consultar un PDF, copiar texto y volver al editor, manteniendo el borrador disponible y editable como se esperaba.

## Decisión de revisión — Exportación/importación local

La revisión del 2026-06-01 detectó que `src/services/ExportService.js` e `src/services/ImportService.js` conservaban una base técnica parcial de exportación/importación, pero la funcionalidad no estaba conectada a la interfaz actual ni cubierta como flujo verificable de usuario. Por lo tanto, `RF-016`, `RF-017` y `RF-018` dejaron de contarse temporalmente como requisitos implementados del producto actual.

La decisión protege la filosofía de Lumapse: tomador de notas sin fricción, offline-first, mobile-first y sin sincronización todavía. Compartir una nota individual puede aportar portabilidad real solo si abre el share sheet nativo de Android y permite elegir apps instaladas como WhatsApp. Si termina copiando contenido, duplica la acción existente de Copiar y agrega ruido. Exportar respaldos completos o importar contenido exige reglas de merge, colisiones de nombres y reconstrucción de materias/secciones, por lo que queda como deuda posterior.

- `RF-016` queda postergado: debe retomarse con `@capacitor/share`, posible `@capacitor/filesystem`, `npx cap sync` y prueba real en Android antes de aparecer en la UI.
- `RF-017` se reabrió y completó el 2026-06-03 como backup manual `.zip` restaurable/legible, con salida externa por share sheet o gestor de archivos. La restauración completa y Drive API directa quedan fuera de este RF inicial.
- `RF-018` queda como deuda de más largo plazo: si se retoma para una nota individual, la nota importada debe entrar en `Entrada`; no debe recrear materias/secciones de origen automáticamente.

## Decisiones de cierre del Hito 04

El cierre formal del Hito 04 (2026-06-01) reclasifica `RF-006`, `RF-022` y `RF-024` como requisitos postergados. La decisión responde a la filosofía de Lumapse: tomador de notas sin fricción, offline-first y mobile-first. Las funcionalidades que agregan ruido visual o sugieren capacidades no disponibles todavía (por ejemplo sincronización) se conservan para evaluación post-release, cuando exista feedback real de estudiantes.

- `RF-006` puede volver si la comunidad estudiantil pide métricas de escritura; debe implementarse como metadato sutil calculado en UI, sin persistencia adicional.
- `RF-022` puede volver si la primera release evidencia que los empty states y affordances actuales no alcanzan para explicar la app.
- `RF-024` debe esperar a que exista sincronización, backup o integración externa; antes de eso no modifica el comportamiento del producto.

---

## Resumen de requisitos por prioridad

| Prioridad | Cantidad | Descripción |
|---|---|---|
| **MUST** | 13 | Funcionalidades obligatorias para el MVP |
| **SHOULD** | 11 | Funcionalidades deseables que completan la experiencia |
| **COULD** | 4 | Funcionalidades opcionales si hay tiempo disponible |
| **Total** | **28** | |

---

## Trazabilidad: Requisitos → Hitos

| Hito | Requisitos | Cantidad |
|---|---|---|
| **02** (Junio) | RF-001 a RF-004, RF-007 | 5 |
| **03** (Julio) | RF-008 a RF-012, RF-021 | 6 |
| **04** (Agosto) | RF-013 a RF-015, RF-019, RF-020, RF-025, RF-026 | 7 |
| **05** (Septiembre) | RF-005, RF-017, RF-023, RF-027, RF-028 | 5 |
| **06** (Octubre) | — | 0 |
| **Futuro / Post-release** | RF-006, RF-016, RF-018, RF-022, RF-024 | 5 |

---

> **Nota:** Este documento es un artefacto vivo. Los requisitos se actualizarán al cierre de cada hito, marcando los implementados y verificados. Nuevos requisitos que surjan durante el desarrollo se agregarán con IDs secuenciales.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
