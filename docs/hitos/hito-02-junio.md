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
| Componente `NoteList` (Listado UI) | ✅ Completado |
| Componente `NoteEditor` (Editor UI) | ✅ Completado |
| Integración de Layout principal | ✅ Completado |
| Auto-guardado automático | ✅ Completado |

---

## Avance Actual (Paso a Paso)

### 4. Componente UI: `NoteEditor` y Auto-guardado
- Se implementó `src/components/NoteEditor.js` para renderizar y gestionar la vista de edición de la nota activa.
- Se resolvió el problema común de pérdida de foco al usar un estado reactivo evitando el re-renderizado total si la nota activa no cambia de ID.
- Se implementó el **Auto-guardado automático (HU-005)** escuchando los eventos de los campos de texto y aplicando un `debounce` (800ms) que actualiza el `NoteStore` (y por ende la base de datos local).
- Se configuró la acción de **Eliminar nota (HU-003)** con validación de seguridad nativa (`window.confirm`) directamente en el panel del editor.
- Se pulió la UI en `NoteEditor.css` quitando los bordes nativos de los inputs y mejorando las tipografías para simular una experiencia limpia de edición.

### 3. Componente UI: `NoteList`
- Se creó `src/components/NoteList.js` para renderizar dinámicamente la barra lateral de notas.
- Se implementó `src/components/NoteList.css` modular utilizando las *Custom Properties* del sistema de diseño base.
- El componente se suscribió a `NoteStore` para reaccionar a cambios: se actualiza automáticamente al crear, editar o eliminar notas.
- Permite seleccionar visualmente la nota activa y delegar el evento al Store.
- Se configuró el maquetado *Flexbox* base en `main.js` para soportar el Sidebar.

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
