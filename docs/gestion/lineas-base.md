# Líneas Base (Baselines) — Lumapse

> **Proyecto:** Lumapse  
> **Referencia:** Gómez, J. (2014), Sección 6. Guía de Estudio PP3 (Ing. Mauricio Parada, 2026).  
> **Fecha de creación:** 2026-05-15  
> **Autor:** José David Sandoval

---

## 1. ¿Qué es una línea base?

Una **línea base** (baseline) es una versión congelada y formalmente aprobada de un
artefacto del proyecto que sirve como referencia estable para medir el avance y
gestionar los cambios (Gómez, 2014, §6.1).

> Establecer una línea base es el acto que convierte un borrador en un compromiso.

En Git, las líneas base se implementan mediante **tags anotados**: punteros permanentes
a un commit específico que marca un hito del proyecto. A diferencia de una rama, un tag
no avanza: siempre apunta al mismo commit.

---

## 2. Tipos de línea base del proyecto

| Tipo | Prefijo del tag | Pregunta que responde | Momento de creación |
|---|---|---|---|
| **LB de Requerimientos** | `LB-REQ-` | ¿QUÉ hará el sistema? | Al aprobar los requisitos |
| **LB del Producto** | `LB-PROD-` | ¿QUÉ se entregó funcionando? | Al cierre de cada hito |

> **Nota:** Gómez (2014) también define LB de Diseño y LB del Plan. En Lumapse, los
> diagramas UML evolucionan con el código (documentos vivos) y el plan se registra en
> los informes de hito, por lo que no se congelan como tags separados.

---

## 3. Registro de líneas base creadas

### LB-REQ-v1.0 — Línea Base de Requerimientos

| Campo | Detalle |
|---|---|
| **Tag Git** | `LBREQ-v1.0` |
| **Commit** | `1512037` |
| **Fecha del commit** | 2026-04-24 |
| **Fecha del tag** | 2026-04-24 |
| **Hito** | 01 — Fundación |
| **Descripción** | Conjunto de requerimientos aprobados sobre los que se desarrolla el proyecto. |

**Artefactos congelados en esta línea base:**

- `docs/producto/requisitos-funcionales.md` — 24 RF con priorización MoSCoW
- `docs/producto/requisitos-no-funcionales.md` — 26 RNF con métricas ISO 25010
- `docs/producto/historias-de-usuario.md` — 6 HU, 20 CA (Hito 02)
- `docs/producto/personas.md` — 3 personas de usuario
- `docs/producto/problem-statement.md` — Declaración POV del problema
- `docs/producto/analisis-competitivo.md` — Matriz de 10 competidores
- `docs/diagramas/casos-de-uso.md` — 15 UC, 3 actores
- `docs/diagramas/modelo-dominio.md` — Entidades del dominio
- `docs/diagramas/secuencia-crear-nota.md` — Flujos principales

**Comando de verificación:**
```bash
git show LBREQ-v1.0 --no-patch
```

---

### LB-PROD-v0.1.0 — Línea Base del Producto (Hito 02)

| Campo | Detalle |
|---|---|
| **Tag Git** | `LB-PROD-v0.1.0` |
| **Commit** | `398de1d` |
| **Fecha del commit** | *(cierre del Hito 02)* |
| **Fecha del tag** | 2026-05-15 (creado retrospectivamente) |
| **Hito** | 02 — Core del Editor |
| **Descripción** | Primera versión funcional del editor de notas con persistencia local. |

**Funcionalidades incluidas en esta línea base:**

- `NoteService` — Capa de persistencia CRUD con IndexedDB
- `NoteStore` — Gestor de estado reactivo (patrón Observer)
- `NoteList` — Componente de listado de notas
- `NoteEditor` — Editor de título y contenido
- Auto-guardado con debounce (800ms), luego supersedido por la revisión de `RF-005`
- Eliminación con confirmación de seguridad

**RF completados según línea base original:** RF-001 a RF-005, RF-007 (6 de 24)  
**Story Points entregados según línea base original:** 20 SP  
**Story Points normalizados vigentes:** 15 SP

> **Nota de revisión 2026-06-07:** `RF-005` dejó de contarse como auto-guardado final silencioso del Hito 02. La necesidad se mantiene, pero la solución verificada se formaliza en Hito 05 como borrador persistente del editor.

---

### LB-PROD-v0.2.0 — Línea Base del Producto (Hito 03)

| Campo | Detalle |
|---|---|
| **Tag Git** | `LB-PROD-v0.2.0` |
| **Commit** | `1f87f5c` |
| **Fecha del commit** | *(cierre del Hito 03)* |
| **Fecha del tag** | 2026-05-15 (creado retrospectivamente) |
| **Hito** | 03 — MVP Completo |
| **Descripción** | Producto Mínimo Viable original: editor con Markdown, base técnica de export/import y PWA offline. |

**Funcionalidades añadidas respecto de LB-PROD-v0.1.0:**

- `MarkdownService` — Renderizado de Markdown a HTML (marked + DOMPurify)
- `MarkdownPreview` — Vista previa en tiempo real
- Toggle de modos: Edición / Dividido / Lectura
- `ExportService` / `ImportService` — Base técnica inicial de portabilidad local
- Service Worker + PWA instalable (vite-plugin-pwa)

**RF completados acumulados según línea base original:** RF-001 a RF-005, RF-007 a RF-012, RF-016 a RF-018, RF-021 (15 de 24)

> **Nota de revisión 2026-06-01:** tras el pivote mobile-first/SQLite, `RF-016`, `RF-017` y `RF-018` dejaron de contarse como implementados visibles porque la UI actual no exponía exportación/importación. `RF-017` fue reabierto y completado luego en Hito 05 como backup manual `.zip`; `RF-016` y `RF-018` siguen como deuda posterior.

---

### LB-PROD-v0.3.0 — Línea Base del Producto (Hito 04)

| Campo | Detalle |
|---|---|
| **Tag Git** | `LB-PROD-v0.3.0` |
| **Commit** | `b7f76df` |
| **Fecha del commit** | 2026-06-01 |
| **Fecha del tag** | 2026-06-25 (creado retrospectivamente) |
| **Hito** | 04 — Organización y UX |
| **Descripción** | Cierre formal del bloque de organización, UX móvil, persistencia SQLite y estabilización inicial. |

**Funcionalidades añadidas respecto de LB-PROD-v0.2.0:**

- Pivote formal a app nativa con Capacitor + SQLite, fundamentado en `ADR-005` y `ADR-006`.
- Organización por materias y secciones, con navegación mobile-first en drawer.
- Búsqueda global normalizada, notas fijadas/archivadas y estados académicos.
- Tema claro/oscuro persistente con tokens CSS.
- Papelera con soft-delete, restauración y cascadas transaccionales.
- Fechas académicas discretas como recordatorios pasivos, sin agenda completa ni notificaciones.
- Quality gate local, suite Vitest, auditorías de trazabilidad/schema/links y CI ampliado.
- Cierre de alcance con postergación explícita de onboarding, contador permanente e indicador online/offline.

**Comando de verificación:**
```bash
git show LB-PROD-v0.3.0 --no-patch
```

---

## 4. Gestión de cambios respecto de la línea base

Una vez establecida una LB, todo cambio en el alcance debe pasar por un proceso formal
(Gómez, 2014, §6.4):

1. El desarrollador detecta la necesidad de modificar un requerimiento o agregar funcionalidad.
2. Se analiza el impacto: ¿cuántos SP adicionales implica? ¿qué otras partes del sistema se ven afectadas?
3. El docente aprueba o rechaza el cambio.
4. Si se aprueba, se actualiza el documento de requisitos y el cronograma.
5. Si el cambio es significativo, se crea una nueva línea base (ej. `LB-REQ-v2.0`).

### Cambios formales registrados

| Fecha | Cambio | Impacto | Línea base afectada | Referencia |
|---|---|---|---|---|
| 2026-05-14 | Pivote de PWA a app nativa (Capacitor + SQLite) | Alto — cambia la arquitectura de persistencia y distribución | LB-REQ-v1.0 (RF-007, RF-008, RF-009 impactados) | [ADR-005](../adr/ADR-005-pivote-app-nativa.md) |
| 2026-06-05 | Normalización de mejoras funcionales de Hito 05 (`RF-017`, `RF-027`, `RF-028`) | Medio — registra backup manual, fechas discretas y editor enriquecido como alcance aprobado antes de release | LB-REQ-v1.0 (alcance extendido y trazabilidad actualizada) | [CHANGELOG](../../CHANGELOG.md), [Hito 05](../hitos/hito-05-septiembre.md) |
| 2026-06-07 | Reclasificación de `RF-005 / HU-005` como borradores persistentes del editor | Medio — reemplaza auto-guardado final silencioso por protección local del trabajo en curso, sin crear ni actualizar notas finales sin confirmación | LB-REQ-v1.0 (criterio funcional refinado y trazabilidad actualizada) | [CHANGELOG](../../CHANGELOG.md), [Requisitos funcionales](../producto/requisitos-funcionales.md) |

> **Nota:** El pivote a app nativa fue el cambio más significativo respecto de la LB de
> requerimientos original. Fue documentado como ADR-005, fundamentado en evidencia
> empírica de 120 estudiantes, y aprobado formalmente antes de la implementación.

---

## 5. Próximas líneas base previstas

| Tag | Hito | Momento esperado | Contenido |
|---|---|---|---|
| `LB-PROD-v1.0.0` | 05 — Testing y Distribución | Septiembre 2026 | APK firmado, tests, release pública |

---

> **Referencia:** Gómez, J. (2014). *Guía Práctica de Estimación y Medición de Proyectos
> Software*, Sección 6: Línea base y repositorio GitHub.
