# Informe de Hito 02 — Core del Editor

**Período:** Junio 2026  
**Hito:** 02 — Core del Editor  
**Proyecto:** Lumapse PWA  
**Estado:** En curso

---

## Resumen Ejecutivo

En este hito nos enfocamos en el corazón de la aplicación: el editor de notas y la persistencia de datos. El objetivo principal es lograr un CRUD completo (Crear, Leer, Actualizar, Eliminar) de notas almacenadas localmente usando IndexedDB, sin depender de servidores externos.

---

## Objetivos del Hito — Estado

| Tarea | Estado |
|---|---|
| Instalación de dependencia `idb` | ✅ Completado |
| `NoteService` (Capa de persistencia IndexedDB) | ✅ Completado |
| Pruebas de CRUD manuales en consola | ✅ Completado |
| `NoteStore` (Estado reactivo en memoria) | ✅ Completado |
| Componente `NoteList` (Listado UI) | ⏳ Pendiente |
| Componente `NoteEditor` (Editor UI) | ⏳ Pendiente |
| Integración de Layout principal | ⏳ Pendiente |
| Auto-guardado automático | ⏳ Pendiente |

---

## Avance Actual (Paso a Paso)

### 2. Estado Reactivo (`NoteStore`)
- Se implementó el patrón *Observer* en `src/store/NoteStore.js`.
- Se gestionó el estado interno con `notes` y `activeNoteId`.
- Se integraron las operaciones CRUD del `NoteService` para que los cambios modifiquen el estado en memoria de forma sincrónica.
- Se verificó el funcionamiento reactivo desde el navegador.

### 1. Capa de Persistencia (`NoteService`)
- Se instaló la librería `idb` para envolver la API nativa de IndexedDB con Promesas.
- Se creó el módulo `src/services/NoteService.js`.
- Se definió el esquema de base de datos (`lumapse-db`, `notes`) con un índice por fecha de modificación (`updatedAt`).
- Se implementaron las operaciones CRUD: `createNote`, `getNoteById`, `getAllNotes`, `updateNote`, `deleteNote`, `countNotes`.
- El esquema de una nota se definió como:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "createdAt": "iso-date-string",
    "updatedAt": "iso-date-string"
  }
  ```
- Se probaron exitosamente las operaciones directamente desde la consola del navegador.

---

## Próximos Pasos

El siguiente paso es avanzar con el **NoteStore**, que actuará como intermediario entre la UI y el `NoteService`. Su responsabilidad será mantener en memoria el estado actual de la aplicación (lista de notas cargadas, nota activa seleccionada) y reaccionar a los cambios.

---

*Documento vivo — Actualizado durante el desarrollo del Hito 02*
