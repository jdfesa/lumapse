# Guía de Contribución — Lumapse

¡Gracias por tu interés en contribuir a Lumapse! 

Aunque este es un proyecto nacido en el marco académico (Prácticas Profesionalizantes III - IES 6023), está estructurado bajo estándares profesionales de la industria. Para mantener la calidad, consistencia y trazabilidad del código, te pedimos que sigas estas directrices.

## 1. Trazabilidad Estricta (El "Por qué")

Lumapse no acepta código que no tenga justificación en la documentación. Todo cambio significativo debe trazarse hacia un requisito o decisión:

- Si agregás una funcionalidad, debe responder a un **Requisito Funcional (RF)** o **Historia de Usuario (HU)** definidos en `docs/producto/`.
- Si cambiás la arquitectura o herramientas, debe existir un **Architecture Decision Record (ADR)** previo en `docs/adr/`.
- Antes de escribir código, asegurate de que la documentación refleje el cambio. Si no es así, tu contribución debe incluir primero la actualización de los `.md`.

## 2. Flujo de Trabajo (Ramas)

No hacemos commits directamente a la rama `main`. El flujo esperado es:

1. Basate siempre en la rama `main` actualizada.
2. Creá una rama descriptiva para tu tarea:
   - Funcionalidades: `feat/nombre-de-la-tarea`
   - Correcciones de errores: `fix/nombre-del-error`
   - Cambios de documentación: `docs/nombre-del-documento`
3. Desarrollá y probá localmente.

## 3. Estándar de Commits (Conventional Commits)

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial legible que permita automatizar el versionado.

**Formato requerido:**
`<tipo>: <descripción breve en minúsculas>`

**Tipos permitidos:**
- `feat:` Nueva funcionalidad para el usuario.
- `fix:` Solución a un error (bug).
- `docs:` Cambios exclusivos en la documentación (ej: `docs: actualizar adr-005`).
- `style:` Formateo, punto y coma faltante, etc. (sin cambios lógicos).
- `refactor:` Refactorización de código que no agrega funcionalidad ni arregla bugs.
- `test:` Agregar o corregir tests.
- `chore:` Tareas de mantenimiento (actualizar dependencias, `.gitignore`, etc.).

## 4. Estilo de Código y Arquitectura

- **Vanilla JS:** Lumapse está construido intencionalmente sin frameworks pesados (React, Vue) para garantizar velocidad y bajo peso. No incluyas librerías a menos que estén rigurosamente justificadas en un ADR.
- **Offline-first:** Cualquier funcionalidad nueva debe contemplar cómo se comporta sin conexión a internet. Los datos del usuario nunca deben salir del dispositivo (solo SQLite local).

## 5. Proceso de Pull Request (PR)

Antes de abrir o fusionar un Pull Request, verificá:
- [ ] Tu código no rompe la compilación (`npm run build`).
- [ ] Actualizaste el archivo `CHANGELOG.md` con tus cambios bajo la sección *[Unreleased]*.
- [ ] Resolviste los posibles conflictos con `main`.
- [ ] El título del PR utiliza Conventional Commits.

---
*Lumapse: Tus notas. En tu equipo. Sin cuenta. Sin internet.*
