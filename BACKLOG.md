# Backlog y Deuda Técnica — Lumapse

Este documento funciona como una bandeja de entrada local para las tareas, mejoras y deuda técnica identificadas durante el desarrollo o en auditorías. Una vez que se inicia un Hito, las tareas relevantes de aquí se planifican y ejecutan.

## 📝 Documentación y Diseño
- [ ] **Historias de Usuario (Hitos 03 y 04):** Redactar las HU faltantes para renderizado Markdown, exportación/importación, y estructura por materias *(Ref: Auditoría 2026-05-14)*.
- [ ] **Actualizar Modelo de Dominio y Casos de Uso:** Revisar `modelo-dominio.md` y `casos-de-uso.md` para reflejar el pivote de etiquetas a carpetas por materia (DP-002) y eliminar referencias obsoletas a PWA/SW.

## 💻 Código y Arquitectura
- [ ] **Seguridad (XSS en Markdown):** Revisar la configuración de DOMPurify en `MarkdownService.js`. Actualmente permite `img src`, lo que podría generar peticiones externas no deseadas.
- [ ] **Offline estricto (Google Fonts):** Eliminar el `@import` remoto de Google Fonts en `main.css`. Descargar las fuentes y servirlas localmente para garantizar el 100% de funcionamiento offline (RNF-009).
- [x] **Assets Manifest:** Agregar los íconos requeridos (`icon-192.png`, `icon-512.png`) en `public/icons/` para cumplir con las validaciones del `manifest.json`.
- [ ] **Deuda Técnica (Menú Contextual):** Implementar las funcionalidades de "Archivar" y "Fijar (Pin)" notas, agregando la lógica correspondiente a los botones dentro del menú dropdown en `NoteList.js` y `NoteStore.js`.

## ⚙️ DevOps y Procesos
- [ ] **Templates de GitHub:** Actualizar las plantillas de Issues/PRs en la carpeta `.github/` para incluir campos obligatorios de trazabilidad (ej: "¿Qué RF/HU/ADR resuelve esto?").
