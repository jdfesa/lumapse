# Capítulo 1: Introducción y Planteo del Problema

## 1.1. Contexto del Proyecto

Lumapse es una aplicación móvil de captura, organización y recuperación de notas de estudio, desarrollada como proyecto integrador para la materia Prácticas Profesionalizantes III de la Tecnicatura en Análisis de Sistemas y Desarrollo de Software del IES 6023 "Dr. Alfredo Loutaif".

El proyecto surge a partir de una necesidad observada en el contexto académico local: los estudiantes requieren una herramienta simple, rápida y confiable para tomar apuntes durante la cursada, pero las alternativas disponibles suelen depender de conexión a internet, cuentas obligatorias, sincronización en la nube o interfaces pensadas para usuarios con mayor disponibilidad de recursos técnicos.

La primera definición del producto fue una aplicación web progresiva (PWA) con persistencia local. Sin embargo, el relevamiento realizado sobre estudiantes del IES 6023 evidenció que el celular es el dispositivo dominante y que la conectividad institucional es deficiente. Esta evidencia motivó el pivote a una aplicación móvil nativa empaquetada con Capacitor y persistencia SQLite, decisión documentada en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md).

Desde el punto de vista técnico, Lumapse combina tecnologías web modernas (Vite, JavaScript modular, CSS nativo), empaquetado Android mediante Capacitor, persistencia local con SQLite, renderizado Markdown seguro y automatización de calidad con GitHub Actions y scripts locales. Desde el punto de vista metodológico, el proyecto se apoya en Design Thinking, Lean UX, gestión incremental por hitos, documentación viva en Markdown y trazabilidad entre necesidades, requisitos, decisiones y código.

## 1.2. Planteo del Problema

El problema central no es la inexistencia de aplicaciones de notas, sino la ausencia de una solución que responda simultáneamente a las restricciones reales del público objetivo: estudiantes de nivel superior, con uso intensivo del celular, conectividad limitada, bajo margen para instalar herramientas pesadas y necesidad de capturar información rápidamente durante la clase.

El relevamiento de datos confirmó este diagnóstico. Sobre 120 respuestas válidas, el 88.3% de los estudiantes declaró tomar notas principalmente en cuaderno o papel; el 48.7% de quienes toman notas reconoció dificultades en su forma actual de trabajo; y las dificultades más repetidas fueron pérdida de notas y desorganización, ambas con 58.9% entre quienes reportaron problemas. Además, el 81.7% percibe conectividad deficiente en el instituto y el 72.5% usaría una app de notas desde el celular ([resultados del relevamiento](../producto/resultados-relevamiento.md)).

Las herramientas existentes cubren partes del problema, pero no el conjunto completo de restricciones. Google Keep y OneNote requieren cuentas y dependen de ecosistemas externos; Notion resulta potente pero pesado y orientado a flujos más complejos; Obsidian y Joplin son más cercanas a una filosofía local-first, pero pueden resultar técnicas o pesadas para el usuario promedio. Lumapse se posiciona en un espacio deliberadamente acotado: una app de notas académicas, offline-first, sin cuenta, ligera, local y centrada en el flujo real de estudiar.

## 1.3. Objetivos

### 1.3.1. Objetivo General

Desarrollar y documentar una aplicación móvil offline-first para que estudiantes de nivel superior puedan capturar, organizar y recuperar notas de estudio de forma rápida y confiable, utilizando evidencia empírica del público objetivo y prácticas profesionales de análisis, diseño, implementación, validación y documentación de software.

### 1.3.2. Objetivos Específicos

- Relevar necesidades, hábitos y problemas de estudiantes reales del IES 6023 mediante una encuesta estructurada.
- Analizar los datos obtenidos para validar o ajustar las hipótesis iniciales del producto.
- Definir personas de usuario, requisitos funcionales, requisitos no funcionales, historias de usuario y decisiones de producto trazables.
- Diseñar una arquitectura local-first que priorice funcionamiento offline, privacidad y persistencia robusta.
- Implementar un editor de notas con soporte Markdown, auto-guardado, búsqueda y organización por materias y secciones, dejando la portabilidad local de notas como decisión explícita de alcance.
- Migrar la persistencia desde IndexedDB hacia SQLite, de acuerdo con la evidencia recolectada y las decisiones arquitectónicas aprobadas.
- Empaquetar la aplicación como APK Android mediante Capacitor.
- Incorporar pruebas unitarias, validaciones documentales y un quality gate automatizado para sostener la calidad del código y la documentación.
- Mantener documentación viva y versionada que permita reconstruir el proceso de decisión, desarrollo y validación.

## 1.4. Justificación y Alcance

La justificación académica del proyecto reside en que Lumapse permite integrar de manera concreta los contenidos centrales de la carrera: análisis de usuarios, diseño de requisitos, modelado de dominio, arquitectura de software, desarrollo frontend, persistencia local, pruebas, automatización, control de versiones y documentación técnica. El proyecto no se limita a construir una interfaz funcional, sino que documenta las decisiones y evidencia la evolución del producto a través de hitos, ADRs, backlog, changelog y commits.

La justificación social y de producto se relaciona con el contexto de uso. El público objetivo no necesita una plataforma de productividad empresarial ni una base de conocimiento compleja; necesita una herramienta que abra rápido, funcione sin conexión, no exija una cuenta y respete la forma en que los estudiantes ya organizan su vida académica. Por eso, el alcance funcional prioriza la captura y recuperación de notas, la organización por materias, el guardado local y la simplicidad de uso.

El alcance actual incluye una app Android empaquetada con Capacitor, persistencia SQLite, editor Markdown, preview seguro, búsqueda, materias y secciones, archivo, papelera, tema claro/oscuro y automatización de calidad. La exportación/importación local conserva servicios base, pero no está expuesta como flujo de usuario en la UI actual. Para Hito 05 solo se toma el alcance mínimo de compartir/exportar una nota individual; backup `.zip` e importación quedan como trabajo futuro. Quedan fuera del alcance del MVP la sincronización en la nube, la colaboración en tiempo real, el backend multiusuario, la inteligencia artificial generativa y la publicación formal en tiendas de aplicaciones. Estas posibilidades se consideran trabajo futuro y solo deberían incorporarse si nueva evidencia de uso justifica ampliar el alcance.
