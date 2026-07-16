# Cheat Sheet de Defensa — Lumapse
**Última actualización:** 2026-07-15

> Hito 05 está cerrado y Hito 06 activo. Este documento refleja el corte operativo `v0.4.8`; las métricas de código, capturas y argumentos deben recibir una última verificación al congelar la entrega.

## Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Versión beta vigente | `0.4.8` |
| Hito actual | 06 — Entrega Final |
| Release publicada | [`Lumapse v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8) |
| APK firmado | `lumapse-v0.4.8.apk` |
| SHA-256 del APK | `cad122d0329e1761816ac7ad07938673389c859a252d9cc63504359355db3d10` |
| Validación Android | Samsung Galaxy S20 FE (`SM-G780G`), Android 13, apto para beta controlada |
| Archivos de código (JS/TS/CSS) | 112 |
| Líneas de código fuente | 15,377 en `main` al 2026-07-15 |
| Requisitos Funcionales | 28 (22 implementados/verificados, 0 pendientes, 4 postergados, 2 obsoletos) |
| Historias de Usuario | 22 |
| Story Points totales formalizados | 104: 101 entregados en Hitos 02 a 05 y 3 postergados a Futuro |
| ADRs documentados | 8 |
| Scripts de automatización | 40 archivos `.py`/`.sh` en `scripts/` |
| Tablas en BD | 4 |
| Columnas totales | 26 |

## Decisiones Técnicas Clave

| Decisión | Justificación corta |
|---|---|
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
| ADR-003 | Metodología de Desarrollo — Kanban | Aceptado |
| ADR-004 | Estructura de Carpetas del Proyecto | Aceptado |
| ADR-005 | Pivote de PWA a Aplicación Android Híbrida con Capacitor (APK) | Aceptado |
| ADR-006 | Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native | Aceptado |
| ADR-007 | Organización de Componentes por Feature | Aceptado |
| ADR-008 | Arquitectura Modular por Capas y Patrones de Coordinación | Aceptado |

## Releases y Cortes Documentales

| Referencia | Tipo | Fecha | Highlights |
|---|---|---|---|
| `v0.4.8` | GitHub pre-release | 2026-07-01 | APK firmada, hash documentado, quality gate y validación Android inicial |
| `0.4.0`–`0.4.7` | Cortes documentales | 2026-05-17 a 2026-05-26 | Lotes incrementales de Organización y UX; no tuvieron tags/releases individuales |
| `LB-PROD-v0.3.0` | Línea base Hito 04 | 2026-06-01 | SQLite, organización, UX móvil, papelera y estabilización |
| `LB-PROD-v0.2.0` | Línea base Hito 03 | Target del 2026-05-05 | Markdown, modos de edición/lectura y soporte offline original |
| `LB-PROD-v0.1.0` | Línea base Hito 02 | Target del 2026-05-03 | Editor, store y persistencia local inicial |

Los meses de Hitos 02 a 06 son etiquetas del calendario académico planificado; no equivalen por sí solos a fechas de publicación Git.

## Preguntas Frecuentes del Tribunal

- **¿Qué arquitectura usa Lumapse?** → Un monolito modular cliente, offline-first, con capas pragmáticas y UI organizada por feature. Se entrega como una unidad Android híbrida; no es MVC estricto, Clean Architecture completa ni microservicios.
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
- **¿La APK ya está disponible?** → Sí como beta controlada `v0.4.8`, publicada en GitHub Releases y validada inicialmente en Android real. No se presenta todavía como versión final estable; el cierre definitivo queda para Hito 06.
- **¿Por qué no existe `0.4.9` si `main` avanzó?** → Porque `v0.4.8` identifica la APK publicada y el trabajo posterior consiste en documentación/refactors aún no publicados como artefacto. El checkpoint inicial contabilizó 12 commits; el conteo puede crecer y no define una versión. La siguiente se decide al congelar y validar el artefacto final.
- **¿Qué queda antes de defender?** → Revisión editorial y de maquetación final —incluida la legibilidad de los gráficos DB ya incorporados—, validación con más notas, decisión sobre `Mover a`/rendimiento y preparación de presentación, demo y contingencia.

## Fuentes

- `docs/producto/requisitos-funcionales.md`
- `docs/producto/historias-de-usuario.md`
- `docs/producto/decisiones-producto.md`
- `docs/adr/`
- `CHANGELOG.md`
- `docs/gestion/checklist-validacion-android.md`
- `docs/gestion/lineas-base.md`
- `docs/diagramas/database/04-modelo-fisico-ddl.md`
- `src/`
- `scripts/`
