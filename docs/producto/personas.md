# Personas de Usuario — Lumapse

**Fase Design Thinking:** Empatizar
**Formulación inicial:** Abril 2026
**Última revisión:** 2026-07-15
**Autor:** José David Sandoval

> **Nota de evolución:** Las personas se formularon antes del relevamiento y del pivote técnico. Sus necesidades centrales —captura rápida, uso offline, privacidad, portabilidad y facilidad de evaluación— siguen vigentes. Las referencias originales a PWA/IndexedDB se reinterpretan en el producto actual como APK Android con Capacitor, SQLite local y backup ZIP. La validación directa de estas personas con usuarios del prototipo queda para el Hito 06.

---

## ¿Qué es una Persona?

Una persona es un arquetipo ficticio pero basado en datos reales que representa a un segmento de usuarios. No es un usuario "inventado": se construye a partir de observación, conversaciones informales y experiencia directa con el grupo objetivo. Las personas guían las decisiones de diseño respondiendo a la pregunta: **"¿esto le sirve a [persona]?"**

---

## Persona 1 — Lucía (la estudiante organizada)

| Campo | Detalle |
|---|---|
| **Nombre** | Lucía Fernández |
| **Edad** | 21 años |
| **Carrera** | Analista en Sistemas — IES 6023, Salta |
| **Dispositivos** | Celular Android (gama media), notebook prestada ocasionalmente |
| **Conexión** | Datos móviles limitados (3 GB/mes) |
| **Nivel técnico** | Intermedio — usa herramientas digitales pero no es power user |

### Contexto

Lucía cursa 3° año de la tecnicatura. Toma apuntes en el celular durante las clases porque no siempre tiene acceso a una notebook. Usa WhatsApp para enviarse notas a sí misma y Google Keep, pero tiene la cuenta de Google llena y Keep le pide sincronizar constantemente. Cuando no tiene datos, pierde acceso a sus notas.

### Frustraciones

- **No puede acceder a sus notas sin internet.** Google Keep y Notion necesitan conexión para cargar contenido que no está en caché.
- **Las apps de notas están diseñadas para otro público.** Notion tiene funciones que nunca va a usar. OneNote requiere cuenta Microsoft. Obsidian es de escritorio y complejo.
- **Fragmentación:** Tiene notas en WhatsApp, fotos de pizarras en la galería, archivos en Google Drive, y apuntes en papel. No hay un lugar unificado.
- **El celular tiene poco espacio.** No quiere instalar apps pesadas (Notion: ~80 MB, OneNote: ~120 MB).

### Necesidades

- Capturar notas **rápido** durante la clase (< 3 segundos para empezar a escribir).
- Acceder a sus notas **sin conexión**, siempre.
- Organizar por materia o tema sin que sea complicado.
- Que funcione en su celular sin consumir mucho espacio ni datos.

### Cita sintética del arquetipo

> *"Necesito algo que abra rápido, que me deje escribir, y que cuando llegue a casa las notas sigan ahí. No necesito inteligencia artificial, ni bases de datos relacionales, ni dashboards. Solo necesito que funcione."*

---

## Persona 2 — Martín (el estudiante práctico)

| Campo | Detalle |
|---|---|
| **Nombre** | Martín Ríos |
| **Edad** | 24 años |
| **Carrera** | Ingeniería en Informática — UNSa, Salta |
| **Dispositivos** | Notebook con Linux, celular Android |
| **Conexión** | WiFi en la universidad, sin datos móviles en casa estable |
| **Nivel técnico** | Avanzado — usa terminal, conoce herramientas de desarrollo |

### Contexto

Martín ya probó Obsidian, Logseq y Notion. Le gusta Obsidian pero le molesta que no tenga sync nativo gratuito y que la app móvil sea lenta. Prefiere herramientas que respeten su privacidad y que no requieran cuenta. Escribe en Markdown porque lo usa en sus proyectos de programación.

### Frustraciones

- **Obsidian mobile es lento** y el sync entre dispositivos requiere pagar o configurar soluciones complejas (Git, Syncthing).
- **No existe una herramienta web ligera** que combine Markdown + offline + sin cuenta.
- **Las apps cloud violan su principio de privacidad**: Notion guarda todo en sus servidores, no controla sus datos.
- **Fragmentación técnica:** Tiene notas en archivos `.md` sueltos, en repos de Git, en la app de notas del celular.

### Necesidades

- Una herramienta que use **Markdown nativo** (no un editor WYSIWYG forzado).
- Que los datos se queden **en su dispositivo** (no en la nube de otro).
- En la formulación original, que funcionara **en el navegador**; tras el pivote, esta necesidad se cubre primero en Android y la expansión cross-platform queda como posibilidad futura.
- Poder exportar sus notas y eventualmente importar contenido local (no quedar atrapado en un formato propietario).

### Cita sintética del arquetipo

> *"Solo quiero un lugar donde escribir en Markdown que funcione offline y no me pida crear una cuenta. ¿Es mucho pedir?"*

---

## Persona 3 — Prof. Ramos (el docente evaluador)

| Campo | Detalle |
|---|---|
| **Nombre** | Carlos Ramos |
| **Edad** | 45 años |
| **Rol** | Profesor de Sistemas en una institución terciaria |
| **Dispositivos** | Notebook Windows, celular Android |
| **Nivel técnico** | Medio — usa planillas y editores de texto, no herramientas de desarrollo |

### Contexto

El Prof. Ramos evalúa proyectos de alumnos como parte de materias de práctica profesional. Necesita entender rápidamente qué hace el proyecto, acceder a un artefacto instalable con instrucciones claras y verificar que el alumno documentó sus decisiones.

### Frustraciones

- **Proyectos de alumnos que no se pueden probar fácilmente.** Si necesita instalar Node, clonar un repo y compilar, ya pierde interés.
- **READMEs vacíos o genéricos** que no explican el propósito del proyecto.
- **Falta de documentación de proceso:** quiere ver no solo el resultado, sino cómo se llegó ahí.

### Necesidades

- Poder obtener y probar la app desde un **artefacto publicado**, con instalación e integridad documentadas.
- Documentación clara que demuestre **proceso de ingeniería**, no solo código.
- Evidencia de que el alumno **pensó en el usuario**, no solo en la tecnología.

### Cita sintética del arquetipo

> *"No me importa si usaste React o Vanilla JS. Lo que quiero ver es que pensaste en quién va a usar esto y por qué tu solución es la adecuada."*

---

## Mapa de empatía consolidado

|  | Lucía (organizada) | Martín (práctico) | Prof. Ramos (evaluador) |
|---|---|---|---|
| **Piensa** | "Necesito orden en mis apuntes" | "Quiero control sobre mis datos" | "¿Este proyecto tiene sustancia?" |
| **Siente** | Frustración por la fragmentación | Rechazo a las herramientas cloud | Fatiga al evaluar proyectos superficiales |
| **Hace** | Se envía notas por WhatsApp | Configura stacks complejos | Lee README primero, prueba después |
| **Necesita** | Simplicidad, acceso offline, velocidad | Markdown, privacidad, portabilidad | Facilidad de prueba, documentación |

---

## Impacto en las decisiones de diseño

| Necesidad detectada | Decisión de diseño en Lumapse | ADR relacionado |
|---|---|---|
| Funcionar sin internet | Assets dentro del APK y persistencia SQLite local | [ADR-005](../adr/ADR-005-pivote-app-nativa.md), [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) |
| No requerir cuenta | Almacenamiento local sin backend ni sincronización automática | [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md) |
| Ser liviana y responder en dispositivos modestos | Vanilla JS sin framework y presupuesto automatizado de bundle | [ADR-001](../adr/ADR-001-stack-tecnologico.md) |
| Soporte Markdown | Editor Markdown, preview seguro y herramientas opcionales de formato | [RF-010, RF-011 y RF-028](./requisitos-funcionales.md) |
| Priorizar el dispositivo principal del público | Interfaz mobile-first y distribución como APK Android | [ADR-005](../adr/ADR-005-pivote-app-nativa.md) |
| Fácil de probar/evaluar | APK firmada publicada con versión, hash y checklist de validación | [Informe del Hito 05](../hitos/hito-05-septiembre.md) |

---

> **Nota metodológica:** Estas personas fueron construidas a partir de la experiencia directa del autor como estudiante de la misma institución, observación y conversaciones informales. El relevamiento posterior de 120 respuestas respaldó el contexto mobile-first y offline-first, pero no reemplaza una validación directa de los arquetipos usando el prototipo. Esa instancia y los ajustes resultantes quedan registrados como trabajo del Hito 06.

---

*Documento de la fase Empatizar · Design Thinking · Lumapse · PP3 · 2026*
