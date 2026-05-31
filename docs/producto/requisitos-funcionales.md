# Requisitos Funcionales — Lumapse

**Fase Design Thinking:** Idear / Prototipar  
**Última actualización:** 2026-05-31 (planificación de Fechas Académicas)
**Autor:** José David Sandoval

---

## Convenciones

- **ID:** `RF-XXX` (Requisito Funcional)
- **Prioridad:** `MUST` (obligatorio) · `SHOULD` (deseable) · `COULD` (opcional si hay tiempo)
- **Persona:** Persona de usuario que motiva el requisito → ver [personas.md](./personas.md)
- **Hito:** Hito del roadmap donde se implementa → ver [README.md](../../README.md#roadmap)
- **Estado:** `Pendiente` · `En desarrollo` · `Implementado` · `Verificado`

---

## Módulo 1 — Gestión de Notas (Core)

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-001 | El sistema debe permitir **crear una nueva nota** con título y contenido en texto plano/Markdown. | MUST | Lucía, Martín | 02 | Implementado |
| RF-002 | El sistema debe permitir **editar** el título y contenido de una nota existente. | MUST | Lucía, Martín | 02 | Implementado |
| RF-003 | El sistema debe permitir **eliminar** una nota, con confirmación previa para evitar borrado accidental. | MUST | Lucía | 02 | Implementado |
| RF-004 | El sistema debe mostrar un **listado de todas las notas** ordenadas por fecha de última modificación (más reciente primero). | MUST | Lucía | 02 | Implementado |
| RF-005 | El sistema debe **auto-guardar** la nota activa cada 800ms de inactividad del usuario o al cambiar de nota. | MUST | Lucía | 02 | Implementado |
| RF-006 | El sistema debe mostrar el **conteo de palabras y caracteres** de la nota activa. | COULD | Martín | 04 | Pendiente |

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
| RF-027 | El sistema debe permitir marcar **fechas académicas puntuales** en el calendario existente, con tipo de evento (parcial, final, trabajo práctico o exposición), fecha obligatoria, descripción breve opcional y asociación opcional a una materia o sección. La funcionalidad debe actuar como recordatorio visual pasivo integrado al Heatmap, sin notificaciones, recurrencia, horarios ni sincronización externa. | SHOULD | Lucía | 06 | Implementado |

---

## Módulo 5 — Exportación e Importación

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-016 | El sistema debe permitir **exportar una nota individual** como archivo `.md` descargable. | MUST | Martín | 03 | Implementado |
| RF-017 | El sistema debe permitir **exportar todas las notas** como un archivo `.zip` conteniendo archivos `.md`. | SHOULD | Martín | 03 | Implementado |
| RF-018 | El sistema debe permitir **importar archivos `.md`** para crear notas a partir de ellos. | SHOULD | Martín | 03 | Implementado |

---

## Módulo 6 — Experiencia de Usuario (UX)

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-019 | El sistema debe ofrecer un **modo oscuro** y un modo claro, con toggle visible. | SHOULD | Martín | 04 | Implementado |
| RF-020 | El sistema debe ser **responsive**, adaptándose a pantallas desde 320px (móvil) hasta 1920px (desktop). | MUST | Lucía | 04 | Implementado |
| RF-021 | ~~El sistema debe ser **instalable como PWA** desde el navegador.~~ Obsoleto: la distribución será como APK nativa con Capacitor ([ADR-005](../adr/ADR-005-pivote-app-nativa.md)). | MUST | Lucía | 03 | Obsoleto (ADR-005) |
| RF-022 | El sistema debe mostrar una **pantalla de bienvenida** (onboarding) solo en el primer uso, explicando las funcionalidades principales. | COULD | Lucía | 04 | Pendiente |
| RF-025 | El sistema debe permitir al usuario asignar un **marcador de estado visual** (emoji curado) a cada nota, eligiendo entre un set de 4 opciones con significado académico (📖 ❓ 🔥 ✅). *(DP-005)* | SHOULD | Lucía | 04 | Implementado |

---

## Módulo 7 — Información del Sistema

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-023 | El sistema debe mostrar una sección **"Acerca de"** con información de la versión, autor y licencia. | SHOULD | Prof. Ramos | 05 | Pendiente |
| RF-024 | El sistema debe mostrar un **indicador de estado offline/online** visible para el usuario. | COULD | Lucía | 04 | Pendiente |

---

## Resumen de requisitos por prioridad

| Prioridad | Cantidad | Descripción |
|---|---|---|
| **MUST** | 13 | Funcionalidades obligatorias para el MVP |
| **SHOULD** | 11 | Funcionalidades deseables que completan la experiencia |
| **COULD** | 3 | Funcionalidades opcionales si hay tiempo disponible |
| **Total** | **27** | |

---

## Trazabilidad: Requisitos → Hitos

| Hito | Requisitos | Cantidad |
|---|---|---|
| **02** (Junio) | RF-001 a RF-007 | 7 |
| **03** (Julio) | RF-008 a RF-012, RF-016 a RF-018, RF-021 | 8 |
| **04** (Agosto) | RF-006, RF-013 a RF-015, RF-019, RF-020, RF-022, RF-024, RF-025, RF-026 | 10 |
| **05** (Septiembre) | RF-023 | 1 |
| **06** (Octubre) | RF-027 | 1 |

---

> **Nota:** Este documento es un artefacto vivo. Los requisitos se actualizarán al cierre de cada hito, marcando los implementados y verificados. Nuevos requisitos que surjan durante el desarrollo se agregarán con IDs secuenciales.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
