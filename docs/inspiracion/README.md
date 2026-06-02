# Inspiración y Benchmarking — Lumapse

Esta carpeta documenta el **análisis de productos de referencia externos** que se estudiaron
durante el desarrollo de Lumapse. Su propósito es dejar trazabilidad de:

- **De dónde vienen ciertas ideas de UX/UI o arquitectura.**
- **Qué está disponible para el corto, mediano y largo plazo.**
- **Qué decisiones adoptamos conscientemente vs. lo que descartamos.**

> ⚠️ **Ningún código de estos proyectos externos se copia en Lumapse.**
> Los documentos aquí son de referencia conceptual y de diseño, no de implementación directa.

---

## Índice

Los documentos se organizan en tres niveles:

1. **Benchmark general:** mapa comparativo de proyectos open-source.
2. **Deep dives:** análisis individual de proyectos especialmente relevantes.
3. **Roadmap de inspiración:** ideas accionables derivadas del benchmark.

| Documento | Rol | Proyecto(s) analizado(s) | Fecha |
|---|---|---|---|
| [`benchmark-open-source-notes-2026.md`](./benchmark-open-source-notes-2026.md) | Benchmark general | Memos, Joplin, Markor, Notesnook, Logseq, SiYuan, AppFlowy, Saber, Zettlr | 2026-06-02 |
| [`memos-benchmark.md`](./memos-benchmark.md) | Deep dive | usememos/memos (MIT) | 2026-05-15 |
| [`ideas-ux-roadmap.md`](./ideas-ux-roadmap.md) | Roadmap de inspiración | Ideas derivadas de Memos + benchmark general + criterio propio | 2026-05-15 |

---

## Cómo leer esta carpeta

El punto de entrada recomendado es [`benchmark-open-source-notes-2026.md`](./benchmark-open-source-notes-2026.md),
porque ahí se justifica por qué cada proyecto entra en el radar de Lumapse y qué tan riesgoso sería
traducir sus ideas al producto.

[`memos-benchmark.md`](./memos-benchmark.md) no es una nota aislada: es el primer análisis profundo
porque Memos fue la referencia inicial de captura rápida, timeline, tags y simplicidad UX. El benchmark
general lo mantiene dentro del mapa comparativo junto con las demás apps.

[`ideas-ux-roadmap.md`](./ideas-ux-roadmap.md) es la capa accionable: toma ideas de los benchmarks y
las ordena por horizonte temporal para decidir qué puede entrar en Lumapse sin saturarla.

---

## Criterio de inclusión

Se incluye un proyecto en el benchmark si:

1. Es **open source** con licencia conocida.
2. Se puede estudiar su UX/UI públicamente (demo o capturas).
3. Tiene **al menos una idea concreta aprovechable** para Lumapse.
4. La idea se registra con su **origen, posible implementación y horizonte temporal**.

Se crea un documento individual solo si el proyecto merece un **deep dive** por impacto directo en
Lumapse. Caso contrario, queda integrado en el benchmark general para evitar notas sueltas.
