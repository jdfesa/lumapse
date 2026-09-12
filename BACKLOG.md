# Backlog y Deuda Técnica — Lumapse

Este documento funciona como bandeja viva de tareas, deuda y decisiones pendientes. El historial detallado de hitos cerrados se conserva en [`docs/gestion/historico/`](docs/gestion/historico/) y en los informes de [`docs/hitos/`](docs/hitos/).

> **Hito activo:** 06 — Entrega Final
> **Hito 05:** Cerrado documentalmente el 2026-07-15 sobre la beta operativa `v0.4.8`
> **Última actualización:** 2026-09-12 — plan inmediato propuesto para revisión; AUD-014 reproducido, sin cambios de implementación ni versión
> **Snapshot histórico:** [`docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md`](docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md)

---

## Estado Actual

Hito 04 quedó cerrado formalmente como bloque de Organización y UX. El cierre combinó implementación mínima de pulido UX (empty states) y decisiones explícitas de postergación/descarte para funcionalidades opcionales que podían agregar ruido visual o sugerir capacidades no presentes todavía.

Hito 05 quedó cerrado documentalmente el 2026-07-15. Entregó el quality gate, APK firmada, validación inicial en Android real y publicación de la beta controlada [`v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8), junto con mejoras funcionales acotadas: borradores persistentes (`RF-005`), backup manual (`RF-017`), importación ZIP (`RF-018`), Acerca de (`RF-023`), fechas académicas discretas (`RF-027`) y editor enriquecido (`RF-028`). Las observaciones sobre `Mover a` y rendimiento con más notas no bloquearon ese cierre.

Hito 06 queda activo para completar la documentación final, verificar la maquetación de los gráficos de base de datos, cerrar la matriz RNF y preparar la presentación. La segunda beta [`v0.5.0`](https://github.com/jdfesa/lumapse/releases/tag/v0.5.0) ya está publicada: fija el commit `5840755`, distribuye `lumapse-v0.5.0.apk` y reúne AUD-001 a AUD-007, las correcciones táctiles de organización y el tooling de release sincronizado. Este corte es la referencia operativa vigente, pero no se presenta todavía como versión estable ni como cierre académico definitivo.

La revisión técnica priorizada del 2026-09-01 abrió trece hallazgos trazables. AUD-001 y AUD-002 quedaron resueltos mediante PR #2; AUD-003 mediante PR #3; AUD-004 mediante PR #5; AUD-007 mediante PR #6; AUD-005 mediante PR #7 y AUD-006 mediante PR #8. Los siete cierres forman parte de `v0.5.0`. El gate del corte aprobó 67 archivos y 1065 tests; la limitación local de Node 26 continúa registrada como AUD-009 y no invalida la ejecución canónica con Node 22.20.0/npm 10.9.3. La validación funcional de 500 notas de AUD-003 no sustituye las mediciones de latencia y rendimiento exigidas por `RNF-002` y `RNF-004`. Los hallazgos restantes mantienen sus prioridades y no se incorporan automáticamente al alcance de Hito 06.

La revisión acotada del 2026-09-12 agregó **AUD-014**: una creación de nota o fecha ya persistida puede rechazar por fallo de recarga y duplicarse al reintentar. Se reprodujo sobre SQLite en memoria, no en Android. El [plan de desarrollo inmediato](docs/gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) propone abordarlo después de hacer reproducible el gate; su aceptación no implica implementación ni cierre del hallazgo.

La revisión de exportación/importación corrige una sobrepromesa documental del Hito 03: los servicios base de Markdown no equivalían a un flujo de usuario validado. La opción "Compartir" para una nota individual (`RF-016`) solo tendría sentido si abre el share sheet nativo de Android y ofrece apps como WhatsApp; si termina copiando contenido, duplica una acción existente y agrega ruido. La portabilidad de workspace sí quedó resuelta de forma acotada con exportación e importación de backup `.zip` desde la vista Backup.

El benchmark contra apps como Markor refuerza una deuda crítica: Lumapse no debe encerrar al estudiante en SQLite sin salida. La primera versión de `RF-017` ya quedó integrada como backup manual `.zip`, restaurable/legible, con salida externa por share sheet o gestor de archivos. La primera versión de `RF-018` permite importar un ZIP generado por Lumapse con validación de manifest, preview, escritura transaccional y política no destructiva de duplicados. Los planes operativos cerrados quedan archivados en [`docs/gestion/historico/plan-backup-google-drive-2026-06-03.md`](docs/gestion/historico/plan-backup-google-drive-2026-06-03.md) y [`docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md`](docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md).

El benchmark visual contra Notion mobile derivó en `RF-028`: controles opcionales de formato e inserción para enriquecer notas Markdown sin convertir Lumapse en un editor pesado. Las fases completadas incluyen slash commands, menú `+`, botón `Aa`, continuidad inteligente de listas/callouts, render visual de callouts y tipografía de escritura más cómoda. El plan cerrado queda archivado en [`docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md`](docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md).

La revisión de `RF-005` reemplazó el auto-guardado final silencioso por borradores persistentes del editor. Lumapse conserva localmente el trabajo en curso al crear o editar, lo restaura al volver de otra app o vista, y lo limpia solo al guardar/actualizar con éxito o al descartar explícitamente. El plan cerrado queda archivado en [`docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md`](docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md).

La estrategia de mantenibilidad y tipado gradual queda documentada en [`docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md`](docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md). Las primeras fases operativas ya quedaron aplicadas: `tests/unit/components/` espeja la organización por feature de `src/components/`, `NoteStore.*` dejó de importar feedback visual, el proyecto ya tiene `typecheck` y contratos de dominio iniciales en `src/domain/`, los primeros módulos puros migrados son `AcademicEventRules`, `NoteTitleService`, `SubjectService.validation`, `BackupFormat`, `noteFilters`, `AcademicEventTypes`, `editorTextTransforms`, `MarkdownService` y el registro de comandos del editor, el primer servicio de dominio migrado es `AcademicEventService`, la capa de backup ya tipa decisiones, datos, transformación ZIP, escritura ZIP, persistencia liviana, orquestación y adaptadores nativos de red/share, `ExportService` ya quedó tipado como fachada web/legada del backup canónico, y `SubjectService.crud`/`SubjectService.trash` ya declaran contratos sobre materias, árbol activo y papelera avanzada manteniendo el barrel público. Las auditorías auxiliares y el binario Rust también escanean `.ts`. Las migraciones futuras permanecen subordinadas a riesgos o cambios concretos: no se abre una conversión masiva durante el cierre.

La trazabilidad de `v0.4.8` y `v0.5.0` queda distribuida entre `docs/gestion/lineas-base.md`, `docs/gestion/cheatsheet-defensa.md`, los informes de Hito 05/06 y `CHANGELOG.md`. El trabajo final de informe, defensa, maquetación y evidencia adicional se concentra en Hito 06.

---

## Prioridad Inmediata — Hito 06

**Propuesta pendiente de aceptación por PR:** concentrar las próximas sesiones técnicas en la siguiente secuencia. Alcance, archivos, pruebas, dependencias y criterios de salida viven en el [plan inmediato](docs/gestion/plan-desarrollo-inmediato-beta-2026-09-12.md); no se inicia implementación antes de integrar el plan con autorización.

| Orden | Tarea | Criterio de cierre |
|---|---|---|
| F1 | Gate portable y Node explícito — AUD-008/AUD-009 | Mismo `verify` local/CI, Node 22.20.0/npm 10.9.3 fijados, sin falsos positivos CSP ni aceptación de crashes |
| F2 | Confirmación de creación — AUD-014 | Una escritura confirmada no se informa como fallida por una recarga; regresiones y smoke Android proporcionales |
| F3 | Evidencia del núcleo y 500 notas | Resultados trazables de CRUD/FPS, offline y continuidad; optimizaciones solo si una medición las justifica y se aprueba otro PR |

Continúan los pendientes de **congelamiento editorial/visual**, **validación RNF restante**, **presentación/defensa** y **línea base final**. No quedan completados ni descartados por esta secuencia técnica. No se fuerza una versión estable o `1.0.0` al terminar F3.

---

## Revisión técnica priorizada — estado vivo

El análisis original permanece en [`docs/gestion/revision-tecnica-priorizada-2026-09-01.md`](docs/gestion/revision-tecnica-priorizada-2026-09-01.md). Esta tabla fija el estado operativo después de cerrar AUD-001 a AUD-007 y registrar el complemento acotado del 2026-09-12.

| ID | Prioridad | Frente | Estado operativo |
|---|---|---|---|
| AUD-001 | P0 | Pérdida de borrador ante error SQLite | Cerrado en PR #2; regresiones aprobadas |
| AUD-002 | P0 | Guardados duplicados por taps concurrentes | Cerrado en PR #2; single-flight y estado visual validados |
| AUD-003 | P0 | Frontera y presentación de backups no confiables | Cerrado en PR #3; suite acumulativa y checkpoints Android aprobados |
| AUD-004 | P0 | Dependencias con advisories de seguridad | Cerrado en PR #5; auditorías 0/0 y Android aprobados |
| AUD-005 | P1 | Coordinación SQLite, migraciones y arranque | Cerrado e integrado mediante PR #7; 1035 tests, gate canónico y prueba manual Android aprobados. [Evidencia](docs/gestion/analisis-aud-005-coordinacion-sqlite-2026-09-04.md) |
| AUD-006 | P1 | Resultados async obsoletos | Cerrado en [PR #8](https://github.com/jdfesa/lumapse/pull/8), incluido en `v0.5.0`; Mac/Android y regresiones aprobados. [Evidencia](docs/gestion/analisis-aud-006-ownership-solicitudes-async-2026-09-05.md) |
| AUD-007 | P1 | Contratos incompatibles para errores de mutaciones | Cerrado en PR #6; contrato único, consumidores y Android aprobados |
| AUD-008–AUD-009 | P1 | Portabilidad del gate y Node 26 | Pendientes; propuesta F1 del plan inmediato, sin relajar controles |
| AUD-010–AUD-013 | P2 | Escalabilidad, rendimiento, cohesión y margen de bundle/coverage | Monitorear o medir; no bloquean por sí solos el cierre actual |
| AUD-014 | P1 | Creación persistida rechaza por fallo de recarga | Confirmado en notas/fechas con SQLite en memoria; propuesta F2, sin implementación ni validación Android |

---

## Decisiones Postergadas por Diseño

Estas tareas no bloquean el MVP. Se conservan como decisiones trazables para reabrir solo con feedback real de estudiantes o por madurez del producto.

| ID | Decisión | Estado | Justificación |
|---|---|---|---|
| RF-006 | Conteo de palabras/caracteres | Postergado | Lumapse prioriza captura rápida; un contador permanente agregaría ruido al editor |
| RF-022 | Onboarding carousel | Postergado | La beta inicial no registró un bloqueo de descubrimiento; reabrir solo con evidencia de usuarios |
| RF-024 | Indicador online/offline global | Postergado | El núcleo local no depende de la red y un chip permanente sugeriría una sincronización inexistente. El backup, que sí puede depender de conectividad para su destino externo, ya muestra feedback contextual dentro de su propio flujo. |
| DP-006 | Guía Markdown dedicada | Postergado | Lumapse funciona con texto plano; Markdown no debe sentirse como requisito de entrada |
| Coach marks | Tooltips de primera vez | Descartado para Hito 04 | Pueden interrumpir el flujo mobile-first de captura rápida |

> `RF-028` no contradice `DP-006`: los comandos y botones son ayudas operativas dentro del editor, no un tutorial obligatorio ni una barrera para escribir texto plano.

---

## Portabilidad local — Alcance decidido

| ID | Decisión | Complejidad | Recomendación |
|---|---|---|---|
| RF-016 | Compartir/exportar nota individual | Media | Postergar: requiere `@capacitor/share`, posible `@capacitor/filesystem`, sync nativo y prueba real de WhatsApp/share sheet |
| RF-017 | Exportar respaldo `.zip` local + salida externa | Media/Alta | Primera version completada: backup manual restaurable/legible con share sheet/gestor de archivos. Plan cerrado en [`docs/gestion/historico/plan-backup-google-drive-2026-06-03.md`](docs/gestion/historico/plan-backup-google-drive-2026-06-03.md). Queda para futuro Drive API directa |
| RF-018 | Importar respaldo `.zip` generado por Lumapse | Media/Alta | Primera version completada: validacion de manifest, preview, importacion no destructiva, escritura transaccional y validacion Android real. Plan cerrado en [`docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md`](docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md). La importacion de nota individual `.md` queda como deuda futura separada |

---

## Deuda Técnica Viva

| Área | Tarea | Prioridad | Notas |
|---|---|---|---|
| Arquitectura UI | Separar responsabilidades restantes en componentes grandes | Media | Priorizar `NoteEditor`, `NoteList`, `Heatmap` y `BackupView` solo cuando haya cambios funcionales relacionados |
| Tipado gradual | Aplicar estrategia JS/TS por fases | Media | Plan definido en [`docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md`](docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md): typecheck, contratos, primera tanda de modulos puros, `AcademicEventTypes`, registro de comandos del editor, `AcademicEventService`, capa de backup —incluidos adaptadores nativos—, `ExportService`, `SubjectService.crud`, `SubjectService.trash` y auditorias `.ts` completadas |
| Tipado gradual | Continuar servicios de dominio/backup archivo por archivo | Baja/Media | No avanzar en bloque; proximos candidatos requieren evaluar bordes nativos/share/storage o store con contratos mas claros |
| Framework UI | No incorporar Svelte por ahora | Baja | Costo de migracion alto vs beneficio actual; reabrir solo si DOM manual se vuelve una carga clara |
| Documentación | Congelar documentos para la entrega académica | Alta | La documentación viva se reconcilió con `v0.5.0`; restan bibliografía, matriz RNF, revisión de maquetación y materiales de defensa |
| Dependencias | Repetir auditorías en cada corte candidato | Recurrente | AUD-004 quedó cerrado con grafo mínimo, auditorías 0/0 y Android aprobado; revalidar porque los advisories evolucionan |
| Tooling | Resolver portabilidad de gate y Node 26 (AUD-008/AUD-009) | Media | Fijar Node 22.20.0/npm 10.9.3, diagnosticar versiones distintas y eliminar la dependencia del workaround de Web Storage sin relajar controles |
| Store / formularios | Separar creación confirmada de recarga fallida (AUD-014) | Alta | Dos caracterizaciones verifican duplicados por reintento; contrato y criterios propuestos en F2 del [plan inmediato](docs/gestion/plan-desarrollo-inmediato-beta-2026-09-12.md) |
| Tooling DB | Ampliar el smoke test a `academic_events` y constraints relevantes | Media | El DDL completo se ejecuta, pero las aserciones explícitas de tablas/columnas/relaciones se concentran en materias, notas y metadata; decidir su ampliación antes de presentar cobertura exhaustiva |
| Diagramas | Revisar Mermaid de casos de uso, secuencia y dominio | Baja | Completado el 2026-07-03 contra `v0.4.8`; reabrir solo si cambia el alcance o durante la exportacion final a PDF/LaTeX |
| Informe final | Preparar conversion LaTeX/PDF | Media | Consideraciones registradas en `docs/informe-final/README.md`; mantener Markdown como fuente de verdad y abrir pipeline LaTeX solo cuando el contenido este congelado |
| Release | Definir el cierre estable | Alta | `v0.5.0` es la segunda beta publicada y contiene AUD-001 a AUD-007; decidir después de la matriz RNF y la defensa si basta como referencia o requiere un corte estable posterior |
| Rendimiento | Medir crecimiento real de notas | Media | La importación funcional de una fixture de 500 notas fue aprobada; todavía deben medirse latencia CRUD y rendimiento percibido para cerrar `RNF-002`/`RNF-004` |
| Adjuntos | Planificar adjuntos de imagen post-release | Media | Valor alto para fotos de pizarrón; debe implementarse sin cargar SQLite ni saturar el feed |
| Backup | Restauracion avanzada y Drive API directa | Alta | Exportacion e importacion ZIP manual ya estan integradas; quedan reemplazo/merge avanzado de workspace y subida directa a Drive como fases futuras |

---

## Política de Alcance — Hito 06

Hito 06 es un hito de cierre. No incorporar salvo que un bloqueo de entrega lo exija y quede documentado:

- Agenda completa.
- Notificaciones push.
- Recurrencias, horarios o duración de eventos.
- Sincronización externa.
- Backup automático en nube; la primera versión manual ya quedó integrada.
- Importación automática de backups complejos fuera del formato Lumapse o sin preview/política no destructiva.
- Tutoriales obligatorios.
- Nuevas capas de organización más allá de Materia / Sección / Nota.

### Reglas de trabajo

- Mantener un máximo de dos frentes en curso.
- No abrir refactors ni migraciones amplias; una corrección estructural debe estar ligada a un bloqueo o a una validación concreta.
- No reutilizar `v0.5.0` para un binario diferente; todo artefacto posterior requiere una nueva versión y un nuevo `versionCode`.
- No publicar un nuevo artefacto sin repetir auditorías sobre el corte candidato ni mientras exista cualquier bloqueo de seguridad confirmado.
- Todo cambio de comportamiento debe cerrar con tests focalizados, `npm run verify`, trazabilidad y nueva validación Android proporcional al riesgo.
- Preservar `v0.4.8`, `v0.5.0` y sus SHA-256 como evidencia inmutable de las betas publicadas.
- Las ideas postergadas permanecen en este backlog; no vuelven al `TODO` operativo hasta que Hito 06 haya terminado.

---

## Evolución registrada y backlog post-defensa

Los ítems marcados como completados fueron planes que originalmente estaban en esta sección y se conservan para mantener trazabilidad. Solo las casillas abiertas representan trabajo futuro; ninguna forma parte del alcance de Hito 06.

- [x] Backup manual `.zip` con salida a almacenamiento elegido por el usuario. Validado en Android real mediante share sheet/gestor de archivos; Google Drive queda disponible si esta instalado como destino.
- [x] Importacion no destructiva de backup `.zip` generado por Lumapse, con preview, escritura transaccional, duplicados omitidos y validacion en Android real.
- [x] Borradores persistentes del editor (`RF-005`): protegen nota nueva y edición en curso sin crear ni actualizar notas finales sin confirmación.
- [x] Editor enriquecido y slash commands (`RF-028`): `/`, `+`, `Aa`, Modo Enfoque dedicado, continuidad de listas/callouts, render visual de callouts y tipografia de escritura offline-first.
- [x] Plan de mantenibilidad gradual documentado: [`docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md`](docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md).
- [x] Estrategia de TypeScript/JSDoc progresiva definida: tipar primero contratos y logica pura; migrar servicios/store solo cuando aporte seguridad real; dejar componentes DOM grandes para el final.
- [x] Reorganizacion de tests por feature folders para que nuevas funcionalidades tengan pruebas ubicables y no rompan modulos vecinos.
- [x] Store desacoplado de feedback visual: `NoteStore.*` emite errores de dominio y `main.js` decide mostrar `Toast`.
- [x] Typecheck gradual incorporado al gate local y contratos de dominio iniciales creados en `src/domain/`.
- [x] Primera tanda de modulos puros migrada a TypeScript: `AcademicEventRules`, `NoteTitleService`, `SubjectService.validation`, `BackupFormat` y `noteFilters`.
- [x] Primer servicio de dominio migrado a TypeScript: `AcademicEventService`, con contratos publicos y tests focalizados.
- [x] Servicios puros de decision de backup migrados a TypeScript: `BackupNetworkService` y `BackupReminderService`.
- [x] Contrato de datos y orquestacion de backup migrado a TypeScript: `BackupDataSource`, `BackupService`, `BackupData` y `CurrentBackupZip`.
- [x] Transformacion ZIP y auditorias migradas al mundo TS: `BackupZipService` tipado y scripts/Rust auditando `.ts`.
- [x] CRUD y arbol activo de materias migrado a TypeScript: `SubjectService.crud`, preservando `SubjectService.js` como API publica.
- [x] Papelera avanzada de materias migrada a TypeScript: `SubjectService.trash`, preservando cascadas, restauracion navegable y `getTrashItems`.
- [x] Escritor ZIP liviano migrado a TypeScript: `BackupZipArchive`, con test directo sobre formatos de salida y rutas UTF-8.
- [x] Persistencia liviana de recordatorios de backup migrada a TypeScript: `BackupStorageService`, con contrato de storage inyectable y tests directos.
- [x] Orquestacion del flujo manual de backup migrada a TypeScript: `BackupFlowService`, con contratos para readiness, recordatorios y resultado de share externo.
- [x] Fachada web/legada de exportacion migrada a TypeScript: `ExportService`, delegando en el backup canonico v1 y validando descarga `Blob`.
- [x] Helper puro del editor enriquecido migrado a TypeScript: `editorTextTransforms`, con pruebas directas de continuacion Markdown y comandos inline.
- [x] Registro de comandos del editor migrado a TypeScript: `editorCommandRegistry` y `editorInlineCommands`, fijando contratos de superficies, grupos, snippets y metadatos visuales.
- [x] Helper visual de fechas academicas migrado a TypeScript: `AcademicEventTypes`, fijando contratos de tipos, colores, acciones y opciones de render.
- [x] Servicio de render Markdown seguro migrado a TypeScript: `MarkdownService`, fijando contratos de callouts, opciones de render, sanitizacion y deteccion de sintaxis.
- [x] Deuda menor de tests cerrada: `moveNote()` cubierto en `NoteStore.data.test.js`; no queda una clave `deleteSection` duplicada en el mock vigente.
- [x] Adaptadores nativos de backup migrados a TypeScript: `BackupNativeNetworkService.ts` y `BackupShareService.ts` fijan contratos pequenos para Network, Filesystem y Share sin acoplar el dominio a los plugins de Capacitor.
- [x] Coverage ampliado a JavaScript y TypeScript: `npm run test:coverage` mide `src/**/*.{js,ts}` y la linea base del 2026-08-21 registra 92,43% de statements en `src/services/**`, por encima del 70% exigido por `RNF-024`.
- [x] Imports dinamicos redundantes retirados del store y la restauracion de papelera: Vite ya no advierte sobre modulos que eran importados de forma estatica y dinamica a la vez.
- [x] AUD-001 y AUD-002 cerrados en PR #2: el editor conserva el borrador ante fallos, serializa guardados concurrentes y diferencia visualmente el descarte.
- [x] AUD-003 cerrado en PR #3: importación ZIP acotada, validación runtime, jerarquía consistente, presentación defensiva y validación Android acumulativa.
- [x] AUD-004 cerrado en PR #5: dependencias parcheadas, auditorías 0/0, sanitización, lockfile, suite, build y Android aprobados el 2026-09-02.
- [x] AUD-007 cerrado en PR #6: contrato emit-and-rethrow unificado, consumidores adaptados, 989 tests, quality gate y Android 0.4.8/408 aprobados el 2026-09-03.
- [x] AUD-005 cerrado en PR #7 y AUD-006 en PR #8; ambos integrados en la beta `v0.5.0` con validación automática y Android trazable.
- [x] Interacciones táctiles de organización corregidas en PR #9: `Mover a` abre con un toque, las acciones de materia/sección son explícitas y los menús se cierran al navegar.
- [x] `scripts/release-helper.py` sincroniza y verifica package, `versionName` y `versionCode`; el gate `check:version` se aplicó al corte `0.5.0/500`.
- [ ] Aplicar mejoras pequenas y verificables que aumenten cohesion, reduzcan acoplamiento y faciliten revisiones humanas/IA, evitando reescrituras grandes.
- [ ] Restauracion avanzada desde backup `.zip` con estrategia explicita de reemplazo/merge, solo despues de validar la importacion no destructiva actual con usuarios reales.
- [ ] Sincronización real multi-dispositivo, solo después de validar backup/restauración y con feedback fuerte de adopción.
- [ ] Evaluar un canal de escritorio/PC o web soportada como decisión de producto separada de la sincronización; P8 registró interés descriptivo en celular + PC, pero no definió distribución, persistencia compartida ni demanda de una versión desktop.
- [ ] Compartir nota individual con share sheet nativo de Android, solo si se valida que ofrece apps reales como WhatsApp y no duplica la acción Copiar.
- [ ] Google Drive API directa para subir backups a una carpeta elegida o `appDataFolder`, solo después de definir OAuth, scopes y fallback local.
- [ ] Importación de nota individual hacia `Entrada`, dejando merge de materias/secciones para la restauracion de backups.
- [ ] Adjuntos de imagen para notas: permitir tomar o seleccionar fotos de pizarrón, guardar una copia optimizada y una miniatura en storage local de la app, registrar solo metadata/rutas en SQLite, cargar miniaturas de forma lazy y eliminar archivos físicos al vaciar papelera. No guardar imágenes como base64 dentro de `notes.content` ni depender de rutas públicas externas como almacenamiento principal.
- [ ] Ayuda ampliada o mini guía Markdown dentro de una sección `Acerca de/Ayuda`, solo si el feedback demuestra fricción real.
- [ ] Métricas de escritura como contador de palabras/caracteres, solo si aparecen casos de uso académicos concretos.
- [ ] Onboarding o coach marks, solo si el feedback de la beta muestra problemas de descubrimiento.

---

## Archivos Históricos

- [`docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md`](docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md): backlog completo antes de la limpieza.
- [`docs/gestion/historico/plan-fechas-academicas-discretas-2026-05-31.md`](docs/gestion/historico/plan-fechas-academicas-discretas-2026-05-31.md): plan operativo completo de Fechas Académicas discretas.
- [`docs/gestion/historico/plan-backup-google-drive-2026-06-03.md`](docs/gestion/historico/plan-backup-google-drive-2026-06-03.md): plan operativo completo del backup manual `.zip` externo.
- [`docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md`](docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md): plan operativo completo de la importacion de backups `.zip` generados por Lumapse.
- [`docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md`](docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md): plan operativo completo del editor enriquecido y slash commands.
- [`docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md`](docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md): plan operativo completo de borradores persistentes del editor.
- [`docs/hitos/hito-04-agosto.md`](docs/hitos/hito-04-agosto.md): informe formal del Hito 04.
- [`CHANGELOG.md`](CHANGELOG.md): registro histórico de cambios por versión.
