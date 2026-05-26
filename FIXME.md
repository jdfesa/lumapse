# Bug: Checkboxes interactivos — Ghost Clicks / Toques Fantasma

## Contexto del Proyecto

**Lumapse** es una app de notas Markdown (estilo Memos) construida con:
- **Frontend**: Vanilla JS (sin framework), Vite
- **Runtime**: Capacitor (Android WebView)
- **DB**: SQLite local (sql.js + @capacitor-community/sqlite)
- **Markdown**: `marked` (parser) + `DOMPurify` (sanitización)

## Problema

Los checkboxes de task lists (`- [ ] ` / `- [x] `) dentro de las tarjetas de notas renderizadas presentan **toques fantasma**: al tocar un checkbox para marcarlo/desmarcarlo, otros checkboxes de la misma nota se activan o desactivan involuntariamente. El comportamiento es errático e impredecible.

## Arquitectura Actual (4 archivos involucrados)

### Flujo de datos

```
Usuario escribe "- [ ] item" → Guardar → SQLite
                                            ↓
                          NoteStore.data.js (estado)
                                            ↓
                          NoteList.js (subscriber → re-render cards)
                                            ↓
                          MarkdownService.js (renderMarkdown → HTML con checkboxes)
                                            ↓
                          Usuario toca checkbox → FeedActionRouter.js (click handler)
                                            ↓
                          Toggle línea en content → NoteStore.updateNote()
                                            ↓
                          Re-render completo de TODAS las cards (subscriber)
```

---

### 1. Renderizado de checkboxes — [MarkdownService.js](file:///Users/jd/Development/lumapse/src/services/MarkdownService.js)

`marked` con `gfm: true` convierte `- [ ] texto` en `<input type="checkbox" disabled> texto`.

Después de DOMPurify, un post-proceso remueve `disabled` y asigna un `data-line` secuencial:

```js
// Línea ~142
let checkboxIndex = 0
const processedHtml = cleanHtml.replace(
  /<input\s+type="checkbox"([^>]*)>/gi,
  (match, attrs) => {
    const idx = checkboxIndex++
    const isChecked = attrs.includes('checked')
    return `<input type="checkbox" data-line="${idx}"${isChecked ? ' checked' : ''}>`
  }
)
```

> [!WARNING]
> `data-line` es un índice secuencial (0, 1, 2...) basado en el **orden de aparición de `<input>` en el HTML**. No es el número de línea real del contenido Markdown.

### 2. Click handler — [FeedActionRouter.js](file:///Users/jd/Development/lumapse/src/components/FeedActionRouter.js#L121-L153)

El handler usa **delegación de eventos** (un solo listener en `#feed-items`):

```js
// Línea ~121
if (event.target.type === 'checkbox' && event.target.hasAttribute('data-line')) {
  event.stopPropagation()
  const checkboxIdx = parseInt(event.target.dataset.line, 10)
  // ... busca la nota por ID, obtiene el content ...
  
  // Itera las líneas del markdown buscando la N-ésima ocurrencia de "- [ ] " o "- [x] "
  const lines = note.content.split('\n')
  let currentIdx = 0
  for (let i = 0; i < lines.length; i++) {
    if (/^- \[[ x]\] /.test(lines[i])) {
      if (currentIdx === checkboxIdx) {
        // Toggle
        if (lines[i].startsWith('- [ ] ')) {
          lines[i] = lines[i].replace('- [ ] ', '- [x] ')
        } else {
          lines[i] = lines[i].replace('- [x] ', '- [ ] ')
        }
        break
      }
      currentIdx++
    }
  }
  
  const newContent = lines.join('\n')
  NoteStore.updateNote(noteId, { content: newContent })  // ← ASYNC, triggers re-render
  return
}
```

### 3. Re-render de cards — [NoteList.js](file:///Users/jd/Development/lumapse/src/components/NoteList.js#L44-L52)

```js
// Línea ~44 — subscriber del store
this.unsubscribe = NoteStore.subscribe((state) => {
  // ...
  const notesToRender = NoteStore.getFilteredNotes();
  this.renderNotes(notesToRender, state.searchQuery, state.subjects);
});
```

`renderNotes` hace `innerHTML = notes.map(note => this.renderCard(note)).join('')` lo que **destruye y recrea TODO el DOM** de las cards en cada update.

### 4. Store — [NoteStore.data.js](file:///Users/jd/Development/lumapse/src/store/NoteStore.data.js#L78-L95)

`updateNote()` es async, escribe a SQLite, actualiza el state, y llama `notify()` que dispara todos los subscribers.

---

## Análisis de Causa Raíz

### Bug 1: Falta `event.preventDefault()` — DOBLE TOGGLE

```
1. Usuario toca checkbox[data-line="2"] (está unchecked)
2. BROWSER DEFAULT: checkbox se marca visualmente (checked=true)
3. NUESTRO HANDLER: lee content → toglea línea 2 → "- [x] item3"
4. NoteStore.updateNote() → notify() → subscriber → re-render
5. Re-render: genera HTML nuevo con checkbox[data-line="2"] checked ✓
```

Esto parece OK... pero en mobile (WebView Android), los eventos touch pueden causar:

```
touchstart → touchend → click (con delay ~300ms en algunos WebViews)
```

Sin `preventDefault()`, el browser puede procesar el tap dos veces, o el estado visual del checkbox diverge del estado real antes del re-render.

### Bug 2: Re-render completo destruye el DOM mid-interaction

```
1. Usuario toca checkbox 2 rápido
2. Handler dispara updateNote() (ASYNC)
3. ANTES de que complete, NoteStore.notify() re-renderiza
4. innerHTML = "..." destruye TODOS los checkboxes
5. Nuevos checkboxes se crean con nuevos data-line
6. Si el usuario ya estaba tocando otro checkbox, el evento 
   se pierde o se aplica al checkbox equivocado
```

### Bug 3: `data-line` index puede des-sincronizarse

El `data-line` se calcula en `MarkdownService` contando `<input>` tags en el HTML. El handler cuenta `- [ ]`/`- [x]` patterns en el markdown source. Si `marked` genera HTML con checkboxes en orden diferente al source (ej: por nesting), los índices no coinciden.

---

## Solución Propuesta

### Opción A: Actualización quirúrgica del DOM (sin re-render completo)

En vez de dejar que el subscriber re-renderice toda la card:

1. Agregar `event.preventDefault()` al handler del checkbox
2. En el handler, después de actualizar el store, **actualizar solo el checkbox del DOM** sin re-renderizar toda la card
3. Usar un flag en el store (`skipNextRender`) o en NoteList para evitar el re-render cuando el cambio viene de un checkbox toggle

### Opción B: Debounce + prevent default (más simple)

1. Agregar `event.preventDefault()` para evitar el toggle nativo del browser
2. Manejar el estado visual manualmente (`checkbox.checked = !checkbox.checked`) después de confirmar el toggle
3. Agregar debounce/lock para evitar toggles rápidos mientras el async completa
4. En el subscriber de NoteList, NO re-renderizar la card que acaba de tener un checkbox toggle

### Opción C: Change event en vez de click delegado

En vez de delegación de eventos con `click` en el container:
1. Después de cada render, attachear `change` listeners directamente a cada `<input type="checkbox">`
2. Usar `change` en vez de `click` (más confiable para checkboxes en mobile)
3. En el handler del `change`, leer el `checked` state directamente del DOM
4. Prevenir el re-render completo de la card

---

## Archivos a Modificar

| Archivo | Qué cambiar |
|---------|-------------|
| [FeedActionRouter.js](file:///Users/jd/Development/lumapse/src/components/FeedActionRouter.js) | Agregar `preventDefault()`, manejar toggle visual manual, implementar lock anti-double-tap |
| [NoteList.js](file:///Users/jd/Development/lumapse/src/components/NoteList.js) | Evitar re-render completo cuando el cambio es un checkbox toggle (optimización quirúrgica) |
| [MarkdownService.js](file:///Users/jd/Development/lumapse/src/services/MarkdownService.js) | (Opcional) Cambiar `data-line` por un identificador más robusto basado en el número de línea real del markdown |

## Restricciones

- La app es **mobile-first** (Android WebView vía Capacitor)
- No hay framework (Vanilla JS), no hay Virtual DOM
- El editor es un `<textarea>`, no `contenteditable`
- El store usa un patrón pub/sub simple con `subscribe(callback)`
- Los tests existentes (351) deben seguir pasando
- Todo el código fuente está en español (comentarios, variables descriptivas)
