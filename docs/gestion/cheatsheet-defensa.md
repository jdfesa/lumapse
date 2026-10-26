# Cheat Sheet de Defensa — Lumapse
**Última actualización:** 2026-10-26 — RC1 de presentación y métricas históricas separadas

> Hito 05 está cerrado y Hito 06 activo sólo para documentación y defensa. La RC1
> `v0.6.0` está publicada con validación parcial aceptada y desarrollo congelado.
> No transferir métricas o pruebas de un corte a otro. El
> [recorte vigente](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa) mantiene
> las comprobaciones restantes y CRUD/FPS diferidos, sin nuevas pruebas de app
> para completar el informe.

## Corte vigente de presentación

| Dato | Referencia comprobada |
|---|---|
| Versión/code | `0.6.0/600` — Release Candidate 1, no versión estable |
| Publicación | [Lumapse v0.6.0 — RC1](https://github.com/jdfesa/lumapse/releases/tag/v0.6.0), Pre-release del 2026-10-22 |
| Tag / fuente del APK | Tag sobre `ac2a747`; APK construida desde `bcefe6a`, limpia. No son el mismo identificador |
| Artefacto | `lumapse-v0.6.0.apk`, con checksum adjunto; [hash, firma y controles](./candidato-apk-0.6.0.md#binario-corregido) |
| Gate registrado del corregido | 79 archivos / 1214 tests de app y 105 de tooling; evidencia del corte, no una ejecución nueva |
| Validación Android | Actualización y conservación de datos en los recorridos identificados; cobertura parcial aceptada. No acredita los demás flujos del APK |
| ADR documentados actuales | 13; [índice y estado](../adr/README.md) |
| Manual | [Guía 0.6.0 publicada](https://jdfesa.github.io/lumapse/manual-de-usuario-lumapse.html), con revisión final pendiente |
| Informe y defensa | Capítulos/ensamblado aún en checkpoint `v0.5.0`; matriz, adaptación, maquetación y demo pendientes |

## Métricas históricas de la segunda beta (`v0.5.0`)

Los conteos siguientes se conservan como evidencia de ese tag, no como inventario
del repositorio actual.

| Métrica | Valor |
|---|---|
| Versión de este checkpoint | `0.5.0` (`versionCode 500`) |
| Hito del corte | 06 — Entrega Final |
| Release publicada | [`Lumapse v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) |
| Tag / commit | `v0.5.0` / `5840755` |
| APK firmado | `lumapse-v0.5.0.apk` |
| SHA-256 del APK | `d48338e04021a6096fcaeaced5fde411911d403c9ea95407891d2b034515a884` |
| Validación Android | Asset firmado/publicado `v0.5.0` aceptado por el autor en al menos tres dispositivos; [alcance general y límites](./checklist-validacion-android.md#aceptación-general-de-la-apk-publicada-v050), sin completar casos no reportados |
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
| ADR-013 — Despliegue sin desinstalación implícita | El instalador verifica firma y aborta ante incompatibilidad; no usa `cap run`/`native-run` ni borra como fallback. |
| ADR-012 — Borrador SQLite y guardado atómico | Captura sin debounce, migración legacy segura y nota/limpieza en una transacción; no garantiza la última tecla anterior al commit. |
| ADR-011 — Guardado confirmado y refresco | Un fallo de lectura posterior no convierte una escritura confirmada en fracaso ni invita a duplicarla. |
| ADR-010 — Gate y runtime canónicos | Node 22.20.0/npm 10.9.3 y la misma lista portable de controles local/CI. |
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
| ADR-002 | Estrategia de Persistencia Offline (IndexedDB) | Reemplazado por ADR-005/006 |
| ADR-003 | Enfoque de Desarrollo y Gestión del Flujo — Kanban Adaptado | Aceptado, revisado |
| ADR-004 | Estructura de Carpetas del Proyecto | Aceptado |
| ADR-005 | Pivote de PWA a Aplicación Android Híbrida con Capacitor (APK) | Aceptado |
| ADR-006 | Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Aceptado |
| ADR-007 | Organización de Componentes por Feature | Aceptado |
| ADR-008 | Arquitectura Modular por Capas y Patrones de Coordinación | Aceptado |
| ADR-009 | Propiedad Transaccional Explícita en SQLite | Aceptado; integrado y publicado en `v0.5.0` |
| ADR-010 | Gate portable y entorno canónico | Aceptado e integrado en PR #14 |
| ADR-011 | Límite entre guardado confirmado y refresco | Aceptado e integrado en PR #15 |
| ADR-012 | Borrador SQLite y guardado atómico | Aceptado; cierre de PR #29 aprobado |
| ADR-013 | Despliegue Android sin desinstalación implícita | Aceptado en PR #41 |

## Releases y Cortes Documentales

| Referencia | Tipo | Fecha | Highlights |
|---|---|---|---|
| `v0.6.0` | GitHub pre-release / RC1 | 2026-10-22 | APK de presentación publicado y congelado, validación parcial aceptada y comprobaciones restantes diferidas |
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
- **¿La APK ya está disponible?** → Sí. El corte de presentación es `lumapse-v0.6.0.apk`, publicado como Pre-release/RC1 con firma original y SHA-256 registrado. Fue aceptado con validación parcial: no se presenta como estable ni se transfieren las pruebas de otros debugs. `v0.5.0` se conserva como segunda beta histórica.
- **¿Qué ocurrió con `0.4.9`?** → No se publicó. El trabajo posterior a `v0.4.8` se consolidó directamente en la segunda beta `v0.5.0`, con tag, APK y hash propios. `v0.4.8` se conserva como evidencia histórica inmutable.
- **¿Qué queda antes de defender?** → Revisión final del manual 0.6.0 publicado, matriz RNF por artefacto, adaptación de capítulos, bibliografía, maquetación y demo/contingencia. La APK ya está publicada y congelada; no se recompila ni se completan pruebas de app ahora. CRUD/FPS y los recorridos restantes de la RC1 se declaran diferidos, no aprobados.
- **¿Cómo se presentan los límites de la beta?** → Separando lo comprobado por artefacto, lo pendiente, las limitaciones aceptadas y la deuda postdefensa. No se afirma que todos los RNF estén cumplidos, que haya estabilidad comercial o que personas reales ya utilicen la app; el plazo no sustituye evidencia.

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
