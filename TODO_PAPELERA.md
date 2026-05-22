# 🗑️ TODO: Implementación de Papelera de Reciclaje (Próxima Sesión)

**Contexto:** El usuario solicitó la capacidad de eliminar carpetas (materias y secciones) desde la interfaz del *Drawer*. Sin embargo, como medida de seguridad para evitar pérdida de datos accidental, las notas que pertenezcan a esa materia/sección eliminada no deben perderse permanentemente ni ir a la bandeja de "Entrada", sino que deben ir a una **Papelera de Reciclaje**. Además, la app debe advertir cuando la papelera contenga muchas notas para invitar al usuario a vaciarla y mantener el rendimiento (aunque SQLite soporte miles sin problema).

---

## 📋 1. Cambios en la Base de Datos (SQLite)
*Actualmente las notas tienen `subjectId`. Al borrar la materia, SQLite hace `ON DELETE SET NULL`. Tenemos que cambiar este flujo al esquema de Soft-Delete.*

- [ ] **Esquema de Notas:** Modificar el esquema de inicialización en `services/sqlite/schema.js` (o crear una migración) para agregar un campo `deletedAt` (TEXT, fecha ISO) o `isDeleted` (INTEGER 0/1) a la tabla `notes`.
- [ ] **Esquema de Materias:** Modificar la tabla `subjects` agregando un campo `deletedAt` o `isDeleted` para poder enviar carpetas enteras a la papelera (manteniendo la jerarquía original de las notas si se decide restaurar).
- [ ] **Actualizar Consultas:** Modificar `getAllNotes()` en `services/sqlite/notes.js` para que retorne únicamente `WHERE isDeleted = 0`.
- [ ] **Consultas de Papelera:** Crear nuevas funciones en SQLite:
  - `getDeletedNotes()`: Trae solo las notas en la papelera.
  - `permanentlyDeleteNote(id)`: Ejecuta el `DELETE` físico real.
  - `emptyTrash()`: Ejecuta el `DELETE FROM notes WHERE isDeleted = 1`.

## 🧠 2. Lógica de Negocio y Store (`NoteStore`)
*Manejar el estado global y las acciones de borrado/restauración.*

- [ ] **Acción: Eliminar Materia (Soft Delete):** Modificar `SubjectService.deleteSubject` para que no ejecute un `DELETE` físico, sino un `UPDATE isDeleted = 1` en la materia y, **muy importante**, que dispare un `UPDATE isDeleted = 1` en todas las notas (`notes`) que contengan ese `subjectId`.
- [ ] **Acción: Restaurar Notas:** Crear función `restoreNote(id)` que devuelva `isDeleted = 0`. (Si la materia padre ya no existe, la nota restaurada debe caer en la "Entrada").
- [ ] **Métrica de Límite de Papelera:** Crear un mecanismo en el Store que cuente cuántas notas hay en la papelera (`deletedNotesCount`).
  - Definir una constante `TRASH_WARNING_THRESHOLD` (ej. 50 notas).
  - Si `deletedNotesCount >= TRASH_WARNING_THRESHOLD`, activar un flag `showTrashWarning = true` en el estado global.

## 🎨 3. Interfaz de Usuario (Drawer y Lista de Notas)
*Los cambios visuales para interactuar con la papelera.*

- [ ] **UI del Drawer (Eliminar Materia):** Agregar el ícono del tacho de basura (`.drawer__subject-delete`) que aparece on-hover en las materias/secciones. Al hacer click, debe mostrar el `window.confirm`: *"¿Deseas enviar esta carpeta y todas sus notas a la Papelera de reciclaje?"*.
- [ ] **Link a Papelera:** En el Drawer, debajo del botón de "Ver archivadas", agregar un botón de **"Papelera (X)"** (donde X es el conteo).
- [ ] **Vista de Papelera:** Al entrar a la Papelera:
  - El listado de notas debe mostrar las notas borradas.
  - El editor principal se bloquea (modo solo lectura).
  - El botón superior del editor ("Borrar") cambia a "Restaurar" y se agrega un botón rojo de "Eliminar permanentemente".
- [ ] **Alerta de Vaciado:** Diseñar un toast/banner no intrusivo pero visible. Si `showTrashWarning === true`, mostrar mensaje: *"Tu papelera tiene más de 50 elementos. Te recomendamos vaciarla para mantener Lumapse ultra rápido."* con un botón de **Vaciar papelera ahora**.

## 🛠️ 4. Trazabilidad y Calidad (Rust & Git Hooks)
*Asegurar que estos cambios estén documentados formalmente.*

- [ ] **Requisitos Funcionales:** Actualizar el archivo `requisitos-funcionales.md` agregando el requisito `RF-XXX: Papelera de Reciclaje y Soft Delete`.
- [ ] **Historia de Usuario:** Escribir la historia de usuario correspondiente `HU-XXX: Como estudiante, quiero poder recuperar notas eliminadas accidentalmente para no perder contenido importante`.
- [ ] Correr el pre-push auditor `lumapse-audit-bin` para verificar que toda la documentación quede correctamente enlazada con el código.

---
*Fin del TODO. Este documento queda como punto de entrada exacto para el inicio de la siguiente sesión.*

## 🚀 Futura Mejora (Hallazgo de Pruebas de Estrés)

*Durante las pruebas de estrés para generar 1000 notas, se detectó que SQLite maneja el volumen sin problemas de datos, pero la interfaz (DOM) se resiente intentando renderizar 1000 componentes de notas simultáneamente.*

- [ ] **Optimización del Renderizado (Virtualización / Scroll Infinito):** Si bien 1000 notas es un caso de uso borde para estudiantes, para mantener la percepción de velocidad absoluta de Lumapse se deberá implementar paginación (ej. mostrar de a 20 o 50) o virtualización de la lista de notas en el `NoteList.js`.
