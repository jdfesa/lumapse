# Benchmark: usememos/memos

> **Fuente:** https://github.com/usememos/memos  
> **Licencia:** MIT  
> **Demo público:** https://demo.usememos.com/  
> **Versión analizada:** v0.28.0 (abril 2026)  
> **Fecha de análisis:** 2026-05-15  
> **Analista:** José David Sandoval  
> **Rol en la carpeta:** deep dive de la referencia inicial. Ver también el benchmark general en
> [`benchmark-open-source-notes-2026.md`](./benchmark-open-source-notes-2026.md).

---

## 0. Por qué este documento existe

Memos fue el primer producto open-source estudiado como referencia para Lumapse. Por eso tiene un
análisis propio: no porque sea una nota aislada, sino porque su filosofía de captura rápida, timeline,
tags y simplicidad visual ayudó a ordenar varias decisiones tempranas de UX.

Dentro de la carpeta de inspiración, este documento funciona como **deep dive**. La comparación contra
otras apps se mantiene en [`benchmark-open-source-notes-2026.md`](./benchmark-open-source-notes-2026.md),
donde Memos aparece junto a Joplin, Markor, Notesnook, Logseq, SiYuan, AppFlowy, Saber y Zettlr.

---

## 1. ¿Qué es memos?

Herramienta de captura de notas open-source, self-hosted, construida sobre la filosofía:

> *"Open, write, done — no folders to navigate."*

Sus principios fundacionales:

- **Captura instantánea** — UI tipo timeline/feed. Se abre, se escribe, se cierra.
- **Propiedad total del dato** — self-hosted, zero telemetría, datos en Markdown.
- **Simplicidad radical** — un binario Go de ~20MB, un comando para desplegar.
- **Open & extensible** — MIT, APIs REST y gRPC completas.

---

## 2. Stack técnico

### Backend
- **Lenguaje:** Go (55.4% del repo)
- **Framework HTTP:** Echo v5
- **API:** REST + gRPC (ConnectRPC) + gRPC-Gateway
- **Base de datos:** SQLite (opción principal), MySQL, PostgreSQL
- **Auth:** JWT
- **Storage adicional:** AWS S3

### Frontend
- **Lenguaje:** TypeScript (43.9% del repo)
- **Framework UI:** React 19
- **Build:** Vite 8
- **Estilos:** TailwindCSS v4 + Radix UI + Emotion
- **State:** TanStack Query v5
- **Markdown:** react-markdown + remark-gfm + rehype + KaTeX + Mermaid
- **Búsqueda:** fuse.js (fuzzy search)
- **i18n:** i18next

---

## 3. Diferencias fundamentales con Lumapse

| Dimensión | memos | Lumapse |
|---|---|---|
| **Arquitectura** | Cliente-servidor (backend Go + frontend React) | Single-device: todo en el móvil, sin backend propio |
| **App nativa Android** | ❌ No existe | ✅ Objetivo central (ADR-005, Hito 05) |
| **Organización** | Timeline + tags (sin carpetas obligatorias) | Carpetas por materia (opinionado) + tags a futuro |
| **Audiencia** | Usuario general, hobbistas, diarios, microblogs | Estudiantes terciarios/universitarios argentinos |
| **Conectividad** | Requiere servidor accesible | Offline-first como prioridad (81.7% no respondió disponibilidad estable permanente en P6) |
| **Idioma** | Multi-idioma (i18n completo) | Español primero, inglés en fase posterior |
| **Complejidad** | App madura con 59k ⭐, 91 releases, multi-feature | MVP académico enfocado, ligero por diseño |

---

## 4. ¿Por qué memos es relevante como benchmark?

Memos define **qué debería ser** una buena app de notas en términos de UX/UI.
Lumapse aporta **lo que memos no tiene**: nativo, offline-first, académico, en español.

No se compite con memos. Se ocupa el hueco que memos deja: el estudiante con celular,
sin WiFi confiable, que necesita organizar apuntes por materia.

---

## 5. Uso legítimo del análisis

- ✅ Estudiar su demo (https://demo.usememos.com/) para patrones de interacción.
- ✅ Analizar capturas de su UI mobile para referencias de layout.
- ✅ Extraer ideas conceptuales de organización de datos y flujos de usuario.
- ❌ No copiar código (stack incompatible: Go + React ≠ Vanilla JS + Capacitor).
- ❌ No asumir que su UI mobile es "nativa" — es una SPA web responsive.

---

## 6. Referencia a ideas concretas

Ver [`ideas-ux-roadmap.md`](./ideas-ux-roadmap.md) para el desglose de ideas aplicables con horizonte
temporal (corto / mediano / largo plazo). Ver también
[`benchmark-open-source-notes-2026.md`](./benchmark-open-source-notes-2026.md) para ubicar a Memos
dentro del mapa general de referencias open-source.
