# Anteproyecto — Lumapse

**Materia:** Práctica Profesionalizante III  
**Carrera:** Tecnicatura en Análisis de Sistemas y Desarrollo de Software  
**Institución:** IES 6023 'Dr. Alfredo Loutaif'  
**Autor:** José David Sandoval  
**Año:** 2026

> **Nota:** Este documento es la versión en Markdown del anteproyecto formal presentado. El documento original (PDF) se encuentra en la [carpeta de Dropbox del proyecto](https://www.dropbox.com/scl/fo/efl03t0ywteggi6dk3mvu/AGodfqlsy7t68P7atK_NqPg?rlkey=mk50fjx0wwb58jpn92ygqbrwp&st=jtv5846&dl=0), dentro de `02-definiendo-anteproyecto/`.

---

## 1. Identificación del Proyecto

| Campo | Detalle |
|---|---|
| **Título del Proyecto** | Lumapse |
| **Integrantes** | Sandoval, José David Fernando |
| **Organización / Cliente** | Proyecto de carácter académico orientado a la comunidad estudiantil del Instituto de Formación Superior N° 6023 y público general. |
| **Tipo de Proyecto** | Desarrollo de Software / Aplicación Web Progresiva |

---

## 2. Descripción del Proyecto

Un sistema de captura de notas y gestión de conocimiento minimalista, diseñado específicamente para ser rápido y funcionar sin conexión a internet. Resuelve la complejidad, la fricción y la dependencia de conectividad de las herramientas actuales.

---

## 3. Destinatarios

- **Usuarios directos:** Estudiantes de nivel superior y universitarios.
- **Beneficiarios indirectos:** Estudiante o profesional de cualquier ámbito que quiera tomar una nota rápida con fricción cero.
- **Contexto de uso:** Aulas, bibliotecas, transporte público (entornos donde la conexión a internet puede ser inestable o nula).

---

## 4. Fundamentación

- **Situación problemática detectada:** Las aplicaciones de notas actuales suelen requerir creación de cuentas, conexión permanente a internet o configuraciones complejas de autoalojamiento, lo que genera una barrera de entrada alta para el estudiante promedio.

- **Impacto esperado del proyecto:** Reducir drásticamente la fricción tecnológica al momento de capturar información, permitiendo al estudiante enfocarse en el contenido. Al ser una herramienta "offline-first", se garantiza la accesibilidad continua al conocimiento sin depender de infraestructura de red en las aulas o suscripciones pagas.

---

## 5. Justificación Técnica

- **Tecnologías / Lenguajes:** Tecnologías web estándar (ej. HTML/CSS/JavaScript o TypeScript) implementadas como PWA.

- **Base de datos / Almacenamiento:** IndexedDB para el motor de base de datos local en el navegador.

- **Justificación de la elección tecnológica:** El modelo PWA + IndexedDB garantiza cero costos de infraestructura, instalación sin fricción (sin pasar por tiendas de aplicaciones) y privacidad absoluta, ya que los datos nunca abandonan el dispositivo del usuario.

- **Herramientas de desarrollo:** VS Code como entorno de desarrollo principal, Git/GitHub para el control de versiones, y herramientas estándar de ecosistema frontend (como Vite) para el empaquetado de la PWA.

- **Metodología de trabajo:** Enfoque ágil e iterativo (adaptación de Kanban), centrado en la construcción rápida de un Producto Mínimo Viable (MVP) para validar la funcionalidad core antes de escalar características.

- **Viabilidad técnica:** Alta. El proyecto es completamente viable al eliminar la complejidad de la arquitectura cliente-servidor tradicional. Al apoyarse en las capacidades nativas del navegador (IndexedDB) y no requerir backend ni bases de datos en la nube, los riesgos de infraestructura, costos y despliegue son nulos para esta fase del proyecto.

> **Nota de Flexibilidad Tecnológica:** El stack y las herramientas propuestas representan la arquitectura inicial óptima para el MVP. Sin embargo, bajo un enfoque ágil, esta selección queda sujeta a revisión continua. Se reserva explícitamente la posibilidad de pivotar hacia tecnologías alternativas en caso de detectar bloqueos técnicos, limitaciones imprevistas en la persistencia local, o curvas de aprendizaje que comprometan los tiempos del proyecto.

---

## 6. Objetivos del Proyecto

### Objetivo General

Desarrollar e implementar "Lumapse", una Aplicación Web Progresiva (PWA) de gestión de conocimiento y captura de notas minimalista, diseñada para funcionar de manera autónoma y sin conexión a internet.

### Objetivos Específicos

1. Diseñar una interfaz de usuario minimalista ("cero fricción") que evite el síndrome del lienzo en blanco.
2. Integrar un editor de texto enriquecido con soporte fluido para sintaxis Markdown.
3. Implementar la persistencia de datos local a través de IndexedDB para garantizar el funcionamiento offline.
4. Desarrollar un mecanismo de exportación e importación manual (en formato JSON/Markdown) para la gestión de copias de seguridad.

---

## 7. Alcance del Sistema

### Funcionalidades previstas (MVP)

En esta primera versión (MVP), el sistema abarcará exclusivamente:

- Creación, edición y eliminación de notas rápidas.
- Soporte básico de renderizado Markdown.
- Guardado automático local en el dispositivo del usuario.
- Módulo de exportación/importación manual de la base de datos para respaldos.

---

*Documento presentado en el marco de Prácticas Profesionalizantes III · IES 6023 'Dr. Alfredo Loutaif' · 2026*
