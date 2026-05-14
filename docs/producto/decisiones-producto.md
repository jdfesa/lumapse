# Decisiones de Producto — Lumapse

> **Documento vivo** — Se actualiza a medida que se toman decisiones de producto y se incorporan datos del relevamiento.  
> **Última actualización:** 2026-05-14

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

## DP-002: Estructura de navegación Entrada / Materias / Archivo

**Fecha:** 2026-05-05  
**Actualización:** 2026-05-14  
**Estado:** ✅ Confirmada (con datos del relevamiento)

### Contexto

La versión actual de Lumapse presenta una lista plana de notas sin ninguna jerarquía. A medida que un estudiante acumula notas de múltiples materias a lo largo del cuatrimestre, esta lista se vuelve inmanejable. Necesitamos una estructura que organice sin abrumar.

### Decisión

Implementar una navegación con tres secciones predefinidas, con nomenclatura en español para mantener consistencia con el idioma de los usuarios:

- **📥 Entrada:** Destino por defecto de toda nota nueva. La bandeja de captura rápida. El usuario no piensa en dónde guardar, solo escribe.
- **📚 Materias:** Carpetas que el usuario crea manualmente, una por cada materia que cursa. Las notas se mueven desde Entrada cuando el usuario tiene tiempo de organizarlas.
- **📦 Archivo:** Notas que ya no son activas pero que el usuario quiere conservar (ej: apuntes de materias ya aprobadas).

### Justificación

- **Opinionada pero no rígida:** La app le da al estudiante una estructura predefinida que tiene sentido para su contexto (materias → parciales → aprobadas → archivadas), sin obligarlo a diseñarla desde cero como en Notion u Obsidian.
- **Reduce la parálisis de decisión:** "¿Dónde guardo esta nota?" → En Entrada. Siempre. Después la organizás.
- **Flujo natural:** Captura rápida → Organización cuando hay tiempo → Archivo cuando ya no se necesita.
- **Nomenclatura en español:** Los usuarios son estudiantes de un instituto argentino. Términos como "Inbox" o "Subjects" no aportan claridad; "Entrada", "Materias" y "Archivo" son palabras familiares que cualquier estudiante entiende sin explicación.

### Datos de soporte (validación empírica)

Resultados del [relevamiento de datos](resultados-relevamiento.md) (n=120):

- **P11:** El **69.2% prefiere carpetas por materia** como modelo de organización → **decisión validada directamente**.
- **P8:** El **73.3% prioriza "organizar por materia"** como feature → refuerza la estructura de Materias.
- **P5b:** El **58.9% reporta desorganización rápida** como dificultad → refuerza la necesidad de estructura predefinida.
- **Cruce P9×P11:** Quienes prefieren celular eligen carpetas por materia en el 71% de los casos → el modelo funciona para mobile.
- **Tags (20%):** Una minoría significativa prefiere etiquetas. Se evaluará como sistema complementario (ver DP-004).

### Condición de pivote

No aplica — la decisión fue validada empíricamente. Si en futuras iteraciones el feedback de uso real muestra que los usuarios no utilizan la estructura, se simplificará.

---

## DP-003: Mobile-first

**Fecha:** 2026-05-05  
**Actualización:** 2026-05-14  
**Estado:** ✅ Confirmada (con datos del relevamiento)

### Contexto

Lumapse debe funcionar bien en múltiples dispositivos. Sin embargo, el enfoque de diseño (¿diseñamos primero para celular y adaptamos a desktop, o viceversa?) impacta la arquitectura de la interfaz, los gestos, el tamaño de los elementos interactivos y la disposición del layout.

### Decisión

**Mobile-first.** La interfaz se diseña y optimiza primero para pantallas de celular, con adaptación posterior a pantallas más grandes si el tiempo lo permite.

Esta decisión se complementa con el [ADR-005](../adr/ADR-005-pivote-app-nativa.md) que documenta el pivote de PWA a app nativa empaquetada con Capacitor.

### Justificación

- El **72.5%** de los encuestados usaría la app desde el celular (P9).
- Sumando "Cualquiera por igual", el **95%** incluye celular como dispositivo de uso.
- El celular domina en **todas las carreras** sin excepción, incluso en Sistemas (70%).
- El **88.3%** toma notas en cuaderno/papel — la migración a digital requiere mínima fricción, y el celular es el dispositivo que ya llevan al aula.

### Datos de soporte (validación empírica)

Resultados del [relevamiento de datos](resultados-relevamiento.md) (n=120):

- **P9:** Celular 72.5%, Cualquiera 22.5%, Notebook/PC 4.2%, Tablet 0.8%.
- **P4:** El 88.3% usa cuaderno/papel → el celular no compite con otra app sino con el cuaderno.
- **Cruce P4×P9:** De los 106 que usan cuaderno, el 74.5% elegiría celular → brecha entre hábito actual y aspiración tecnológica.
- **Cruce P2×P9:** El celular domina en todas las carreras → no hay segmento que requiera desktop-first.

### Condición de pivote

No aplica — la evidencia es inequívoca. Mobile-first es la dirección correcta.

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
