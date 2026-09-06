# Cheat Sheet de Defensa — Lumapse
**Última actualización:** 2026-09-05 — publicación y línea base de la segunda beta

> Hito 05 está cerrado y Hito 06 activo. Este documento refleja el corte operativo `v0.5.0`; las métricas de usuario y RNF pendientes deben recibir una última verificación al congelar la entrega académica.

## Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Versión beta vigente | `0.5.0` (`versionCode 500`) |
| Hito actual | 06 — Entrega Final |
| Release publicada | [`Lumapse v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) |
| Tag / commit | `v0.5.0` / `5840755` |
| APK firmado | `lumapse-v0.5.0.apk` |
| SHA-256 del APK | `d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884` |
| Validación Android | Build equivalente `0.5.0/500` aprobado en Samsung `SM_G965F` con datos conservados; instalación del asset firmado pendiente |
| Tests del corte | 67 archivos / 1065 tests; gate local y CI de PR #10 aprobados |
| Archivos de código (JS/TS/CSS) | 129 en `src/` al tag `v0.5.0` |
| Líneas de código fuente | 19.648 en `src/` al tag `v0.5.0` |
| Requisitos Funcionales | 28 (22 implementados/verificados, 0 pendientes, 4 postergados, 2 obsoletos) |
| Historias de Usuario | 22 |
| Story Points totales formalizados | 104: 101 entregados en Hitos 02 a 05 y 3 postergados a Futuro |
| ADRs documentados | 9 |
| Scripts de automatización | 40 archivos `.py`/`.sh` en `scripts/` |
| Tablas en BD | 4 |
| Columnas totales | 26 |

## Decisiones Técnicas Clave

| Decisión | Justificación corta |
|---|---|
| ADR-009 — Propiedad Transaccional Explícita en SQLite | Serializar el acceso a una conexión, propagar capacidades transaccionales y recuperar el arranque sin confirmar escrituras parciales ni recrear datos del usuario. |
| ADR-008 — Arquitectura Modular por Capas y Patrones de Coordinación | Describir el producto real como monolito modular cliente, offline-first y por capas pragmáticas, sin atribuir MVC o Clean Architecture estrictos. |
| ADR-006 — Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Adoptar una arquitectura híbrida de persistencia y automatización de assets para desarrollo local y producción nativa |
| ADR-005 — Pivote de PWA a Aplicación Android Híbrida (APK) | Empaquetar la UI web en una WebView Android mediante Capacitor, usar plugins nativos donde aportan valor y reemplazar IndexedDB por SQLite. |
| DP-003 — Mobile-first | Mobile-first. La interfaz se diseña y optimiza primero para pantallas de celular, con adaptación posterior a pantallas más grandes si el tiempo lo permite. |
| DP-004 — Estructura de Información Opinionada — Materia › Sección › Nota | Implementar una estructura de información predefinida y opinionada con exactamente 3 secciones fijas en la navegación principal y máximo 2 niveles de carpetas creadas por el usuario |
| DP-006 — Ayuda Contextual sin Fricción | Postergar onboarding, contador, indicador global online/offline y guía Markdown para evitar ruido visual; el backup conserva feedback contextual de conectividad dentro de su flujo. |
| DP-001 — Política de título flexible | Priorizar el título explícito y usar un H1 inicial como fallback, sin duplicarlo en la presentación. |
| ADR-007 — Organización por feature folders | Ordenar componentes UI por dominio funcional para mejorar mantenibilidad sin migrar todavía a otro framework. |

## ADRs

| # | Título | Estado |
|---|---|---|
| ADR-001 | Elección del Stack Tecnológico | Aceptado |
| ADR-002 | Estrategia de Persistencia Offline (IndexedDB) | Superseded por ADR-005 |
| ADR-003 | Enfoque de Desarrollo y Gestión del Flujo — Kanban Adaptado | Aceptado, revisado |
| ADR-004 | Estructura de Carpetas del Proyecto | Aceptado |
| ADR-005 | Pivote de PWA a Aplicación Android Híbrida con Capacitor (APK) | Aceptado |
| ADR-006 | Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Aceptado |
| ADR-007 | Organización de Componentes por Feature | Aceptado |
| ADR-008 | Arquitectura Modular por Capas y Patrones de Coordinación | Aceptado |
| ADR-009 | Propiedad Transaccional Explícita en SQLite | Aceptado; integrado y publicado en `v0.5.0` |

## Releases y Cortes Documentales

| Referencia | Tipo | Fecha | Highlights |
|---|---|---|---|
| `v0.5.0` | GitHub pre-release | 2026-09-05 | Segunda beta firmada; AUD-001 a AUD-007, mejoras táctiles, 1065 tests y hash documentado |
| `v0.4.8` | GitHub pre-release | 2026-07-01 | APK firmada, hash documentado, quality gate y validación Android inicial |
| `0.4.0`–`0.4.7` | Cortes documentales | 2026-05-17 a 2026-05-26 | Lotes incrementales de Organización y UX; no tuvieron tags/releases individuales |
| `LB-PROD-v0.3.0` | Línea base Hito 04 | 2026-06-01 | SQLite, organización, UX móvil, papelera y estabilización |
| `LB-PROD-v0.2.0` | Línea base Hito 03 | Target del 2026-05-05 | Markdown, modos de edición/lectura y soporte offline original |
| `LB-PROD-v0.1.0` | Línea base Hito 02 | Target del 2026-05-03 | Editor, store y persistencia local inicial |

Los meses de Hitos 02 a 06 son etiquetas del calendario académico planificado; no equivalen por sí solos a fechas de publicación Git.

## Preguntas Frecuentes del Tribunal

- **¿Qué metodología o enfoque usa Lumapse?** → Un enfoque ágil, iterativo e incremental con gestión del flujo basada en Kanban y adaptada a un proyecto individual. El flujo es `Backlog → En Curso → En Revisión → Hecho`, con sistema pull y WIP máximo de dos elementos activos entre `En Curso` y `En Revisión`. Los hitos son cortes académicos y de entrega, no Sprints.
- **¿Una sola persona podría utilizar Scrum?** → La Scrum Guide 2020 no fija un mínimo numérico y dice que el Scrum Team tiene típicamente diez personas o menos. Por eso no se descarta Scrum mediante una prohibición por tamaño. Sin embargo, aplicar Scrum exige su framework completo: responsabilidades, Sprints, eventos, artefactos y compromisos. Lumapse no trabajó así; adoptar algunas técnicas o simular roles no lo convertiría en Scrum.
- **¿De dónde salió el rango de 3 a 9?** → De la Scrum Guide 2017, que lo discutía para el *Development Team*; Product Owner y Scrum Master no se incluían en ese conteo salvo que también ejecutaran trabajo del Sprint Backlog. La edición 2020 reorganizó el concepto alrededor de un Scrum Team típicamente de diez personas o menos. El argumento vigente no depende de ninguno de esos números.
- **¿Por qué no RUP si hay requisitos, casos de uso y UML?** → Porque esos artefactos también pueden usarse fuera de RUP. El proyecto no se gestionó mediante las fases Inicio, Elaboración, Construcción y Transición ni mediante sus disciplinas y roles formales.
- **¿Se aplicó Kanban de forma completa?** → Se aplicaron durante el desarrollo visualización, priorización continua, WIP e inspección por hitos. No existe un conjunto histórico completo de tiempos de ciclo y *throughput*, por lo que se dice “Kanban adaptado” y no se inventa conformidad retroactiva. Hito 06 formalizó la Definition of Workflow, SLE y métricas mínimas.
- **¿Qué arquitectura usa Lumapse?** → Un monolito modular cliente, offline-first, con capas pragmáticas y UI organizada por feature. Se entrega como una unidad Android híbrida; no es MVC estricto, Clean Architecture completa ni microservicios.
- **¿Lumapse tiene backend?** → No tiene backend remoto o server-side: no existe API propia, servidor desplegado ni base remota. Sí tiene lógica de aplicación, servicios, store y acceso a datos, pero todo corre dentro del cliente Android. SQLite es una base embebida, Capacitor es el contenedor/puente nativo y Vite solo sirve el entorno de desarrollo.
- **¿Qué patrones pueden demostrarse?** → Aplicados: Composition Root, Observer/Publish-Subscribe, Service Layer, Adapter e inyección explícita en servicios seleccionados. Parciales o inspirados: fachada modular/barrel, Data Access similar a Repository, Command Registry, Strategy/Policy funcional y enfoque Component. ADR-008 contiene el inventario canónico y sus límites.
- **¿Los patrones aparecieron por el refactor a TypeScript?** → No. El refactor hizo más explícitos contratos y dependencias que ya eran observables; los patrones se justifican por responsabilidades y relaciones reales, no por la extensión del archivo.
- **¿Por qué no usás tags como eje principal?** → DP-002 y DP-004: el 69.2% prefiere carpetas por materia (P11), y la estructura Materia › Sección › Nota reduce decisiones en mobile.
- **¿Por qué guardás el título además del contenido?** → DP-001: el título puede ser explícito y no es siempre derivable del cuerpo. Persistirlo da un contrato claro para listado, búsqueda y backup. Existe un ensayo sintético de 5.000 notas que compara lectura con parseo, pero no se presenta como medición de CPU Android ni como porcentaje universal.
- **¿Por qué no hay `ON UPDATE` en las FKs?** → Sección 4 del DDL: las PK son UUID v4 generadas en cliente e inmutables por diseño.
- **¿Por qué Capacitor sobre PWA pura?** → ADR-005: permite conservar la UI web, distribuir un APK Android, integrar plugins nativos y usar SQLite. Es una arquitectura híbrida, no una reescritura de la interfaz en Kotlin.
- **¿Por qué SQLite sobre IndexedDB?** → ADR-006: modelo relacional, FKs, consultas consistentes y tooling web/native unificado.
- **¿Por qué no agregaste contador de palabras?** → RF-006 quedó postergado: Lumapse prioriza captura rápida. Si estudiantes reales lo piden, se puede sumar como metadato sutil calculado en UI.
- **¿Por qué no mostrás online/offline?** → RF-024 quedó postergado porque el núcleo local no depende de la red y un chip global podría sugerir una sincronización inexistente. El backup sí informa de manera contextual y únicamente dentro de su flujo cuando la conectividad afecta la salida externa.
- **¿Por qué no hay onboarding o tutorial Markdown?** → DP-006: la beta no registró un bloqueo de descubrimiento que justificara un tutorial obligatorio. Lumapse permite escribir texto plano; Markdown es una mejora, no una barrera de entrada.
- **¿Export/import está implementado?** → Sí para backups de workspace: `RF-017` exporta un `.zip` legible/restaurable con salida externa y `RF-018` importa ZIPs generados por Lumapse con preview, transacción y duplicados no destructivos. Sigue postergado `RF-016`, que es compartir/exportar una nota individual, y también la importación `.md` de una nota suelta.
- **¿La APK ya está disponible?** → Sí. `lumapse-v0.5.0.apk` se publicó como pre-release con firma v2 y SHA-256 verificable. Un build equivalente `0.5.0/500` fue validado en Android conservando datos; la instalación manual específica del asset firmado sigue registrada como pendiente y no se oculta.
- **¿Qué ocurrió con `0.4.9`?** → No se publicó. El trabajo posterior a `v0.4.8` se consolidó directamente en la segunda beta `v0.5.0`, con tag, APK y hash propios. `v0.4.8` se conserva como evidencia histórica inmutable.
- **¿Qué queda antes de defender?** → Revisión editorial y de maquetación final —incluida la legibilidad de los gráficos DB ya incorporados—, matriz RNF, instalación manual del asset firmado, rendimiento con volumen realista y preparación de presentación, demo y contingencia. La fricción de `Mover a` ya fue corregida y validada en PR #9.

## Fuentes

- `docs/producto/requisitos-funcionales.md`
- `docs/producto/historias-de-usuario.md`
- `docs/producto/decisiones-producto.md`
- `docs/adr/`
- `CHANGELOG.md`
- `docs/gestion/checklist-validacion-android.md`
- `docs/gestion/definicion-flujo-kanban.md`
- `docs/gestion/lineas-base.md`
- `docs/diagramas/database/04-modelo-fisico-ddl.md`
- `src/`
- `scripts/`
