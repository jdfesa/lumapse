# Benchmark general: apps open-source de notas y conocimiento

> **Fecha de análisis:** 2026-06-02  
> **Motivo:** buscar referencias open-source adicionales a memos para mejorar Lumapse sin perder foco.  
> **Regla:** estudiar ideas, UX, arquitectura y decisiones de producto; no copiar código externo sin revisión de licencia y compatibilidad.

---

## 0. Rol de este documento

Este es el **mapa madre** de inspiración open-source para Lumapse. Su función no es profundizar en
cada app por separado, sino ubicar cada proyecto dentro de una comparación común:

- qué problema resuelve,
- qué idea puede servir,
- qué riesgo trae,
- qué tan cerca está del producto que Lumapse quiere ser.

Cuando una app merece más detalle, se crea un **deep dive** aparte. Por ahora, Memos tiene uno porque
fue la primera referencia fuerte y de ahí surgió una parte importante del roadmap UX inicial.

---

## 1. Criterio de análisis

Lumapse es **offline-first**, **mobile-first** y **student-first**. Eso no significa "always offline" ni
"always mobile"; significa que la experiencia base debe funcionar perfecto en Android y sin conexión,
pero puede crecer hacia sincronización, backup, escritorio o adjuntos cuando el núcleo esté estable.

Para evaluar cada proyecto se usaron estas preguntas:

1. ¿Qué problema real resuelve para alguien que toma notas?
2. ¿Qué parte de su UX se siente premium sin exigir demasiada infraestructura?
3. ¿Qué idea puede sumar valor a estudiantes universitarios?
4. ¿Qué complejidad agregaría si se implementara en Lumapse?
5. ¿Conviene estudiarlo a nivel producto, arquitectura o código?

---

## 2. Proyectos candidatos

| Proyecto | Fuente | Enfoque | Qué estudiar | Valor potencial para Lumapse | Riesgo |
|---|---|---|---|---|---|
| **Joplin** | https://github.com/laurent22/joplin | Notas + tareas, Markdown, adjuntos, sync opcional, offline-first | Modelo de recursos/adjuntos, import/export, búsqueda, sync opcional | Muy alto para post-release: imagenes, backup, exportación, propiedad de datos | Medio/alto si se replica sync; bajo si solo se estudia adjuntos/export |
| **Markor** | https://github.com/gsantner/markor | Editor Android liviano para notas, tareas y texto plano | QuickNote, archivos locales, Markdown/todo.txt, compartir/exportar | Muy alto: referencia mobile-first simple, rápida y defendible | Bajo: su filosofía encaja con Lumapse |
| **Notesnook** | https://github.com/streetwriters/notesnook | Notas privadas con cifrado end-to-end, web/desktop/mobile | Privacidad por diseño, monorepo multiplataforma, cliente mobile | Alto como referencia de confianza, backup y privacidad futura | Medio/alto: cifrado completo no es MVP |
| **Logseq** | https://github.com/logseq/logseq | Knowledge base local-first, bloques, backlinks, grafo | Daily notes, enlaces bidireccionales, organización no lineal | Medio/alto: ideas para conexiones entre apuntes y repaso | Alto si se intenta copiar el modelo de bloques |
| **SiYuan** | https://github.com/siyuan-note/siyuan | PKM self-hosted/local-first con bloques, PDF/OCR, WebDAV/S3 | Gestión de assets, PDF/OCR, backlinks, sync configurable | Medio: buen mapa de features avanzadas para estudiantes | Alto: demasiado grande para el estado actual de Lumapse |
| **AppFlowy** | https://github.com/AppFlowy-IO/AppFlowy | Workspace tipo Notion con docs, wikis, tareas, bases y colaboración | Templates, tableros, workspace, experiencia cross-device | Medio: inspiración visual y de organización futura | Alto: producto mucho más amplio que Lumapse |
| **Saber** | https://github.com/saber-notes/saber | Notas manuscritas multiplataforma | Escritura a mano, sincronización, protección de notas | Medio: útil para entender demanda estudiantil de handwriting | Alto: requiere canvas/ink engine; no para MVP |
| **Zettlr** | https://github.com/Zettlr/Zettlr | Markdown académico y publicación | Exportación, flujo académico, citas, documentos largos | Medio: inspiración para exportar apuntes o trabajos | Bajo/medio: desktop-first, no mobile-first |
| **Memos** | https://github.com/usememos/memos | Captura rápida tipo timeline, self-hosted | Captura inmediata, timeline, tags, búsqueda, simplicidad UX. Ver deep dive en [`memos-benchmark.md`](./memos-benchmark.md) | Alto: fue la referencia inicial para el flujo "open, write, done" | Medio si se imita demasiado el producto completo |

### Por qué Memos tiene deep dive propio

Memos no queda separado del benchmark: está incluido en la tabla anterior y se usa como referencia en
varias ideas rescatables. El documento [`memos-benchmark.md`](./memos-benchmark.md) existe porque fue
el primer caso estudiado en profundidad y porque su flujo de captura rápida ya impactó decisiones de
UX en Lumapse.

Las demás apps se mantienen en este benchmark mientras sirvan como radar comparativo. Si en el futuro
Joplin, Markor o Notesnook pasan a guiar una implementación concreta, se podrá crear un deep dive
individual para esa app.

---

## 3. Ideas rescatables para Lumapse

### A. Adjuntos como "recursos" y no como contenido embebido

Joplin y SiYuan son las referencias más útiles para pensar adjuntos. La idea importante no es "meter
imagenes en la nota" como texto o base64, sino tratarlas como **recursos asociados**:

- La nota guarda metadata y referencia.
- El archivo vive fuera del contenido principal.
- La UI muestra miniaturas.
- La app puede limpiar recursos huérfanos.
- El backup/export debe saber incluir nota + recursos.

Esto confirma la deuda post-release ya definida para imagenes: miniatura + archivo optimizado local,
con SQLite guardando metadata y relación con la nota.

### B. Captura rápida premium

Memos y Markor refuerzan que una app de notas se siente buena cuando la captura es inmediata:

- Entrada rápida desde la pantalla principal.
- Nota de hoy o QuickNote.
- Edición sin fricción.
- Guardado automático.
- Estados visuales claros: vacío, editando, guardado, búsqueda sin resultados.

Esto es de bajo costo y alto valor. Es el tipo de mejora que puede hacer que Lumapse se sienta más
producto sin agregar infraestructura pesada.

### C. Propiedad del dato: exportar antes que sincronizar

Joplin, Markor, Notesnook y Zettlr muestran que el usuario avanzado valora no quedar encerrado.
Para Lumapse, antes de prometer cloud/sync, conviene priorizar:

- Exportar notas por materia.
- Exportar todo como backup.
- Importar desde backup propio.
- Mantener compatibilidad con Markdown o texto plano cuando sea viable.

Esto es mucho más defendible que sincronización temprana.

### D. Organización flexible pero no caótica

Logseq, SiYuan y Memos usan tags, backlinks, bloques o timeline. Lumapse debe aprender de eso sin
perder su ventaja: estructura académica por materias.

Propuesta:

- Mantener carpetas/materias como estructura principal.
- Agregar tags opcionales solo cuando el MVP esté estable.
- Evaluar backlinks simples entre notas, pero como mejora avanzada.
- Evitar por ahora un editor de bloques completo.

### E. Funciones estudiantiles con alto deseo y alta complejidad

Saber, SiYuan y Zettlr muestran features que estudiantes reconocen como valiosas:

- Notas manuscritas.
- PDF con anotaciones.
- OCR de imagenes del pizarrón.
- Citas/export académico.
- Flashcards o repaso.

Son ideas potentes, pero no conviene meterlas todas. Para Lumapse, el orden razonable sería:

1. Imagenes adjuntas post-release.
2. Export/backup robusto.
3. PDF adjunto como recurso, sin anotación interna.
4. OCR como investigación futura.
5. Handwriting o PDF annotation solo si el proyecto ya tiene adopción real.

---

## 4. Qué estudiar primero

### Prioridad 1 - Estudio profundo

1. **Joplin:** modelo de adjuntos, export/import, búsqueda, sync opcional.
2. **Markor:** experiencia Android liviana, QuickNote, archivos locales, compartir/exportar.
3. **Memos:** captura rápida, timeline, tags, búsqueda, UX simple.

### Prioridad 2 - Estudio selectivo

4. **Notesnook:** privacidad, cifrado, confianza, arquitectura multiplataforma.
5. **Logseq:** daily notes, backlinks, grafo conceptual.

### Prioridad 3 - Radar largo plazo

6. **SiYuan:** assets, PDF/OCR, self-hosting, block editor.
7. **Saber:** handwriting.
8. **Zettlr:** export académico y publicación.
9. **AppFlowy:** templates y workspace, sin adoptar su complejidad.

---

## 5. Ideas que sí podrían hacer sentir premium a Lumapse

Estas ideas tienen buena relación valor/complejidad:

| Idea | Inspiración | Horizonte | Complejidad |
|---|---|---|---|
| QuickNote / nota rápida del día | Markor, Logseq | Post-release cercano | Baja |
| Vista "Recientes" global | Memos, Joplin | Post-release cercano | Baja |
| Exportar por materia | Joplin, Markor, Zettlr | Post-release cercano | Media |
| Backup completo local | Joplin, Notesnook | Post-release cercano | Media |
| Adjuntar imagen optimizada | Joplin, SiYuan | Post-release | Media/alta |
| Tags opcionales | Memos, Joplin, Logseq | Post-release | Media |
| Backlinks simples entre notas | Logseq, SiYuan | Futuro | Media/alta |
| Adjuntar PDF sin anotarlo | Joplin, SiYuan | Futuro | Media |
| OCR de pizarrón | SiYuan | Futuro | Alta |
| Handwriting | Saber | Futuro lejano | Alta |

---

## 6. Guardrails para no saturar Lumapse

1. No agregar cloud antes de backup/export local.
2. No agregar editor de bloques antes de estabilizar notas, calendario y release Android.
3. No guardar archivos pesados dentro de SQLite.
4. No convertir Lumapse en un Notion universitario.
5. No prometer colaboración multiusuario en el primer ciclo.
6. No introducir features que el estudiante no pueda entender en 10 segundos.
7. Toda feature nueva debe poder explicarse en la defensa técnica con arquitectura, límites y riesgos.

---

## 7. Conclusión

La oportunidad de Lumapse no está en ganarle a Joplin, Logseq o AppFlowy por cantidad de features.
Está en ser una app académica móvil que resuelve muy bien un flujo específico:

> abrir, capturar, organizar por materia, encontrar después y no perder el dato.

El benchmark sugiere que el próximo salto de valor no debería ser "más complejidad", sino
**más confianza y mejor captura**: adjuntos bien diseñados, export/backup, nota rápida, búsqueda fuerte
y organización flexible sin romper el modelo académico.
