# Diagrama de Secuencia — Crear/Editar Nota con Borrador Persistente

**Tipo:** Diagrama UML de Comportamiento (Secuencia)  
**Última actualización:** 2026-10-26 (revisión estática del corte `v0.6.0`)<br>
**Autor:** José David Sandoval

---

## Objetivo del diagrama

Modelar la interacción entre los componentes durante el flujo de **crear o editar
una nota protegida por borrador SQLite**. La nota final sólo se crea o actualiza
con `Guardar` o `Actualizar`. La captura protege el trabajo confirmado en SQLite;
no garantiza la última tecla si el proceso termina antes del commit.

> **Alcance:** Este diagrama se mantiene enfocado en `RF-005` (borradores persistentes). Los flujos de backup/importación ZIP, fechas académicas y Acerca de pertenecen a otros casos de uso del Hito 05 y no forman parte de esta secuencia.

> **Frontera de versión:** Secuencia contrastada con la fuente de la RC1 `v0.6.0`
> (APK de `bcefe6a`, tag sobre `ac2a747`) y [ADR-012](../adr/ADR-012-borrador-sqlite-y-guardado-atomico.md).
> No conserva el debounce ni la limpieza separada de `v0.5.0`. Es una revisión
> documental del código, no una nueva comprobación funcional del APK.

---

## Diagrama de Secuencia: Abrir editor de nota nueva

```mermaid
sequenceDiagram
    actor EST as Estudiante
    participant MAIN as Arranque
    participant DRAFT as EditorDraftService
    participant UI as Interfaz (UI)
    participant RESTORER as EditorDraftRestorer

    EST ->> MAIN: Abre Lumapse
    MAIN ->> DRAFT: initializeDraftStorage()
    Note over MAIN,DRAFT: SQLite preparado, hidrata cache y migra legacy sólo si falta la fila
    DRAFT -->> MAIN: Inicialización confirmada
    MAIN ->> UI: Monta componentes
    UI ->> RESTORER: Inicializa y solicita restore(state)
    RESTORER ->> DRAFT: loadDraft() desde cache hidratado
    DRAFT -->> RESTORER: borrador existente o null
    RESTORER -->> UI: payload de restauración o null
    UI ->> UI: Renderiza editor limpio o aplica el payload
    UI -->> EST: Editor limpio o borrador restaurado
```

---

## Diagrama de Secuencia: Conservar borrador mientras escribe

```mermaid
sequenceDiagram
    actor EST as Estudiante
    participant UI as Interfaz (UI)
    participant CAPTURE as EditorDraftCapture
    participant DRAFT as EditorDraftService
    participant DB as SQLite (metadata)

    EST ->> UI: Escribe título, contenido o cambia materia
    UI ->> EST: Indicador de cambios pendientes
    UI ->> CAPTURE: schedule(): captura snapshot sin debounce
    CAPTURE ->> DRAFT: saveDraft(payload)
    DRAFT ->> DB: Escribe JSON en la cola SQLite
    DB -->> DRAFT: Commit confirmado
    DRAFT -->> CAPTURE: Snapshot persistido
    Note over CAPTURE,DB: Un fallo conserva el snapshot para reintento y muestra aviso
```

---

## Diagrama de Secuencia: Guardar nota final

```mermaid
sequenceDiagram
    actor EST as Estudiante
    participant UI as Interfaz (UI)
    participant STORE as Estado (Store)
    participant DRAFT as EditorDraftService
    participant DB as SQLite

    EST ->> UI: Toca "Guardar" o "Actualizar"
    UI ->> UI: flush() y bloqueo temporal de controles
    UI ->> STORE: createNote / updateNote con clearDraft: true
    STORE ->> DRAFT: consumeDraft(escritura de nota)
    DRAFT ->> DB: Transacción: nota + marcador de borrador vacío
    DB -->> DRAFT: Commit de ambas escrituras
    DRAFT -->> STORE: Nota persistida, cache del borrador vacío
    STORE ->> STORE: Actualiza estado, en creación, refresca materias/conteos
    Note over STORE: Un fallo de refresco avisa, pero no vuelve a insertar ni rechaza el guardado
    STORE -->> UI: Entidad confirmada
    UI ->> UI: markSaved() sin otra escritura de limpieza
    UI -->> EST: Editor limpio y controles habilitados
```

---

## Diagrama de Secuencia: Volver a Lumapse con borrador pendiente

```mermaid
sequenceDiagram
    actor EST as Estudiante
    participant UI as Interfaz (UI)
    participant RESTORER as EditorDraftRestorer
    participant DRAFT as EditorDraftService
    participant STORE as Estado (Store)

    EST ->> UI: Vuelve desde otra app o abre una vista con editor
    UI ->> RESTORER: Inicializa y solicita restore(state)
    RESTORER ->>+ DRAFT: loadDraft()
    DRAFT -->>- RESTORER: draft

    alt Borrador de nota nueva
        RESTORER -->> UI: payload en modo create
        UI ->> UI: Restaura título, contenido y materia
        UI ->> EST: Botón "Guardar" disponible
    else Borrador de edición
        RESTORER ->> STORE: Lee state.notes y state.notesLoaded
        STORE -->> RESTORER: snapshot del estado observable
        RESTORER ->> RESTORER: state.notes.find(note.id === draft.noteId)
        alt Nota original existe
            RESTORER -->> UI: payload en modo edit
            UI ->> UI: Restaura cambios pendientes
            UI ->> EST: Botón "Actualizar" disponible
        else Las notas todavía no terminaron de cargar
            RESTORER -->> UI: null, espera el próximo estado
        else Nota original ya no existe
            RESTORER -->> UI: payload convertido a modo create
            UI ->> UI: Convierte el contenido pendiente en borrador de nota nueva
            UI ->> EST: Botón "Guardar" disponible
        end
    end
```

---

## Participantes del sistema

| Participante | Responsabilidad | Ubicación en el código |
|---|---|---|
| **Estudiante** | Actor principal. Inicia las acciones de crear, editar, cambiar de app y confirmar guardado. | — |
| **Interfaz (UI)** | Capa de presentación. Maneja eventos del DOM, renderiza el listado, el editor, indicadores y confirmaciones. | `src/components/` |
| **Estado (Store)** | Gestión del estado de la aplicación. Coordina las operaciones CRUD definitivas y expone en memoria `state.notes` y `state.notesLoaded` para la restauración. | `src/store/` |
| **EditorDraftRestorer** | Interpreta el borrador y, cuando corresponde a una edición, localiza la nota original directamente en `state.notes`, sin invocar una consulta del store. | `src/components/note-editor/NoteEditorDrafts.js` |
| **Arranque** | Prepara SQLite e hidrata el cache del borrador antes de montar; un fallo de lectura/migración ofrece recuperación, no un editor vacío silencioso. | `src/layout/appStartup.js` |
| **EditorDraftService** | Hidrata y mantiene el cache, persiste snapshots y consume nota/borrador en la misma transacción. Un JSON SQLite inválido falla cerrado; no se sobrescribe como si estuviera vacío. | `src/services/EditorDraftService.ts` |
| **EditorDraftCapture** | Captura cada cambio sin debounce, conserva el snapshot fallido para reintento y marca el éxito del guardado sin otra limpieza SQLite. | `src/components/note-editor/NoteEditorDrafts.js` |
| **SQLite** | Persistencia de notas y del único borrador en `metadata`, mediante la conexión y la cola compartidas. | `src/services/sqlite/notes.js`, `src/services/sqlite/editorDrafts.js` |

---

## Decisiones de diseño reflejadas

| Decisión | Justificación | ADR relacionado |
|---|---|---|
| Borrador SQLite sin debounce | Captura snapshots en `metadata`; migra legacy sólo si falta la fila y no vuelve a usarlo como fallback. | [ADR-012](../adr/ADR-012-borrador-sqlite-y-guardado-atomico.md) |
| Guardado final explícito | Respeta la intención del usuario: la nota definitiva solo se crea o actualiza con `Guardar` o `Actualizar`. | — |
| Consumo atómico | Nota y marcador JSON `null` se confirman juntos; un fallo revierte ambas escrituras. Descartar espera su propio commit antes de limpiar la UI. | [ADR-012](../adr/ADR-012-borrador-sqlite-y-guardado-atomico.md) |
| Refresco separado en creación | Una lectura secundaria fallida permite recuperar conteos sin volver a crear la nota. | [ADR-011](../adr/ADR-011-limite-guardado-y-refresco.md) |
| Conversión segura de edición a creación | Si la nota original desaparece, el contenido pendiente se conserva como nota nueva para evitar pérdida de texto. | — |

---

## Escenario alternativo: error al guardar la nota final

```mermaid
sequenceDiagram
    actor EST as Estudiante
    participant UI as Interfaz (UI)
    participant STORE as Estado (Store)
    participant DRAFT as EditorDraftService
    participant DB as SQLite

    EST ->> UI: Toca "Guardar" o "Actualizar"
    UI ->> STORE: Operación con clearDraft: true
    STORE ->> DRAFT: consumeDraft(escritura de nota)
    DRAFT ->> DB: Transacción de nota + limpieza
    DB -->> DRAFT: Error, rollback de ambas escrituras
    DRAFT -->> STORE: Rechazo, borrador conservado
    STORE -->> UI: Error de persistencia
    UI -->> EST: Conserva campos y habilita reintento, sin mostrar éxito
```

> **Nota:** El manejo de errores de persistencia se relaciona con [RNF-010](../producto/requisitos-no-funcionales.md). El borrador persistente actúa como red de seguridad hasta que la nota final se guarde correctamente.

---

*Documento de la fase Idear · Análisis y Relevamiento · Lumapse · PP3 · 2026*
