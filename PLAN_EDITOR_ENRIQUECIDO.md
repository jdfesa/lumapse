# Plan de Implementacion: Editor Enriquecido y Slash Commands

> Estado: plan operativo por fases.
> Alcance: enriquecer la escritura de notas sin romper la filosofia simple, offline-first y mobile-first de Lumapse.
> Inspiracion: comandos y barra de insercion de Notion mobile, adaptados a una app de notas academicas liviana.

---

## 1. Objetivo

Convertir el editor actual de Lumapse en una experiencia mas amable para escribir notas con formato, manteniendo Markdown como formato interno simple y portable.

Hoy la app ya tiene una base valiosa:

- `src/components/NoteEditor.js`: composer con textarea, boton `+`, modo enfoque y autocompletado basico de tareas.
- `src/components/SlashCommandHandler.js`: deteccion de `/` al inicio de linea e insercion de snippets.
- `src/components/EditorPopup.js`: popup reutilizable para comandos.
- `src/services/MarkdownService.js`: render Markdown seguro con `marked` + `DOMPurify`.
- `src/components/NoteList.js`: render de notas como tarjetas Markdown.
- `src/components/FeedActionRouter.js`: checkboxes de tareas interactivos desde el feed.

La mejora debe aprovechar esa base: no construir un editor rich text desde cero, no introducir IA, no agregar sincronizacion ni embeds externos, y no obligar al usuario a aprender Markdown para escribir una nota.

---

## 2. Principios de producto

1. **Texto plano primero.**
   El usuario debe poder abrir Lumapse, escribir una idea y guardar. El formato es opcional.

2. **Markdown como formato interno.**
   Todo lo insertado por comandos debe terminar como Markdown legible dentro de `notes.content`.

3. **Sin dependencia de internet.**
   Ningun comando debe cargar recursos externos, scripts, iframes, embeds remotos o contenido que viole la politica offline-first.

4. **Mobile-first real.**
   Los controles deben funcionar bien en pantallas chicas, con tap, teclado virtual y scroll limitado.

5. **Inspirado, no copiado.**
   Notion sirve como referencia de UX, pero Lumapse debe seguir siendo mas simple, academico y local.

6. **Progresivo por fases.**
   Cada fase debe cerrar con valor usable, tests y bajo riesgo. No mezclar comandos simples con features pesadas.

---

## 3. Fuera de alcance

Estas ideas no se implementan en las primeras fases:

- IA, resumen automatico, autocompletado inteligente o generacion de contenido.
- Bases de datos tipo Notion, vistas calendario/galeria/tablero dentro de notas.
- Embeds externos como Google Drive, Tweets, Figma, GitHub, Dropbox, etc.
- Graficos, diagramas Mermaid, ecuaciones avanzadas o bloques sincronizados.
- Adjuntos reales de imagen/archivo en la primera etapa.
- Editor WYSIWYG complejo con modelo de bloques persistido.
- Migraciones SQLite para las fases 1 a 4.

---

## 4. Requisito sugerido

Agregar en documentacion de producto cuando se empiece a implementar:

| ID | Requisito | Prioridad | Persona | Hito | Estado |
|---|---|---|---|---|---|
| RF-028 | El sistema debe ofrecer herramientas opcionales de formato e insercion para enriquecer notas Markdown desde comandos `/`, boton `+` y acciones de formato inline, sin requerir aprendizaje previo de Markdown. | SHOULD | Lucia, Martin | Futuro / Hito editor | Pendiente |

Historias sugeridas:

- **HU-028 - Insertar bloques con `/`:** Como estudiante, quiero escribir `/` y elegir un bloque de formato, para estructurar mis apuntes rapidamente sin memorizar sintaxis Markdown.
- **HU-029 - Formatear texto seleccionado:** Como estudiante, quiero seleccionar texto y aplicar negrita, cursiva, codigo o link, para mejorar mis notas sin escribir simbolos manualmente.
- **HU-030 - Continuar listas automaticamente:** Como estudiante, quiero que las listas continuen al presionar Enter, para tomar apuntes fluidamente durante clase.

---

## 5. Estado actual del editor

### 5.1 Slash commands actuales

Archivo principal: `src/components/SlashCommandHandler.js`.

Comandos disponibles hoy:

- `/titulo` -> `# `
- `/todo` -> `- [ ] `
- `/code` -> bloque triple backtick
- `/table` -> tabla Markdown simple
- `/link` -> `[texto](url)`

Limitaciones:

- Los comandos estan definidos dentro del handler, no en un registro compartido.
- No hay grupos ni categorias.
- No hay aliases en espanol e ingles.
- Si no hay resultados, el popup se cierra.
- El boton `+` no reutiliza el mismo catalogo.
- No hay acciones de formato inline sobre seleccion.
- La navegacion del popup existe, pero puede mejorar para mobile y accesibilidad.

### 5.2 Markdown actual soportado

Archivo principal: `src/services/MarkdownService.js`.

Ya soporta:

- Encabezados.
- Negrita.
- Cursiva.
- Listas ordenadas y desordenadas.
- Codigo inline.
- Bloques de codigo.
- Enlaces.
- Tachado.
- Tablas GFM.
- Checkboxes de tareas.
- Imagenes locales sanitizadas.

Esta base permite que muchas mejoras sean solo snippets + UX, sin modificar almacenamiento.

---

## 6. Arquitectura propuesta

### 6.1 Registro unico de comandos

Crear un modulo nuevo:

`src/components/editorCommandRegistry.js`

Responsabilidad:

- Declarar todos los comandos disponibles.
- Exponer filtros por origen: slash menu, boton `+`, menu `Aa`.
- Evitar duplicar snippets entre `SlashCommandHandler` y `NoteEditor`.
- Mantener labels y aliases en un solo lugar.

Shape propuesto:

```js
export const EDITOR_COMMAND_GROUPS = [
  { id: 'basic', label: 'Bloques basicos' },
  { id: 'structure', label: 'Estructura' },
  { id: 'inline', label: 'Formato inline' },
  { id: 'utility', label: 'Utiles' },
]

export const EDITOR_COMMANDS = [
  {
    id: 'heading-1',
    group: 'basic',
    label: 'Encabezado 1',
    aliases: ['h1', 'titulo', 'title'],
    description: 'Titulo principal',
    snippet: '# ',
    cursorOffset: 2,
    surfaces: ['slash', 'insert'],
    insertMode: 'replace-trigger',
  },
]
```

Campos:

- `id`: estable y unico.
- `group`: categoria visual.
- `label`: texto visible.
- `aliases`: busqueda tolerante.
- `description`: ayuda breve.
- `snippet`: texto Markdown a insertar.
- `cursorOffset`: posicion del cursor tras insertar.
- `selectLength`: cantidad de caracteres a seleccionar, opcional.
- `surfaces`: donde aparece: `slash`, `insert`, `inline`.
- `insertMode`: `replace-trigger`, `insert-at-cursor`, `wrap-selection`.

### 6.2 EditorPopup mejorado

Extender `src/components/EditorPopup.js` para soportar:

- Grupos visuales.
- Items con icono opcional.
- Busqueda por `label`, `description` y `aliases`.
- Estado "Sin resultados" sin cerrar automaticamente.
- Footer opcional.
- Navegacion con flechas, Enter y Escape.
- Click/tap fuera para cerrar.

Regla importante:

- El popup no debe saber de Markdown. Solo renderiza opciones y devuelve el item seleccionado.

### 6.3 Insercion centralizada

Agregar helpers en `NoteEditor` o en un modulo dedicado:

`src/components/editorTextTransforms.js`

Funciones sugeridas:

- `insertSnippet(textarea, command, triggerRange)`
- `wrapSelection(textarea, before, after, placeholder)`
- `getCurrentLine(value, selectionStart)`
- `replaceCurrentLinePrefix(textarea, prefix)`
- `continueMarkdownList(textarea)`

Objetivo:

- Reducir logica duplicada.
- Testear transformaciones sin DOM complejo cuando sea posible.
- Mantener `SlashCommandHandler` simple.

---

## 7. Catalogo de comandos por fases

### Fase 1: Slash menu enriquecido

Estos comandos deben aparecer al escribir `/` al inicio de linea:

| Grupo | Label | Aliases | Snippet | Cursor |
|---|---|---|---|---|
| Bloques basicos | Texto | `texto`, `p`, `normal` | `` | Inicio de linea |
| Bloques basicos | Encabezado 1 | `h1`, `titulo`, `title` | `# ` | Final |
| Bloques basicos | Encabezado 2 | `h2`, `subtitulo` | `## ` | Final |
| Bloques basicos | Encabezado 3 | `h3` | `### ` | Final |
| Bloques basicos | Encabezado 4 | `h4` | `#### ` | Final |
| Bloques basicos | Lista con vinetas | `lista`, `bullet`, `ul` | `- ` | Final |
| Bloques basicos | Lista numerada | `numero`, `number`, `ol` | `1. ` | Final |
| Bloques basicos | Lista de tareas | `todo`, `tarea`, `check` | `- [ ] ` | Final |
| Bloques basicos | Cita | `quote`, `cita` | `> ` | Final |
| Bloques basicos | Separador | `hr`, `linea`, `divider` | `---` | Final |
| Estructura | Codigo | `code`, `codigo` | ``````\n\n`````` | Linea interna |
| Estructura | Tabla simple | `table`, `tabla` | tabla 2x2 Markdown | Primer header seleccionado |
| Estructura | Link | `link`, `enlace` | `[texto](url)` | `texto` seleccionado |
| Utiles | Fecha de hoy | `fecha`, `date`, `hoy` | fecha local `YYYY-MM-DD` | Final |
| Utiles | Destacado | `callout`, `destacado` | `> [!nota]\n> ` | Final |

Notas:

- El comando `Texto` sirve para convertir `/texto` en linea normal eliminando el trigger.
- `Destacado` debe ser Markdown legible aunque no exista soporte visual especial todavia.
- La fecha se calcula al momento de insertar.

### Fase 2: Boton `+` como menu de insercion

El boton `+` debe abrir un menu llamado "Insertar bloque".

Items iniciales:

- Texto.
- Encabezado 1.
- Encabezado 2.
- Lista con vinetas.
- Lista numerada.
- Lista de tareas.
- Cita.
- Separador.
- Codigo.
- Tabla simple.
- Link.
- Fecha de hoy.
- Modo Enfoque.

Reglas:

- Usar el mismo registry que el slash menu.
- `Modo Enfoque` puede seguir siendo una accion especial sin snippet.
- Si el textarea no tiene foco, enfocar antes de insertar.
- Si hay seleccion, reemplazarla con el bloque elegido salvo comandos inline.

### Fase 3: Boton `Aa` para formato inline

Agregar un boton `Aa` junto al `+`.

Menu:

| Label | Accion |
|---|---|
| Negrita | envolver seleccion con `**` |
| Cursiva | envolver seleccion con `*` |
| Tachado | envolver seleccion con `~~` |
| Codigo inline | envolver seleccion con `` ` `` |
| Link | envolver seleccion como `[texto](url)` |

Reglas:

- Si hay texto seleccionado, envolverlo.
- Si no hay seleccion, insertar placeholder y seleccionarlo.
- Para link sin seleccion, insertar `[texto](url)` y seleccionar `texto`.
- Para link con seleccion, insertar `[seleccion](url)` y seleccionar `url`.
- No abrir modales en esta fase.

### Fase 4: Escritura asistida

Extender `handleKeyDown` en `NoteEditor`.

Comportamientos:

- Enter despues de `- item` inserta nueva linea con `- `.
- Enter despues de `- ` vacio elimina el prefijo y sale de lista.
- Enter despues de `1. item` inserta `2. `.
- Enter despues de `1. ` vacio elimina el prefijo y sale de lista.
- Enter despues de `- [ ] tarea` inserta `- [ ] `.
- Enter despues de `- [ ] ` vacio elimina el prefijo y sale de lista.
- Mantener el comportamiento actual de tareas, pero generalizarlo.

No hacer todavia:

- Indentacion con Tab.
- Outdent con Shift+Tab.
- Transformaciones automaticas visuales mientras escribe.

### Fase 5: Pulido visual de Markdown

Revisar estilos en:

- `src/components/MarkdownPreview.css`
- `src/components/NoteCard.css`

Objetivo:

- Tablas legibles en mobile con overflow horizontal si hace falta.
- Blockquotes y destacados discretos.
- Separadores con margen correcto.
- Codigo con scroll horizontal.
- Checkboxes alineados y faciles de tocar.

No cambiar la sanitizacion sin tests.

### Fase 6: Ayuda liviana opcional

Solo si el feedback muestra friccion:

- Agregar una mini guia Markdown dentro de una futura seccion `Acerca de/Ayuda`.
- No mostrar tutorial obligatorio.
- No precargar notas de ejemplo que hagan sentir que Markdown es requisito.
- Texto sugerido: "Podes escribir normal. Estos atajos solo te ayudan si queres darle forma a tus apuntes."

---

## 8. UX detallada

### 8.1 Activacion del slash menu

El slash menu se activa solo cuando:

- El usuario escribe `/`.
- El slash esta al inicio del textarea o justo despues de `\n`.

El slash menu se desactiva cuando:

- El usuario presiona Escape.
- Hace tap fuera del popup.
- Escribe un espacio.
- Elimina el `/`.
- Selecciona un comando.

No debe activarse:

- En medio de una palabra.
- Dentro de URLs.
- Dentro de texto normal como `hola / algo`.

### 8.2 Busqueda

La busqueda debe matchear:

- `label`.
- `description`.
- `aliases`.

Ejemplos:

- `/h1` encuentra `Encabezado 1`.
- `/titulo` encuentra `Encabezado 1`.
- `/todo` encuentra `Lista de tareas`.
- `/tabla` encuentra `Tabla simple`.
- `/code` encuentra `Codigo`.

### 8.3 Popup mobile

Requisitos visuales:

- Max-height limitado.
- Scroll interno.
- Items con alto tactil suficiente.
- Texto truncado con ellipsis si no entra.
- No tapar permanentemente el boton Guardar.
- Mantener contraste en tema claro y oscuro.

### 8.4 Botones del composer

Orden recomendado:

1. Selector de materia.
2. `+` insertar bloque.
3. `Aa` formato.
4. Guardar.

No agregar una barra enorme permanente. Lumapse debe seguir respirando simple.

---

## 9. Testing por fase

### Fase 1

Tests unitarios:

- El registry contiene ids unicos.
- Cada comando slash tiene `label`, `group`, `surfaces` y comportamiento de insercion.
- `/h1` filtra `Encabezado 1`.
- `/todo` filtra `Lista de tareas`.
- Seleccionar `Tabla simple` inserta tabla y selecciona primer header.
- Seleccionar `Link` inserta `[texto](url)` y selecciona `texto`.
- Sin resultados muestra empty state sin cerrar popup.

Tests manuales:

- Probar `/` en textarea vacio.
- Probar `/` en segunda linea.
- Probar `/` en medio de texto y confirmar que no abre.
- Probar Escape.
- Probar tema claro/oscuro.

### Fase 2

Tests unitarios:

- Boton `+` abre menu.
- Elegir `Encabezado 1` inserta `# `.
- Elegir `Modo Enfoque` activa focus sin insertar texto.
- El popup se cierra despues de elegir item.

Tests manuales:

- Tap en `+` con teclado virtual abierto.
- Tap fuera cierra menu.
- Guardar nota despues de insertar bloques.

### Fase 3

Tests unitarios:

- Seleccion `parcial` + Negrita -> `**parcial**`.
- Sin seleccion + Negrita -> `**texto**` con `texto` seleccionado.
- Seleccion `web` + Link -> `[web](url)` con `url` seleccionado.
- Codigo inline respeta backticks.

Tests manuales:

- Seleccionar texto en mobile y aplicar formato.
- Aplicar varios formatos en una misma nota.
- Renderizar en feed y preview.

### Fase 4

Tests unitarios:

- Enter en `- item` crea `- `.
- Enter en `- ` elimina prefijo.
- Enter en `1. item` crea `2. `.
- Enter en `9. item` crea `10. `.
- Enter en `- [ ] item` crea `- [ ] `.
- Enter en `- [x] item` crea `- [ ] `.
- Enter en linea no-lista mantiene comportamiento normal.

Tests manuales:

- Tomar una nota larga con listas mezcladas.
- Editar una nota existente con listas.
- Confirmar que los checkboxes del feed siguen funcionando.

### Fase 5

Tests unitarios:

- `MarkdownService` conserva sanitizacion de XSS.
- Tablas GFM siguen renderizando.
- Checkboxes conservan `data-line`.
- Imagen externa sigue bloqueada.

Tests manuales:

- Tabla ancha en mobile.
- Codigo largo con scroll horizontal.
- Blockquote/destacado en tarjeta.
- Separador entre secciones.

---

## 10. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| La UI se vuelve demasiado parecida a Notion y pierde simpleza | Alto | Mantener pocos botones visibles y agrupar comandos en menus |
| El usuario cree que debe saber Markdown | Medio | Texto plano sigue siendo default; no agregar tutorial obligatorio |
| El popup molesta en mobile | Medio | Altura limitada, tap fuera, Escape, scroll interno |
| Snippets duplicados entre `/` y `+` | Medio | Registry unico |
| Romper checkboxes interactivos | Alto | Tests de `MarkdownService`, `NoteList` y `FeedActionRouter` |
| Sanitizacion insegura al agregar bloques | Alto | No ampliar tags permitidos sin tests especificos |
| Aumentar complejidad antes de validar | Medio | Implementar por fases y cerrar cada fase con pruebas |

---

## 11. Criterios de aceptacion globales

La iniciativa se considera exitosa cuando:

- El usuario puede escribir texto plano como antes.
- El usuario puede escribir `/` y encontrar comandos utiles en espanol.
- El boton `+` ofrece insercion de bloques sin memorizar Markdown.
- El boton `Aa` permite formatear seleccion de forma simple.
- Las listas se continuan automaticamente con Enter.
- El contenido guardado sigue siendo Markdown legible.
- Las notas renderizadas mantienen sanitizacion y no cargan recursos externos.
- La UI funciona en mobile, tema oscuro, tema claro y modo enfoque.
- No se agregan migraciones SQLite para las fases iniciales.

---

## 12. Orden recomendado de trabajo

1. Crear registry de comandos.
2. Migrar `SlashCommandHandler` para usar el registry.
3. Mejorar `EditorPopup` con grupos, aliases y empty state persistente.
4. Ampliar comandos `/`.
5. Reusar registry desde boton `+`.
6. Agregar boton `Aa`.
7. Extraer helpers de transformacion de texto.
8. Generalizar auto-continuacion de listas.
9. Pulir CSS de popup y Markdown renderizado.
10. Agregar tests unitarios y manuales por fase.
11. Actualizar documentacion de RF/HU si la feature entra al roadmap formal.

---

## 13. Comandos de verificacion

Ejecutar durante la implementacion:

```bash
npm run test
npm run lint
npm run build
```

Si se modifican documentos con enlaces:

```bash
npm run check:docs
```

Para verificacion visual:

```bash
npm run dev
```

Luego revisar en browser:

- Ancho 320px.
- Ancho 390px.
- Desktop.
- Tema claro.
- Tema oscuro.
- Modo enfoque.

---

## 14. Decision base

Lumapse no necesita convertirse en Notion. Necesita que el estudiante pueda enriquecer sus apuntes cuando quiera, sin perder la velocidad de abrir, escribir y guardar.

La direccion correcta es:

> mas herramientas de escritura, menos complejidad estructural.

