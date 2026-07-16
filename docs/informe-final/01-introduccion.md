# Capítulo 1: Introducción y Planteo del Problema

## 1.1. Contexto del Proyecto

Lumapse es una aplicación móvil de captura, organización y recuperación de notas de estudio, desarrollada como proyecto integrador para la materia Prácticas Profesionalizantes III de la Tecnicatura en Análisis de Sistemas y Desarrollo de Software del IES 6023 "Dr. Alfredo Loutaif".

El proyecto surge a partir de una necesidad observada en el contexto académico local: contar con una herramienta simple, rápida y confiable para tomar apuntes durante la cursada. Las alternativas existentes resuelven partes de esa necesidad, pero combinan de maneras diferentes cuentas, sincronización, complejidad funcional y almacenamiento local; Lumapse explora una combinación deliberadamente acotada para el contexto relevado.

La primera definición del producto fue una aplicación web progresiva (PWA) con persistencia local. El relevamiento realizado sobre estudiantes del IES 6023 respaldó dos prioridades: uso mobile-first y funcionamiento offline. La encuesta no comparó tecnologías de distribución; el paso a una aplicación Android empaquetada con Capacitor y persistencia SQLite se decidió después mediante el análisis técnico documentado en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

Desde el punto de vista técnico, Lumapse combina tecnologías web modernas (Vite, JavaScript modular y una adopción gradual de TypeScript, CSS nativo), empaquetado Android mediante Capacitor, persistencia local con SQLite, renderizado Markdown seguro y automatización de calidad con GitHub Actions y scripts locales. Desde el punto de vista metodológico, el proyecto se apoya en Design Thinking, Lean UX, gestión incremental por hitos, documentación viva en Markdown y trazabilidad entre necesidades, requisitos, decisiones y código.

## 1.2. Planteo del Problema

El problema central no es la inexistencia de aplicaciones de notas, sino explorar una solución acotada para el contexto relevado: estudiantes de nivel superior, prioridad declarada por el celular, disponibilidad de red no permanente y necesidad de capturar y organizar información sin agregar complejidad innecesaria. El peso tolerable de instalación y la velocidad real de captura siguen siendo hipótesis a validar con el prototipo.

El relevamiento de datos respaldó este diagnóstico dentro de la muestra. Sobre 120 respuestas válidas, el 88.3% declaró tomar notas principalmente en cuaderno o papel; el 48.7% de quienes toman notas reconoció dificultades en su forma actual de trabajo; y las dificultades más repetidas fueron pérdida de notas y desorganización, ambas con 58.9% entre quienes reportaron problemas. Además, el 81.7% eligió "A veces", "Raramente" o "Nunca" al responder por acceso estable a internet y el 72.5% usaría una app de notas desde el celular ([resultados del relevamiento](../producto/resultados-relevamiento.md)).

Las herramientas existentes cubren partes del problema, pero no el conjunto completo de restricciones. Google Keep y OneNote requieren cuentas y dependen de ecosistemas externos; Notion resulta potente pero pesado y orientado a flujos más complejos; Obsidian y Joplin son más cercanas a una filosofía local-first, pero pueden resultar técnicas o pesadas para el usuario promedio. Lumapse se posiciona en un espacio deliberadamente acotado: una app de notas académicas, offline-first, sin cuenta, ligera, local y centrada en el flujo real de estudiar.

## 1.3. Objetivos

### 1.3.1. Objetivo General

Desarrollar y documentar una aplicación móvil offline-first para que estudiantes de nivel superior puedan capturar, organizar y recuperar notas de estudio de forma rápida y confiable, utilizando evidencia empírica del público objetivo y prácticas profesionales de análisis, diseño, implementación, validación y documentación de software.

### 1.3.2. Objetivos Específicos

- Relevar necesidades, hábitos y problemas de estudiantes reales del IES 6023 mediante una encuesta estructurada.
- Analizar los datos obtenidos para validar o ajustar las hipótesis iniciales del producto.
- Definir personas de usuario, requisitos funcionales, requisitos no funcionales, historias de usuario y decisiones de producto trazables.
- Diseñar una arquitectura local-first que priorice funcionamiento offline, privacidad y persistencia robusta.
- Implementar un editor de notas con soporte Markdown, borradores persistentes, búsqueda y organización por materias y secciones, junto con un mecanismo manual de respaldo e importación local del espacio de trabajo.
- Migrar la persistencia desde IndexedDB hacia SQLite de acuerdo con las decisiones arquitectónicas aprobadas, preservando las prioridades mobile-first y offline-first respaldadas por el relevamiento.
- Empaquetar la aplicación como APK Android mediante Capacitor.
- Incorporar pruebas unitarias, validaciones documentales y un quality gate automatizado para sostener la calidad del código y la documentación.
- Mantener documentación viva y versionada que permita reconstruir el proceso de decisión, desarrollo y validación.

## 1.4. Justificación y Alcance

La justificación académica del proyecto reside en que Lumapse permite integrar de manera concreta los contenidos centrales de la carrera: análisis de usuarios, diseño de requisitos, modelado de dominio, arquitectura de software, desarrollo frontend, persistencia local, pruebas, automatización, control de versiones y documentación técnica. El proyecto no se limita a construir una interfaz funcional, sino que documenta las decisiones y evidencia la evolución del producto a través de hitos, ADRs, backlog, changelog y commits.

La justificación social y de producto se relaciona con el contexto de uso. La evidencia disponible sugiere valor en una alternativa que abra rápido, funcione sin conexión, no exija una cuenta y respete la organización académica por materias. Por eso, el alcance funcional prioriza captura y recuperación de notas, guardado local y simplicidad, sin asumir que deba reemplazar a todas las herramientas generalistas.

El alcance verificado en la beta controlada `v0.4.8` incluye una app Android empaquetada con Capacitor, persistencia SQLite, editor Markdown con comandos opcionales y borradores persistentes, previsualización segura, búsqueda, materias y secciones, archivo, papelera, fechas académicas discretas, tema claro/oscuro, sección Acerca de y automatización de calidad. También incorpora un flujo manual de respaldo `.zip` mediante el selector o la hoja de compartir del sistema y una importación no destructiva de respaldos generados por Lumapse, con validación previa y escritura transaccional.

Compartir una nota individual continúa fuera del alcance actual: solo se retomará si utiliza la hoja de compartir nativa de Android y aporta una utilidad distinta de la acción Copiar. También quedan fuera del MVP la sincronización automática en la nube, la colaboración en tiempo real, el backend multiusuario, la inteligencia artificial generativa y la publicación formal en tiendas de aplicaciones. Estas posibilidades se mantienen como trabajo futuro y solo deberían incorporarse si nueva evidencia de uso justifica ampliar el alcance.
