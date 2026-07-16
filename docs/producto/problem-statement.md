# Problem Statement — Lumapse

**Fase Design Thinking:** Definir
**Formulación inicial:** Abril 2026
**Última revisión:** 2026-07-15
**Autor:** José David Sandoval

> **Nota de evolución:** El problema se conserva como una hipótesis fundamentada en el contexto local del IES 6023. Su extrapolación a otras instituciones o regiones requiere relevamiento propio. La solución técnica evolucionó después de la encuesta: Lumapse dejó de ser una PWA con IndexedDB y pasó a ser una aplicación Android empaquetada con Capacitor, con persistencia SQLite y distribución por APK ([ADR-005](../adr/ADR-005-pivote-app-nativa.md), [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md)).

---

## Declaración del problema

### Formato POV (Point of View)

> **[Estudiantes del IES 6023 y de contextos de uso equivalentes que todavía deben validarse]**
>
> necesitan **[una herramienta de captura y organización de notas de estudio que funcione offline, sin cuenta y con baja fricción]**
>
> porque **[las alternativas disponibles cubren partes del problema, pero pueden introducir cuentas, dependencia de sincronización, complejidad o flujos que no se ajustan simultáneamente a las restricciones observadas en el contexto local.]**

---

## Contexto del problema

### Contexto local relevado

La evidencia disponible proviene de observación, conversaciones exploratorias y una muestra no probabilística de estudiantes del IES 6023, en Salta. Permite orientar el producto para ese contexto; no demuestra que las mismas restricciones se presenten con igual intensidad en toda Latinoamérica ni en todas las instituciones de nivel superior.

Las restricciones consideradas son:

1. **Conectividad institucional limitada.** El 81.7% de la muestra calificó la conectividad del instituto dentro de las opciones agrupadas como deficiente. La encuesta no midió planes de datos ni cobertura fuera de la institución.

2. **Prioridad de uso móvil.** El 72.5% eligió el celular como dispositivo preferido para una futura app de notas. Esto respalda un diseño mobile-first, pero no describe por sí solo el hardware disponible ni el canal de instalación preferido.

3. **Fragmentación de notas.** La observación y las conversaciones preliminares identificaron apuntes dispersos entre papel, mensajería, fotografías y archivos. Esta evidencia cualitativa es exploratoria y no se cuantificó como pregunta independiente de la encuesta.

4. **Bajo costo como restricción de diseño.** Lumapse adopta gratuidad y ausencia de cuenta como premisas de producto. La encuesta no midió presupuesto disponible ni disposición a pagar, por lo que no corresponde atribuir un umbral económico a toda la población.

### El problema no es "tomar notas"

Existen numerosas aplicaciones de notas y varias funcionan offline o sin cuenta. La oportunidad de Lumapse no se basa en afirmar que todas las alternativas fallan, sino en evaluar si una combinación acotada de simplicidad, organización académica, almacenamiento local y uso móvil reduce fricciones para la muestra local.

| Necesidad del producto | Fricción posible en alternativas | Alcance de la evidencia |
|---|---|---|
| Funcionar sin internet | Algunas suites dependen de sincronización o limitan ciertas funciones offline; otras herramientas sí ofrecen uso local completo. | La encuesta respalda la necesidad offline, no una evaluación exhaustiva de competidores. |
| No exigir cuenta | Varias plataformas generales usan una cuenta; también existen alternativas locales que no la requieren. | Que solo el 10.8% la eligiera entre varias features indica prioridad relativa, no aceptación de autenticación. |
| Ser simple y liviana | Las suites generalistas pueden incorporar flujos que exceden la captura académica; el impacto real en rendimiento requiere comparación técnica. | La simplicidad surge de la propuesta y de señales cualitativas, no de un benchmark de mercado. |
| Admitir Markdown | Diferentes herramientas ya soportan Markdown con distintos alcances. | Es una decisión de formato y portabilidad de Lumapse, no una ventaja exclusiva demostrada por la encuesta. |
| Ser gratuita y sin publicidad | Los planes y condiciones varían entre productos y en el tiempo. | Es una restricción ética y académica del proyecto; la disposición a pagar no fue medida. |
| Priorizar celular sin perder portabilidad | El soporte móvil y de escritorio varía según cada producto. | El 72.5% respalda mobile-first y el 53.3% valoró celular + PC; no se evaluó un canal de distribución. |

---

## ¿Cómo sabemos que este problema existe?

### Evidencia directa

- **Observación personal:** Como estudiante del IES 6023, el autor identificó restricciones y usos que sirvieron para formular las hipótesis iniciales. Esta observación aporta contexto, pero no sustituye evidencia sistemática.

- **Conversaciones informales:** Al consultar a compañeros de cursada sobre cómo organizan sus apuntes, se registraron estas paráfrasis ilustrativas —no transcripciones literales ni frecuencias cuantificadas—:
  - Apuntes sin organización que luego se buscan en conversaciones de mensajería.
  - Notas almacenadas en servicios en línea que no siempre están disponibles en el momento de uso.
  - Fotografías de la pizarra que después resultan difíciles de localizar.

### Contraste con alternativas

El [análisis competitivo](./analisis-competitivo.md) distingue dos grupos generales. Las suites de productividad y notas sincronizadas cubren captura, organización y acceso multidispositivo, aunque pueden agregar cuentas, ecosistemas o complejidad innecesaria para este alcance. Las herramientas local-first cubren mejor el control de datos y el uso offline, pero algunas exigen una configuración o un modelo mental más técnico. Son tendencias comparativas, no reglas universales para cada producto.

Este contraste permite formular una oportunidad de diseño, pero no demuestra por sí solo una demanda de mercado. La validación disponible corresponde a la muestra del IES 6023 y debe complementarse con pruebas de uso del prototipo.

---

## Alcance del problema que Lumapse aborda

Lumapse **no pretende** reemplazar a Notion, Obsidian o cualquier herramienta enterprise. Su alcance es deliberadamente acotado:

```
┌─────────────────────────────────────────────────────┐
│                  LO QUE LUMAPSE SÍ ES               │
│                                                     │
│  ✓ Captura rápida de notas en Markdown              │
│  ✓ Organización por Materia / Sección / Nota         │
│  ✓ Búsqueda local sin depender de red               │
│  ✓ Arquitectura offline-first, sin backend          │
│  ✓ Sin cuenta ni backend propio                     │
│  ✓ Aplicación Android distribuida como APK           │
│  ✓ Backup ZIP exportable e importable                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               LO QUE LUMAPSE NO ES                  │
│                                                     │
│  ✗ Un second brain o knowledge base (tipo Notion)   │
│  ✗ Un editor colaborativo en tiempo real            │
│  ✗ Un gestor de proyectos                           │
│  ✗ Un reemplazo de Google Docs                      │
│  ✗ Una plataforma con backend o sync cloud automát. │
└─────────────────────────────────────────────────────┘
```

---

## Pregunta guía para validación

A lo largo del desarrollo, cada decisión de diseño y funcionalidad se evaluará contra esta pregunta:

> **"¿Esto ayuda a un estudiante a capturar, organizar y recuperar sus notas de estudio de forma más rápida, simple y confiable que lo que usa actualmente?"**

Si la respuesta es **no**, la funcionalidad no entra en el scope del proyecto.

---

*Documento de la fase Definir · Design Thinking · Lumapse · PP3 · 2026*
