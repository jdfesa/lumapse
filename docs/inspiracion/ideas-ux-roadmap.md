# Ideas UX/UI y Arquitectura — Roadmap de Inspiración

> **Origen principal:** análisis de usememos/memos (ver [`memos-benchmark.md`](./memos-benchmark.md))  
> **Criterio de prioridad:** realismo académico — memos es una app madura, Lumapse es un MVP enfocado.  
> **Fecha:** 2026-05-15

---

## Contexto: filosofía de Lumapse que guía estas ideas

Antes de aplicar cualquier idea externa, toda propuesta debe validarse contra estos principios:

1. **"Open, write, done"** — captura sin fricción, en segundos.
2. **Opinionado y estructurado** — estructura base de carpetas por materia, sin negociación; el estudiante no debe pensar dónde guardar una nota.
3. **Offline-first estricto** — funciona sin red; los datos viven en SQLite local del dispositivo.
4. **Mobile-first nativo** — APK Android; no es una web adaptada.
5. **Ligero por diseño** — límite de caracteres por nota (a definir); la atomicidad de las notas es un valor, no una limitación.
6. **Español primero** — interfaz en español como idioma principal.

---

## 🟢 Corto plazo — Hito 04 (Agosto 2026)

Ideas maduras, directamente aplicables al hito en curso sin complejidad adicional.

### UX-01 · FAB de captura + editor inline en el feed

| Campo | Detalle |
|---|---|
| **Idea** | Botón flotante (FAB) en la pantalla principal que expande un editor directamente en el feed, sin navegar a otra pantalla. |
| **Origen** | Flujo de captura de memos: la nota se escribe en la misma vista de timeline. |
| **Por qué encaja** | Cumple "open, write, done". El estudiante abre la app y en 2 toques tiene el cursor listo. |
| **Implementación** | Capacitor + Vanilla JS: `<button class="fab">+</button>` que monta un `NoteEditor` encima del feed con animación de slide-up. |
| **RF asociados** | RF-003 (nueva nota), HU-001, HU-003 |
| **Riesgo** | Bajo. Patrón clásico de Material Design. |

---

### UX-02 · Toggle tap: vista previa / edición de nota

| Campo | Detalle |
|---|---|
| **Idea** | Tap en una nota → preview Markdown renderizado. Tap en ícono de lápiz → modo edición. |
| **Origen** | Toggle editor/preview de memos. |
| **Por qué encaja** | El estudiante lee las notas más veces de las que las edita. El preview debe ser el estado por defecto. |
| **Implementación** | `NoteEditor` con estado `mode: 'preview' | 'edit'`. Ya existe la base en Hito 03. |
| **RF asociados** | RF-011, RF-012 |
| **Riesgo** | Muy bajo. Ya implementado parcialmente. |

---

### UX-03 · Timestamps relativos ("hace 2h", "ayer")

| Campo | Detalle |
|---|---|
| **Idea** | Mostrar fechas relativas en la lista de notas en lugar de fechas absolutas. |
| **Origen** | `@github/relative-time-element` usado en memos. |
| **Por qué encaja** | Hace la UI más natural y legible en mobile. El estudiante ve de inmediato si la nota es reciente. |
| **Implementación** | Función JS liviana (`formatRelative(date)`). No requiere librería si se mantiene simple. |
| **RF asociados** | RF-002 |
| **Riesgo** | Muy bajo. ~10 líneas de código. |

---

### UX-04 · Dark mode siguiendo preferencia del sistema

| Campo | Detalle |
|---|---|
| **Idea** | La app detecta el modo oscuro del SO Android y aplica el tema correspondiente automáticamente. |
| **Origen** | Patrón de memos (y estándar en apps mobile modernas). |
| **Por qué encaja** | Alineado con DP-003 (dark mode como decisión de producto). El 72.5% usa celular → batería importa. |
| **Implementación** | `prefers-color-scheme: dark` en CSS + `Capacitor.Plugins.Device` o media query nativa. |
| **RF asociados** | DP-003, RNF-007 |
| **Riesgo** | Bajo. CSS puro + media query. |

---

### UX-05 · Interfaz en español como idioma principal

| Campo | Detalle |
|---|---|
| **Idea** | Todos los textos, mensajes de error, placeholders y etiquetas en español rioplatense. |
| **Origen** | memos usa i18next con múltiples idiomas; Lumapse adopta Spanish-first. |
| **Por qué encaja** | Audiencia: estudiantes argentinos. El inglés como segunda opción es un objetivo de Hito 05+. |
| **Implementación** | Constantes de texto centralizadas en `src/i18n/es.js`. Preparar la estructura para futura expansión a inglés. |
| **RF asociados** | RNF (a crear) |
| **Riesgo** | Bajo. Solo requiere disciplina de codificación. |

---

## 🟡 Mediano plazo — Hito 05 (Septiembre 2026)

Ideas que requieren más trabajo o que dependen de la estabilidad del núcleo (APK firmado, SQLite funcionando).

### UX-06 · Búsqueda con fuzzy matching

| Campo | Detalle |
|---|---|
| **Idea** | Búsqueda de notas tolerante a errores tipográficos ("martem" encuentra "martema"). |
| **Origen** | memos usa `fuse.js` para búsqueda fuzzy sobre el contenido de notas. |
| **Por qué encaja** | Estudiantes escriben rápido, cometen errores. La búsqueda exacta frustra. |
| **Implementación** | `fuse.js` es liviana (~24KB minificada). Se puede integrar con la capa de `NoteService`. |
| **RF asociados** | RF-019 (pendiente de crear) |
| **Riesgo** | Medio. Requiere index en SQLite + integración con el store. |

---

### UX-07 · Chips de materia scrolleables como filtro visual

| Campo | Detalle |
|---|---|
| **Idea** | Fila horizontal de chips ("Matemática", "Historia", "Todas") que filtra notas por materia. |
| **Origen** | Chips de tags de memos adaptados al modelo de carpetas de Lumapse. |
| **Por qué encaja** | El 69.2% prefiere carpetas por materia. Los chips permiten el cambio de contexto en un solo tap. |
| **Implementación** | `NoteList` recibe un prop `activeFolder`; los chips son botones CSS con scroll horizontal overflow. |
| **RF asociados** | RF-013, RF-014, RF-015 |
| **Riesgo** | Medio. Depende de que el módulo de organización académica esté implementado. |

---

### UX-08 · Soporte inglés como segundo idioma (i18n)

| Campo | Detalle |
|---|---|
| **Idea** | Agregar inglés como idioma de interfaz seleccionable en ajustes. |
| **Origen** | i18next + locales de memos (soporte multi-idioma maduro). |
| **Por qué encaja** | Amplía el mercado potencial. Lumapse puede ser útil más allá de Argentina. |
| **Implementación** | Si se usó la estructura `src/i18n/es.js` en corto plazo, agregar `en.js` es trivial. |
| **RF asociados** | RNF (a crear) |
| **Riesgo** | Bajo técnico / medio operativo (traducción). |

---

## 🔵 Largo plazo — Hito 06+ (Octubre 2026 en adelante)

Ideas valiosas pero que requieren madurez del producto base o una segunda versión.

### UX-09 · Exportar nota como imagen para compartir

| Campo | Detalle |
|---|---|
| **Idea** | Botón "Compartir como imagen" que genera un PNG de la nota renderizada para compartir por WhatsApp/Instagram. |
| **Origen** | `html-to-image` en memos. |
| **Por qué encaja** | Los estudiantes comparten apuntes entre sí. Esta feature viral podría impulsar la adopción. |
| **Implementación** | `html-to-image` o `Capacitor Share API` + render del DOM de la nota. |
| **RF asociados** | RF futuro (a definir) |
| **Riesgo** | Medio/alto. Requiere render correcto de Markdown en el canvas. |

---

### UX-10 · Tags como capa adicional sobre las carpetas

| Campo | Detalle |
|---|---|
| **Idea** | Permitir etiquetar notas con tags libres dentro de una materia ("examen", "importante", "pendiente"). |
| **Origen** | Sistema de tags de memos (pilar central de su organización). |
| **Por qué encaja** | Amplía la organización sin romper el modelo de carpetas opinionado. Tags son opcionales, no reemplazos. |
| **Implementación** | Columna `tags` en SQLite (JSON array). UI: campo opcional en el editor. |
| **RF asociados** | Nuevo RF (a crear en Hito 06) |
| **Riesgo** | Medio. Requiere schema migration en SQLite. |

---

### UX-11 · Vista timeline de recientes como segunda vista

| Campo | Detalle |
|---|---|
| **Idea** | Vista alternativa que muestra TODAS las notas en orden cronológico, sin filtro de materia. |
| **Origen** | Timeline-first de memos: el feed cronológico es la pantalla principal. |
| **Por qué encaja** | Útil para ver qué se escribió recientemente sin importar la materia ("¿qué anoté ayer?"). |
| **Implementación** | Tab adicional en la nav: "Recientes" muestra `SELECT * FROM notes ORDER BY updatedAt DESC`. |
| **RF asociados** | RF futuro |
| **Riesgo** | Bajo técnico. Medio de UX (no complicar el flujo principal). |

---

## Resumen visual

```
CORTO PLAZO (Hito 04 — Agosto 2026)
  ├── UX-01 · FAB + editor inline
  ├── UX-02 · Toggle preview/edición
  ├── UX-03 · Timestamps relativos
  ├── UX-04 · Dark mode automático
  └── UX-05 · Interfaz en español

MEDIANO PLAZO (Hito 05 — Septiembre 2026)
  ├── UX-06 · Búsqueda fuzzy
  ├── UX-07 · Chips de materia
  └── UX-08 · Soporte inglés (i18n)

LARGO PLAZO (Hito 06+ — Octubre 2026 en adelante)
  ├── UX-09 · Exportar nota como imagen
  ├── UX-10 · Tags opcionales sobre carpetas
  └── UX-11 · Vista timeline de recientes
```

---

## Nota sobre el stack técnico: Vanilla JS vs Framework

> Esta sección responde una pregunta técnica surgida durante el análisis de memos.

**Memos usa React 19.** Lumapse usa Vanilla JS + Vite. ¿Hay que cambiar?

### Conclusión directa: **No. Vanilla JS es la decisión correcta para Lumapse.**

| Criterio | Vanilla JS (actual) | React (memos) |
|---|---|---|
| **Peso del runtime** | 0 KB adicionales | ~45KB (React 19 min+gzip) |
| **Velocidad de arranque en Android** | Máxima | Overhead de reconciliación + hidratación |
| **Complejidad** | Baja — fácil de auditar en el tribunal | Alta — requiere conocer React, hooks, bundles |
| **Capacitor compatibility** | Total | Total |
| **Límite de caracteres por nota** | Irrelevante — SQLite + DOM simples escalan sin problema | Ídem |
| **Para cientos de notas en SQLite** | Virtualización manual si hace falta | React Virtualized disponible |

**El argumento clave:** memos es complejo porque tiene multi-usuario, gRPC, AWS S3, mapas Leaflet,
integraciones AI, MCP, etc. Lumapse no necesita nada de eso. Vanilla JS es suficiente y superior
en ligereza para el caso de uso de Lumapse.

**Si en el futuro el DOM management se vuelve tedioso**, la opción natural dentro del stack actual
sería **Preact** (~3KB), no React. Pero ese cambio requeriría un ADR nuevo con justificación.

> **Regla:** no se cambia el stack sin ADR aprobado.
