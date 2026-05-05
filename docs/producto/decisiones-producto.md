# Decisiones de Producto — Lumapse

> **Documento vivo** — Se actualiza a medida que se toman decisiones de producto y se incorporan datos del relevamiento.  
> **Última actualización:** 2026-05-05

---

## Propósito de este documento

Este documento registra las decisiones de diseño y producto que se toman durante el desarrollo de Lumapse, junto con su **justificación**, la **evidencia** que las respalda (o que se espera recopilar), y las **condiciones de pivote** en caso de que los datos contradigan los supuestos.

El objetivo es doble:

1. **Para el desarrollo:** Proporcionar una guía clara de hacia dónde va el producto y por qué, evitando decisiones arbitrarias o basadas únicamente en la intuición del diseñador.
2. **Para la defensa académica:** Demostrar un proceso de toma de decisiones fundamentado, trazable y abierto a la validación empírica.

---

## Formato de registro

Cada decisión sigue esta estructura:

- **Contexto:** ¿Qué problema o disyuntiva nos llevó a esta decisión?
- **Decisión:** ¿Qué se decidió?
- **Justificación:** ¿Por qué se tomó esta decisión y no otra?
- **Datos de soporte:** ¿Qué evidencia la respalda? (puede ser datos ya recopilados, investigación de mercado, o datos pendientes de la encuesta)
- **Condición de pivote:** ¿Bajo qué resultado de la encuesta revisaríamos esta decisión?
- **Estado:** `Confirmada` | `Pendiente de validación` | `Revisada`

---

## DP-001: Título unificado al estilo Typora

**Fecha:** 2026-05-05  
**Estado:** Pendiente de validación

### Contexto

Lumapse tenía un campo de título separado (un `<input>` en la cabecera del editor) y el contenido Markdown en un `<textarea>` debajo. Esto generaba una experiencia donde el usuario debía mantener dos cosas: el "nombre" de la nota y su contenido, sin relación directa entre ambos. En Markdown puro, el título de un documento es la primera línea con `# Título`.

### Decisión

Eliminar el campo de título separado. La primera línea del contenido que comience con `# ` se extrae automáticamente como el título de la nota y se muestra en la barra lateral. Si la nota no tiene una línea con `#`, se muestra un título por defecto ("Sin título").

### Justificación

- **Reduce la fricción:** El usuario escribe en un solo lugar, no tiene que decidir qué va en el título y qué va en el contenido.
- **Consistencia con Markdown:** El estándar Markdown ya define `# ` como encabezado principal. Respetar esta convención reduce la curva de aprendizaje para usuarios que conozcan la sintaxis.
- **Precedente:** Aplicaciones exitosas como Typora, Bear y iA Writer siguen este patrón.
- **Público objetivo:** Estudiantes universitarios que buscan velocidad y mínima fricción al tomar notas. Un campo extra es un paso extra.

### Datos de soporte

- Observación directa durante el desarrollo: el campo de título generaba confusión sobre su relación con el contenido.
- **Pendiente:** P8 de la encuesta ("Que sea rápida" como característica prioritaria) reforzaría esta decisión si aparece entre las 3 más votadas.

### Condición de pivote

Si la encuesta revela que los usuarios valoran la organización manual más que la velocidad (P8: "Organizar por materia" >> "Que sea rápida"), podría reconsiderarse mantener un campo de título explícito para facilitar la nomenclatura manual.

---

## DP-002: Estructura de navegación Inbox / Subjects / Archive

**Fecha:** 2026-05-05  
**Estado:** Pendiente de validación

### Contexto

La versión actual de Lumapse presenta una lista plana de notas sin ninguna jerarquía. A medida que un estudiante acumula notas de múltiples materias a lo largo del cuatrimestre, esta lista se vuelve inmanejable. Necesitamos una estructura que organice sin abrumar.

### Decisión

Implementar una navegación con tres secciones predefinidas:

- **📥 Inbox (Entrada):** Destino por defecto de toda nota nueva. La bandeja de captura rápida. El usuario no piensa en dónde guardar, solo escribe.
- **📚 Subjects (Materias):** Carpetas que el usuario crea manualmente, una por cada materia que cursa. Las notas se mueven desde el Inbox cuando el usuario tiene tiempo de organizarlas.
- **🗄️ Archive (Archivo):** Notas que ya no son activas pero que el usuario quiere conservar (ej: apuntes de un parcial ya rendido).

### Justificación

- **Opinionada pero no rígida:** La app le da al estudiante una estructura predefinida que tiene sentido para su contexto (materias → parciales → aprobadas → archivadas), sin obligarlo a diseñarla desde cero como en Notion u Obsidian.
- **Reduce la parálisis de decisión:** "¿Dónde guardo esta nota?" → En el Inbox. Siempre. Después la organizás.
- **Flujo natural:** Captura rápida → Organización cuando hay tiempo → Archivo cuando ya no se necesita.
- **Público objetivo:** Los estudiantes manejan su vida académica por materias. La estructura refleja su modelo mental.

### Datos de soporte

- **Pendiente (clave):** P12 de la encuesta ("¿Cómo preferirías organizar tus notas de estudio?").
  - Si la mayoría elige **"En carpetas por materia"** → decisión validada directamente.
  - Si la mayoría elige **"Con etiquetas/tags"** → evaluar si agregamos tags como sistema complementario o alternativo.
  - Si la mayoría elige **"Lista simple"** o **"No me importa"** → podría mantenerse la estructura actual (lista plana) con una búsqueda robusta como alternativa.
- **Pendiente:** Cruce P9 × P12 → si los usuarios de celular prefieren organización simple, priorizamos el Inbox y dejamos las carpetas como algo secundario.
- **Pendiente:** P5b → si "Se desorganizan rápido" es un pain point frecuente, refuerza la necesidad de estructura predefinida.

### Condición de pivote

- Si P12 muestra preferencia clara por tags (>40%) → implementar sistema de tags como mecanismo principal, carpetas como secundario.
- Si P12 muestra preferencia por lista simple (>40%) → mantener lista plana con búsqueda potente, posponer la estructura de carpetas.

---

## DP-003: Mobile-first vs Desktop-first

**Fecha:** 2026-05-05  
**Estado:** Pendiente de validación (bloqueado por encuesta)

### Contexto

Lumapse es una PWA que debe funcionar bien en ambos entornos. Sin embargo, el enfoque de diseño inicial (¿diseñamos primero para celular y adaptamos a desktop, o viceversa?) impacta la arquitectura de la interfaz, los gestos, el tamaño de los elementos interactivos y la disposición del layout.

### Decisión

**Pospuesta.** Se espera el resultado de la encuesta (P9) antes de definir el enfoque.

### Justificación

- No hay datos concretos sobre el dispositivo principal de los estudiantes del IES 6023.
- Diseñar para el dispositivo equivocado primero podría requerir refactorizaciones costosas.
- La encuesta se cierra este fin de semana, por lo que el bloqueo es de días, no semanas.

### Datos de soporte

- **Pendiente (clave):** P9 de la encuesta ("¿Desde qué dispositivo usarías más una app de notas?").
  - Si **Celular** > 50% → Mobile-first.
  - Si **Notebook/PC** > 50% → Desktop-first.
  - Si **Cualquiera por igual** > 40% → Diseño responsive equilibrado sin priorizar un factor de forma.
- **Pendiente:** P4 ("¿Cómo tomás notas habitualmente?") → proporciona contraste entre el dispositivo que *ya usan* y el que *usarían* (P9).

### Condición de pivote

La decisión se toma directamente con los datos. No hay supuesto previo que pivotar.

---

## Decisiones futuras por registrar

Las siguientes decisiones se documentarán formalmente a medida que avance el desarrollo:

| ID | Tema | Disparador |
|---|---|---|
| DP-004 | Tags como sistema complementario a carpetas | Resultados de P12 |
| DP-005 | Diseño de la experiencia de captura rápida (estilo Memos) | Post-validación de P8 y P9 |
| DP-006 | Onboarding y ayuda contextual | Post Hito 04, cuando la estructura esté implementada |

---

*Este documento se actualiza con cada decisión de producto relevante. Los resultados de la encuesta se incorporarán en `docs/producto/resultados-relevamiento.md` y se referenciarán desde aquí para mantener la trazabilidad.*
