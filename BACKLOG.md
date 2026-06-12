# Backlog y Deuda Técnica — Lumapse

Este documento funciona como bandeja viva de tareas, deuda y decisiones pendientes. El historial detallado de hitos cerrados se conserva en [`docs/gestion/historico/`](docs/gestion/historico/) y en los informes de [`docs/hitos/`](docs/hitos/).

> **Hito activo:** 05 — Testing, Calidad y Distribución
> **Hito 04:** Cerrado formalmente el 2026-06-01
> **Última actualización:** 2026-06-12 — servicios de dominio/backup migrados a TypeScript por fases
> **Snapshot histórico:** [`docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md`](docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md)

---

## Estado Actual

Hito 04 quedó cerrado formalmente como bloque de Organización y UX. El cierre combinó implementación mínima de pulido UX (empty states) y decisiones explícitas de postergación/descarte para funcionalidades opcionales que podían agregar ruido visual o sugerir capacidades no presentes todavía.

Hito 05 queda activo con foco en estabilización, calidad y distribución. Durante la preparación de release se aprobaron cuatro mejoras funcionales acotadas y ya implementadas: borradores persistentes del editor (`RF-005`), backup manual externo (`RF-017`), fechas académicas discretas (`RF-027`) y editor enriquecido (`RF-028`). Desde este punto, la prioridad vuelve a ser validar el producto, preparar el APK y ordenar los artefactos finales.

La revisión de exportación/importación corrige una sobrepromesa documental: existen servicios base (`ExportService`/`ImportService`), pero la UI actual no expone esos flujos. La opción "Compartir" solo tendría sentido si abre el share sheet nativo de Android y ofrece apps como WhatsApp; si termina copiando contenido, duplica una acción existente y agrega ruido.

El benchmark contra apps como Markor refuerza una deuda crítica: Lumapse no debe encerrar al estudiante en SQLite sin salida. La primera versión de `RF-017` ya quedó integrada como backup manual `.zip`, restaurable/legible, con salida externa por share sheet o gestor de archivos. El plan operativo cerrado queda archivado en [`docs/gestion/historico/plan-backup-google-drive-2026-06-03.md`](docs/gestion/historico/plan-backup-google-drive-2026-06-03.md).

El benchmark visual contra Notion mobile derivó en `RF-028`: controles opcionales de formato e inserción para enriquecer notas Markdown sin convertir Lumapse en un editor pesado. Las fases completadas incluyen slash commands, menú `+`, botón `Aa`, continuidad inteligente de listas/callouts, render visual de callouts y tipografía de escritura más cómoda. El plan cerrado queda archivado en [`docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md`](docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md).

La revisión de `RF-005` reemplazó el auto-guardado final silencioso por borradores persistentes del editor. Lumapse conserva localmente el trabajo en curso al crear o editar, lo restaura al volver de otra app o vista, y lo limpia solo al guardar/actualizar con éxito o al descartar explícitamente. El plan cerrado queda archivado en [`docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md`](docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md).

La estrategia de mantenibilidad y tipado gradual queda documentada en [`docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md`](docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md). Las primeras fases operativas ya quedaron aplicadas: `tests/unit/components/` espeja la organizacion por feature de `src/components/`, `NoteStore.*` dejo de importar feedback visual, el proyecto ya tiene `typecheck` y contratos de dominio iniciales en `src/domain/`, los primeros modulos puros migrados son `AcademicEventRules`, `NoteTitleService`, `SubjectService.validation`, `BackupFormat` y `noteFilters`, el primer servicio de dominio migrado es `AcademicEventService`, la capa pura de backup ya tipa decisiones, datos, transformacion ZIP, escritura ZIP y orquestacion, y `SubjectService.crud`/`SubjectService.trash` ya declaran contratos sobre materias, arbol activo y papelera avanzada manteniendo el barrel publico. Las auditorias auxiliares y el binario Rust tambien escanean `.ts`. El siguiente paso recomendado es seguir archivo por archivo con servicios donde el contrato aporte seguridad real, dejando store y componentes DOM grandes para fases posteriores.

---

## Prioridad Inmediata — Hito 05

| Orden | Tarea | Criterio de cierre |
|---|---|---|
| 1 | Release dry-run | `python3 scripts/release-helper.py --type patch --dry-run` ejecutado y resultado documentado |
| 2 | Gate local completo | `npm run verify` pasa sin fallos o deja bloqueos explícitos |
| 3 | Checklist Android | Flujo manual de prueba en dispositivo real documentado |
| 4 | APK firmado | Artefacto generado con versión definida |
| 5 | Distribución | Release o mecanismo de entrega documentado |
| 6 | RF-023 — Acerca de | Sección mínima con versión, autor y licencia, sin convertirla en tutorial |

---

## Decisiones Postergadas por Diseño

Estas tareas no bloquean el MVP. Se conservan como decisiones trazables para reabrir solo con feedback real de estudiantes o por madurez del producto.

| ID | Decisión | Estado | Justificación |
|---|---|---|---|
| RF-006 | Conteo de palabras/caracteres | Postergado | Lumapse prioriza captura rápida; un contador permanente agregaría ruido al editor |
| RF-022 | Onboarding carousel | Postergado | La primera release valida si la UI y los empty states ya son suficientes |
| RF-024 | Indicador online/offline | Postergado | Sin sincronización o backup, el estado de red no modifica el flujo y puede crear expectativas falsas |
| DP-006 | Guía Markdown dedicada | Postergado | Lumapse funciona con texto plano; Markdown no debe sentirse como requisito de entrada |
| Coach marks | Tooltips de primera vez | Descartado para Hito 04 | Pueden interrumpir el flujo mobile-first de captura rápida |

> `RF-028` no contradice `DP-006`: los comandos y botones son ayudas operativas dentro del editor, no un tutorial obligatorio ni una barrera para escribir texto plano.

---

## Portabilidad local — Alcance decidido

| ID | Decisión | Complejidad | Recomendación |
|---|---|---|---|
| RF-016 | Compartir/exportar nota individual | Media | Postergar: requiere `@capacitor/share`, posible `@capacitor/filesystem`, sync nativo y prueba real de WhatsApp/share sheet |
| RF-017 | Exportar respaldo `.zip` local + salida externa | Media/Alta | Primera version completada: backup manual restaurable/legible con share sheet/gestor de archivos. Plan cerrado en [`docs/gestion/historico/plan-backup-google-drive-2026-06-03.md`](docs/gestion/historico/plan-backup-google-drive-2026-06-03.md). Quedan para futuro restauracion completa y Drive API directa |
| RF-018 | Importar `.md` o `.zip` | Media/Alta | Deuda de más largo plazo; si se retoma una nota individual, debe entrar en `Entrada` y no reconstruir materias/secciones automáticamente |

---

## Deuda Técnica Viva

| Área | Tarea | Prioridad | Notas |
|---|---|---|---|
| Arquitectura UI | Separar responsabilidades restantes en componentes grandes | Media | Priorizar `NoteEditor`, `NoteList`, `Heatmap` y `BackupView` solo cuando haya cambios funcionales relacionados |
| Tipado gradual | Aplicar estrategia JS/TS por fases | Media | Plan definido en [`docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md`](docs/gestion/plan-mantenibilidad-tipado-gradual-2026-06-12.md): typecheck, contratos, primera tanda de modulos puros, `AcademicEventService`, capa pura de backup, `BackupZipArchive`, `SubjectService.crud`, `SubjectService.trash` y auditorias `.ts` completadas |
| Tipado gradual | Continuar servicios de dominio/backup archivo por archivo | Baja/Media | No avanzar en bloque; proximos candidatos requieren evaluar bordes nativos/share/storage o store con contratos mas claros |
| Framework UI | No incorporar Svelte por ahora | Baja | Costo de migracion alto vs beneficio actual; reabrir solo si DOM manual se vuelve una carga clara |
| Testing | Agregar tests menores para `moveNote()` en `NoteStore.data.test.js` | Baja | Deuda post-auditoría, no bloquea release si el gate pasa |
| Testing | Eliminar clave `deleteSection` duplicada en mock de tests | Baja | Limpieza de test fixture |
| Documentación | Revisar documentos generados antes del corte final | Media | Informe completo y cheatsheet deben reflejar la versión de release |
| Diagramas | Actualizar gráficos DB exportados | Media | Regenerar al cierre documental final con modelo congelado |
| Release | Definir versión del próximo corte | Media | Evaluar si Fechas Académicas discretas sale como `0.4.8` |
| Adjuntos | Planificar adjuntos de imagen post-release | Media | Valor alto para fotos de pizarrón; debe implementarse sin cargar SQLite ni saturar el feed |
| Backup | Restauracion desde backup `.zip` y Drive API directa | Alta | El backup manual externo ya esta integrado; quedan restauracion controlada y subida directa a Drive como fases futuras |

---

## Alcance Congelado

No incorporar en Hito 05 salvo decisión explícita:

- Agenda completa.
- Notificaciones push.
- Recurrencias, horarios o duración de eventos.
- Sincronización externa.
- Backup automatico en nube dentro del Hito 05; la primera version manual ya quedo integrada.
- Importación automática de backups complejos sin política de merge.
- Tutoriales obligatorios.
- Nuevas capas de organización más allá de Materia / Sección / Nota.

---

## Largo Plazo / Post-Defensa

- [x] Backup manual `.zip` con salida a almacenamiento elegido por el usuario. Validado en Android real mediante share sheet/gestor de archivos; Google Drive queda disponible si esta instalado como destino.
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
- [ ] Aplicar mejoras pequenas y verificables que aumenten cohesion, reduzcan acoplamiento y faciliten revisiones humanas/IA, evitando reescrituras grandes.
- [ ] Restauracion desde backup `.zip`, empezando por importacion no destructiva en una carpeta `Restaurado YYYY-MM-DD`.
- [ ] Sincronización real multi-dispositivo, solo después de validar backup/restauración y con feedback fuerte de adopción.
- [ ] Compartir nota individual con share sheet nativo de Android, solo si se valida que ofrece apps reales como WhatsApp y no duplica la acción Copiar.
- [ ] Google Drive API directa para subir backups a una carpeta elegida o `appDataFolder`, solo después de definir OAuth, scopes y fallback local.
- [ ] Importación de nota individual hacia `Entrada`, dejando merge de materias/secciones para la restauracion de backups.
- [ ] Adjuntos de imagen para notas: permitir tomar o seleccionar fotos de pizarrón, guardar una copia optimizada y una miniatura en storage local de la app, registrar solo metadata/rutas en SQLite, cargar miniaturas de forma lazy y eliminar archivos físicos al vaciar papelera. No guardar imágenes como base64 dentro de `notes.content` ni depender de rutas públicas externas como almacenamiento principal.
- [ ] Ayuda ampliada o mini guía Markdown dentro de una sección `Acerca de/Ayuda`, solo si el feedback demuestra fricción real.
- [ ] Métricas de escritura como contador de palabras/caracteres, solo si aparecen casos de uso académicos concretos.
- [ ] Onboarding o coach marks, solo si la primera release muestra problemas de descubrimiento.

---

## Archivos Históricos

- [`docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md`](docs/gestion/historico/backlog-historico-hito-04-2026-06-01.md): backlog completo antes de la limpieza.
- [`docs/gestion/historico/plan-fechas-academicas-discretas-2026-05-31.md`](docs/gestion/historico/plan-fechas-academicas-discretas-2026-05-31.md): plan operativo completo de Fechas Académicas discretas.
- [`docs/gestion/historico/plan-backup-google-drive-2026-06-03.md`](docs/gestion/historico/plan-backup-google-drive-2026-06-03.md): plan operativo completo del backup manual `.zip` externo.
- [`docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md`](docs/gestion/historico/plan-editor-enriquecido-2026-06-05.md): plan operativo completo del editor enriquecido y slash commands.
- [`docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md`](docs/gestion/historico/plan-borradores-persistentes-2026-06-06.md): plan operativo completo de borradores persistentes del editor.
- [`docs/hitos/hito-04-agosto.md`](docs/hitos/hito-04-agosto.md): informe formal del Hito 04.
- [`CHANGELOG.md`](CHANGELOG.md): registro histórico de cambios por versión.
