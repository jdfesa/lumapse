# Requisitos Funcionales — Lumapse

**Fase Design Thinking:** Idear / Prototipar  
**Última actualización:** Abril 2026  
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
| RF-001 | El sistema debe permitir **crear una nueva nota** con título y contenido en texto plano/Markdown. | MUST | Lucía, Martín | 02 | Pendiente |
| RF-002 | El sistema debe permitir **editar** el título y contenido de una nota existente. | MUST | Lucía, Martín | 02 | Pendiente |
| RF-003 | El sistema debe permitir **eliminar** una nota, con confirmación previa para evitar borrado accidental. | MUST | Lucía | 02 | Pendiente |
| RF-004 | El sistema debe mostrar un **listado de todas las notas** ordenadas por fecha de última modificación (más reciente primero). | MUST | Lucía | 02 | Pendiente |
| RF-005 | El sistema debe **auto-guardar** la nota activa cada 3 segundos de inactividad del usuario o al cambiar de nota. | MUST | Lucía | 02 | Pendiente |
| RF-006 | El sistema debe mostrar el **conteo de palabras y caracteres** de la nota activa. | COULD | Martín | 04 | Pendiente |

---

## Módulo 2 — Persistencia y Almacenamiento

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-007 | El sistema debe almacenar todas las notas en **IndexedDB** de forma local, sin enviar datos a ningún servidor. | MUST | Lucía, Martín | 02 | Pendiente |
| RF-008 | El sistema debe funcionar **completamente offline** después de la primera carga. | MUST | Lucía | 03 | Pendiente |
| RF-009 | El sistema debe registrar **Service Workers** para cachear los assets de la aplicación y permitir el funcionamiento offline. | MUST | Lucía | 03 | Pendiente |

---

## Módulo 3 — Markdown

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-010 | El sistema debe renderizar **Markdown en tiempo real** (preview) mientras el usuario escribe. | MUST | Martín | 03 | Pendiente |
| RF-011 | El sistema debe soportar al menos la sintaxis Markdown básica: encabezados, negritas, cursivas, listas, código inline, bloques de código, y enlaces. | MUST | Martín | 03 | Pendiente |
| RF-012 | El sistema debe ofrecer un **modo de solo lectura** (preview) y un **modo de edición** para cada nota. | SHOULD | Martín | 03 | Pendiente |

---

## Módulo 4 — Organización

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-013 | El sistema debe permitir **asignar etiquetas** (tags) a cada nota (máximo 5 etiquetas por nota). | SHOULD | Lucía | 04 | Pendiente |
| RF-014 | El sistema debe permitir **filtrar notas por etiqueta** en el listado principal. | SHOULD | Lucía | 04 | Pendiente |
| RF-015 | El sistema debe ofrecer una **búsqueda por texto** que filtre notas en tiempo real por título y contenido. | MUST | Lucía, Martín | 04 | Pendiente |

---

## Módulo 5 — Exportación e Importación

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-016 | El sistema debe permitir **exportar una nota individual** como archivo `.md` descargable. | MUST | Martín | 03 | Pendiente |
| RF-017 | El sistema debe permitir **exportar todas las notas** como un archivo `.zip` conteniendo archivos `.md`. | SHOULD | Martín | 03 | Pendiente |
| RF-018 | El sistema debe permitir **importar archivos `.md`** para crear notas a partir de ellos. | SHOULD | Martín | 03 | Pendiente |

---

## Módulo 6 — Experiencia de Usuario (UX)

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-019 | El sistema debe ofrecer un **modo oscuro** y un modo claro, con toggle visible. | SHOULD | Martín | 04 | Pendiente |
| RF-020 | El sistema debe ser **responsive**, adaptándose a pantallas desde 320px (móvil) hasta 1920px (desktop). | MUST | Lucía | 04 | Pendiente |
| RF-021 | El sistema debe ser **instalable como PWA** desde el navegador (prompt de instalación o manual). | MUST | Lucía | 03 | Pendiente |
| RF-022 | El sistema debe mostrar una **pantalla de bienvenida** (onboarding) solo en el primer uso, explicando las funcionalidades principales. | COULD | Lucía | 04 | Pendiente |

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
| **SHOULD** | 8 | Funcionalidades deseables que completan la experiencia |
| **COULD** | 3 | Funcionalidades opcionales si hay tiempo disponible |
| **Total** | **24** | |

---

## Trazabilidad: Requisitos → Hitos

| Hito | Requisitos | Cantidad |
|---|---|---|
| **02** (Junio) | RF-001 a RF-007 | 7 |
| **03** (Julio) | RF-008 a RF-012, RF-016 a RF-018, RF-021 | 8 |
| **04** (Agosto) | RF-006, RF-013 a RF-015, RF-019, RF-020, RF-022, RF-024 | 8 |
| **05** (Septiembre) | RF-023 | 1 |

---

> **Nota:** Este documento es un artefacto vivo. Los requisitos se actualizarán al cierre de cada hito, marcando los implementados y verificados. Nuevos requisitos que surjan durante el desarrollo se agregarán con IDs secuenciales.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
