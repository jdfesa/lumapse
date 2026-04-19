# Problem Statement — Lumapse

**Fase Design Thinking:** Definir  
**Última actualización:** Abril 2026  
**Autor:** José David Sandoval

---

## Declaración del problema

### Formato POV (Point of View)

> **[Estudiantes de nivel terciario y universitario hispanohablantes]**  
> necesitan **[una herramienta de captura y organización de notas de estudio que funcione offline, sin cuenta, y sin fricción]**  
> porque **[las herramientas existentes requieren conexión permanente, cuentas obligatorias, y están diseñadas para un público con necesidades y recursos diferentes a los suyos.]**

---

## Contexto del problema

### Realidad del estudiante terciario/universitario hispanohablante

Si bien las personas de usuario fueron construidas desde el contexto local (Salta, Argentina), las restricciones que se describen a continuación son comunes a estudiantes de instituciones terciarias y universitarias en toda Latinoamérica y otras regiones hispanohablantes:

El contexto de uso de Lumapse no es el de un estudiante con MacBook y WiFi ilimitado en una universidad del primer mundo. El contexto real es:

1. **Conectividad limitada.** Muchos estudiantes dependen de datos móviles prepagos con paquetes de 3-5 GB mensuales. Las instituciones terciarias en ciudades intermedias no siempre tienen WiFi estable o con cobertura completa.

2. **Dispositivos de gama media-baja.** El smartphone es el dispositivo principal de estudio. Las notebooks son compartidas, prestadas o de generaciones anteriores. El almacenamiento disponible es limitado.

3. **Fragmentación de notas.** Sin una herramienta adecuada, los apuntes terminan dispersos en: WhatsApp (mensajes a uno mismo), galería de fotos (fotos de pizarra), Google Docs (si hay conexión), papel suelto, y archivos de texto sin organización.

4. **Sin presupuesto para herramientas premium.** Obsidian Sync ($8 USD/mes), Notion Teams ($8 USD/mes), Evernote Premium ($8 USD/mes) — estas opciones no son viables para un estudiante con presupuesto limitado.

### El problema no es "tomar notas"

Existen cientos de aplicaciones de notas. El problema real es que **ninguna resuelve la combinación específica** de restricciones del público objetivo:

| Restricción | Estado actual |
|---|---|
| Funcionar sin internet | La mayoría requiere sync online, o el modo offline es limitado |
| Sin cuenta obligatoria | Casi todas requieren email/Google/Apple/Microsoft |
| Liviana (< 5 MB instalada) | Notion: ~80 MB, OneNote: ~120 MB, Evernote: ~150 MB |
| Markdown nativo | Solo Obsidian y herramientas de nicho |
| Gratuita y sin ads | Pocas opciones realmente gratuitas sin freemium invasivo |
| Cross-platform real | Las mejoras siempre priorizan iOS/macOS |

---

## ¿Cómo sabemos que este problema existe?

### Evidencia directa

- **Observación personal:** Como estudiante del IES 6023, el autor vive diariamente las mismas restricciones que el público objetivo. Los compañeros de cursada recurren a WhatsApp como herramienta de "notas" porque es lo que siempre tienen abierto.

- **Conversaciones informales:** Al consultar a compañeros de cursada sobre cómo organizan sus apuntes, las respuestas más comunes fueron:
  - *"No los organizo, después los busco en el WhatsApp"*
  - *"Los tengo en Google Keep pero a veces no carga"*
  - *"Saco fotos de la pizarra y después no las encuentro"*

### Evidencia de mercado

- **Obsidian** ha crecido exponencialmente, demostrando demanda de herramientas Markdown-first y local-first. Sin embargo, su modelo de negocio ($8/mes por sync) excluye al público de bajos recursos.

- **Simplenote** (de Automattic) se acerca a la propuesta, pero no tiene soporte Markdown avanzado y su diferenciación es limitada.

- El movimiento **local-first software** (liderado por investigadores como Martin Kleppmann) refleja una tendencia creciente hacia aplicaciones que priorizan el almacenamiento local y la privacidad.

---

## Alcance del problema que Lumapse aborda

Lumapse **no pretende** reemplazar a Notion, Obsidian o cualquier herramienta enterprise. Su alcance es deliberadamente acotado:

```
┌─────────────────────────────────────────────────────┐
│                  LO QUE LUMAPSE SÍ ES               │
│                                                     │
│  ✓ Captura rápida de notas en Markdown              │
│  ✓ Organización simple por etiquetas                │
│  ✓ Búsqueda local instantánea                       │
│  ✓ Funcionamiento 100% offline                      │
│  ✓ Sin cuenta, sin servidores, sin tracking         │
│  ✓ Instalable como PWA en cualquier dispositivo     │
│  ✓ Export/Import para no quedar atrapado             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               LO QUE LUMAPSE NO ES                  │
│                                                     │
│  ✗ Un second brain o knowledge base (tipo Notion)   │
│  ✗ Un editor colaborativo en tiempo real            │
│  ✗ Un gestor de proyectos                           │
│  ✗ Un reemplazo de Google Docs                      │
│  ✗ Una plataforma con backend o cloud storage       │
└─────────────────────────────────────────────────────┘
```

---

## Pregunta guía para validación

A lo largo del desarrollo, cada decisión de diseño y funcionalidad se evaluará contra esta pregunta:

> **"¿Esto ayuda a un estudiante a capturar, organizar y recuperar sus notas de estudio de forma más rápida, simple y confiable que lo que usa actualmente?"**

Si la respuesta es **no**, la funcionalidad no entra en el scope del proyecto.

---

*Documento de la fase Definir · Design Thinking · Lumapse · PP3 · 2026*
