# Backlog y Deuda Técnica — Lumapse

Este documento funciona como bandeja viva de tareas, deuda y decisiones pendientes. El historial detallado de hitos cerrados se conserva en [`docs/gestion/historico/`](docs/gestion/historico/) y en los informes de [`docs/hitos/`](docs/hitos/).

> **Hito activo:** 06 — Entrega Final
> **Hito 05:** Cerrado documentalmente el 2026-07-15 sobre la beta operativa `v0.4.8`
> **Última actualización:** 2026-09-03 — AUD-001 a AUD-004 y AUD-007 cerrados técnicamente; AUD-005 es el próximo frente técnico independiente
> **Snapshot histórico:** [`docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md`](docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md)

---

## Estado Actual

Hito 04 quedó cerrado formalmente como bloque de Organización y UX. El cierre combinó implementación mínima de pulido UX (empty states) y decisiones explícitas de postergación/descarte para funcionalidades opcionales que podían agregar ruido visual o sugerir capacidades no presentes todavía.

Hito 05 quedó cerrado documentalmente el 2026-07-15. Entregó el quality gate, APK firmada, validación inicial en Android real y publicación de la beta controlada [`v0.4.8`](https://github.com/jdfesa/lumapse/releases/tag/v0.4.8), junto con mejoras funcionales acotadas: borradores persistentes (`RF-005`), backup manual (`RF-017`), importación ZIP (`RF-018`), Acerca de (`RF-023`), fechas académicas discretas (`RF-027`) y editor enriquecido (`RF-028`). Las observaciones sobre `Mover a` y rendimiento con más notas no bloquearon ese cierre.

Hito 06 queda activo para completar la documentación final, verificar la maquetación de los gráficos de base de datos ya actualizados, repetir la validación sobre un corte congelado y preparar la presentación. La única versión publicada continúa siendo `v0.4.8`; el trabajo posterior al tag ya incluye los cierres técnicos AUD-001 a AUD-004 y AUD-007, pero todavía no constituye una release ni un APK distribuible nuevo. La decisión pendiente debe distinguir entre una beta de corrección `v0.4.9` y el artefacto final de Hito 06, sin renombrar preventivamente el estado actual de `main`.

La revisión técnica priorizada del 2026-09-01 abrió trece hallazgos trazables. AUD-001 y AUD-002 quedaron resueltos mediante PR #2; AUD-003 quedó validado en Android e integrado mediante PR #3; AUD-004 cerró dependencias vulnerables en PR #5. AUD-007 unificó el contrato emit-and-rethrow del store, adaptó los límites UI, aprobó 989 tests, quality gate y Android 0.4.8/408, y se integra mediante PR #6. La validación funcional de 500 notas de AUD-003 no sustituye las mediciones de latencia y rendimiento exigidas por `RNF-002` y `RNF-004`. Los hallazgos restantes mantienen sus prioridades y no se incorporan automáticamente al alcance de Hito 06.

La revisión de exportación/importación corrige una sobrepromesa documental del Hito 03: los servicios base de Markdown no equivalían a un flujo de usuario validado. La opción "Compartir" para una nota individual (`RF-016`) solo tendría sentido si abre el share sheet nativo de Android y ofrece apps como WhatsApp; si termina copiando contenido, duplica una acción existente y agrega ruido. La portabilidad de workspace sí quedó resuelta de forma acotada con exportación e importación de backup `.zip` desde la vista Backup.

El benchmark contra apps como Markor refuerza una deuda crítica: Lumapse no debe encerrar al estudiante en SQLite sin salida. La primera versión de `RF-017` ya quedó integrada como backup manual `.zip`, restaurable/legible, con salida externa por share sheet o gestor de archivos. La primera versión de `RF-018` permite importar un ZIP generado por Lumapse con validación de manifest, preview, escritura transaccional y política no destructiva de duplicados. Los planes operativos cerrados quedan archivados en [`docs/gestion/historico/plan-backup-google-drive-2026-06-03.md`](docs/gestion/historico/plan-backup-google-drive-2026-06-03.md) y [`docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md`](docs/gestion/historico/plan-importacion-backup-zip-2026-06-18.md).

El benchmark visual contra Notion mobile derivó en `RF-028`: controles opcionales de formato e inserción para enriquecer notas Markdown sin convertir Lumapse en un editor pesado. Las fases completadas incluyen slash commands, menú `+`, botón `Aa`, continuidad inteligente de listas/callouts, render visual de callouts y tipografía de escritura más cómoda. El plan cerrado queda archivado en [`docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md`](docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md).

La revisión de `RF-005` reemplazó el auto-guardado final silencioso por borradores persistentes del editor. Lumapse conserva localmente el trabajo en curso al crear o editar, lo restaura al volver de otra app o vista, y lo limpia solo al guardar/actualizar con éxito o al descartar explícitamente. El plan cerrado queda archivado en [`docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md`](docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md).

La estrategia de mantenibilidad y tipado gradual queda documentada en [`docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md`](docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md). Las primeras fases operativas ya quedaron aplicadas: `tests/unit/components/` espeja la organización por feature de `src/components/`, `NoteStore.*` dejó de importar feedback visual, el proyecto ya tiene `typecheck` y contratos de dominio iniciales en `src/domain/`, los primeros módulos puros migrados son `AcademicEventRules`, `NoteTitleService`, `SubjectService.validation`, `BackupFormat`, `noteFilters`, `AcademicEventTypes`, `editorTextTransforms`, `MarkdownService` y el registro de comandos del editor, el primer servicio de dominio migrado es `AcademicEventService`, la capa de backup ya tipa decisiones, datos, transformación ZIP, escritura ZIP, persistencia liviana, orquestación y adaptadores nativos de red/share, `ExportService` ya quedó tipado como fachada web/legada del backup canónico, y `SubjectService.crud`/`SubjectService.trash` ya declaran contratos sobre materias, árbol activo y papelera avanzada manteniendo el barrel público. Las auditorías auxiliares y el binario Rust también escanean `.ts`. Las migraciones futuras permanecen subordinadas a riesgos o cambios concretos: no se abre una conversión masiva durante el cierre.

La trazabilidad de `v0.4.8` queda distribuida entre `docs/gestion/lineas-base.md`, `docs/gestion/cheatsheet-defensa.md`, el cierre de Hito 05 y `CHANGELOG.md`. El trabajo final de informe, defensa, diagramas y evidencia adicional se concentra desde ahora en Hito 06.

---

## Prioridad Inmediata — Hito 06

| Orden | Tarea | Criterio de cierre |
|---|---|---|
| 1 | Congelamiento editorial y visual | Consolidar evidencia, verificar bibliografía y confirmar legibilidad de gráficos DB en PDF y diapositivas |
| 2 | Validación final | Ejecutar el gate sobre el corte candidato, completar las mediciones RNF y repetir Android sobre el artefacto versionado; resolver o aceptar `Mover a` y rendimiento |
| 3 | Presentación y defensa | Preparar guion, demo, cheatsheet, material visual y contingencias |
| 4 | Corte final | Decidir entre beta patch y entrega final; alinear versión web/Android, firmar, calcular hash, etiquetar y registrar la línea base |

---

## Revisión técnica priorizada — estado vivo

El análisis detallado permanece en [`docs/gestion/revision-tecnica-priorizada-2026-09-01.md`](docs/gestion/revision-tecnica-priorizada-2026-09-01.md). Esta tabla fija el estado operativo después de cerrar AUD-001 a AUD-004 y AUD-007.

| ID | Prioridad | Frente | Estado operativo |
|---|---|---|---|
| AUD-001 | P0 | Pérdida de borrador ante error SQLite | Cerrado en PR #2; regresiones aprobadas |
| AUD-002 | P0 | Guardados duplicados por taps concurrentes | Cerrado en PR #2; single-flight y estado visual validados |
| AUD-003 | P0 | Frontera y presentación de backups no confiables | Cerrado en PR #3; suite acumulativa y checkpoints Android aprobados |
| AUD-004 | P0 | Dependencias con advisories de seguridad | Cerrado en PR #5; auditorías 0/0 y Android aprobados |
| AUD-005–AUD-006 | P1 | Coordinación de persistencia y resultados async obsoletos | Pendientes; AUD-005 es el próximo frente técnico independiente |
| AUD-007 | P1 | Contratos incompatibles para errores de mutaciones | Cerrado en PR #6; contrato único, consumidores y Android aprobados |
| AUD-008–AUD-009 | P1 | Portabilidad del gate y Node 26 | Pendientes; abordar sin relajar controles |
| AUD-010–AUD-013 | P2 | Escalabilidad, rendimiento, cohesión y margen de bundle/coverage | Monitorear o medir; no bloquean por sí solos el cierre actual |

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
| Documentación | Congelar documentos antes del corte final | Alta | La reconciliación posterior a AUD-001/002/003 se completó el 2026-09-02; restan evidencia final, revisión de maquetación y el corte elegido |
| Dependencias | Repetir auditorías en cada corte candidato | Recurrente | AUD-004 quedó cerrado con grafo mínimo, auditorías 0/0 y Android aprobado; revalidar porque los advisories evolucionan |
| Persistencia y asincronía | Planificar AUD-005–AUD-006 | Alta/Media | AUD-007 quedó cerrado en PR #6; mantener ramas separadas para propiedad transaccional/migraciones y resultados async obsoletos |
| Tooling | Resolver portabilidad de gate y Node 26 (AUD-008/AUD-009) | Media | Distinguir falsos positivos CSP del fallback offline y eliminar la dependencia del workaround de Web Storage sin relajar controles |
| Tooling DB | Ampliar el smoke test a `academic_events` y constraints relevantes | Media | El DDL completo se ejecuta, pero las aserciones explícitas de tablas/columnas/relaciones se concentran en materias, notas y metadata; decidir su ampliación antes de presentar cobertura exhaustiva |
| Tooling de release | Sincronizar versión Android desde el helper | Alta | `scripts/release-helper.py` actualiza package/changelog, pero no `versionName` ni `versionCode`; corregirlo o agregar un gate explícito antes de generar otra APK |
| Diagramas | Revisar Mermaid de casos de uso, secuencia y dominio | Baja | Completado el 2026-07-03 contra `v0.4.8`; reabrir solo si cambia el alcance o durante la exportacion final a PDF/LaTeX |
| Informe final | Preparar conversion LaTeX/PDF | Media | Consideraciones registradas en `docs/informe-final/README.md`; mantener Markdown como fuente de verdad y abrir pipeline LaTeX solo cuando el contenido este congelado |
| Release | Definir el próximo corte | Alta | `v0.4.8` sigue como única beta publicada y no contiene AUD-001/002/003/004; evaluar `v0.4.9` como beta patch o reservar el artefacto para el cierre final, siempre después de los gates acordados |
| UX menor | Revisar interacción de `Mover a` | Baja | En S20 FE se observó que puede requerir pulsación prolongada; no bloquea beta porque la acción se completa |
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
- No denominar `0.4.9` al estado actual de `main` ni generar un APK con esa versión sin una decisión formal de corte.
- No publicar un nuevo artefacto sin repetir auditorías sobre el corte candidato ni mientras exista cualquier bloqueo de seguridad confirmado.
- Todo cambio de comportamiento debe cerrar con tests focalizados, `npm run verify`, trazabilidad y nueva validación Android proporcional al riesgo.
- Preservar `v0.4.8` y su SHA-256 como evidencia inmutable de la beta publicada.
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
- [ ] Corregir o reforzar `scripts/release-helper.py` para que `versionName` y `versionCode` Android no puedan quedar desalineados del corte declarado.
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
