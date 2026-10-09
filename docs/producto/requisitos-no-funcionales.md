# Requisitos No Funcionales — Lumapse

**Fase Design Thinking:** Idear / Prototipar / Testear
**Formulación inicial:** Abril 2026
**Última revisión:** 2026-10-09 — RNF-007 verificado en el alcance de lectura/edición del debug identificado; revisión del autor pendiente. RNF-009/010 conservan sus cierres y RNF-002/RNF-004 siguen diferidos
**Autor:** José David Sandoval

> **Nota de evolución:** Estos RNF se definieron originalmente para una PWA con IndexedDB. Después del relevamiento, Lumapse pivotó a una aplicación Android híbrida empaquetada con Capacitor, con persistencia SQLite y distribución por APK ([ADR-005](../adr/ADR-005-pivote-app-nativa.md), [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md)). La revisión conserva los criterios originales, pero distingue cuáles siguen vigentes, cuáles requieren evidencia y cuáles quedaron obsoletos o no aplican al artefacto Android.

---

## Convenciones

- **ID:** `RNF-XXX` (Requisito No Funcional)
- **Categoría:** Clasificación según el modelo de calidad ISO/IEC 25010
- **Métrica:** Criterio de aceptación objetivo y verificable
- **Verificación:** Cómo se valida que el requisito se cumple
- **Estado actual:**
  - `Verificado`: existe evidencia reproducible registrada y se identifica el tag, artefacto o estado de fuente al que corresponde.
  - `Evidencia parcial`: hay controles o pruebas relacionadas, pero no cubren por completo la métrica original.
  - `Pendiente`: la medición o prueba todavía debe ejecutarse y registrarse.
  - `Obsoleto`: el criterio dependía de la arquitectura PWA reemplazada por ADR-005.
  - `No aplica al APK`: el control pertenece al hosting web, no al artefacto Android distribuido.

> Un build correcto, la ausencia de crashes o una auditoría estática no se consideran por sí solos evidencia suficiente para métricas de tiempo, FPS, contraste, touch targets o pruebas con usuarios.

> La base publicada es el tag `v0.5.0` (`5840755`). La evidencia posterior identifica su propio artefacto: RNF-010 corresponde al debug `dbc8940` aceptado en PR #29; RNF-009, al debug `348da88`, aceptado en PR #31. No son el APK firmado de GitHub. Las validaciones no se transfieren automáticamente entre binarios.

> **Seguimiento F3:** [protocolo y matriz incremental](../beta-core-validation/README.md)
> preparados con perfiles reproducibles de 50/500 notas e integración SQLite local.
> RNF-002/RNF-004 continúan sin métricas nuevas. [OFF-01–05 de RNF-009](../beta-core-validation/offline-2026-10-06.md)
> pasaron en el debug identificado, incluida corrección del ZIP local offline; el autor aceptó [PR #31](https://github.com/jdfesa/lumapse/pull/31) y autorizó merge/limpieza.
> [Diagnóstico RNF-010 del 2026-10-04](../beta-core-validation/continuidad-2026-10-04.md):
> Fallos de WebStorage corregidos y matriz SQLite PASS el 2026-10-05; el autor confirmó el teléfono y aprobó el cierre de PR #29. RNF-010 verificado en ese alcance.

> **Prioridad vigente (2026-10-04):** por [decisión del autor](../../BACKLOG.md#rendimiento-post-presentación),
> RNF-002/RNF-004 quedan **Pendientes, post-presentación**, sin bloquear la entrega
> por falta de métricas. Funcionamiento satisfactorio no equivale a cumplimiento
> temporal/FPS ni a rendimiento óptimo demostrado. No se posterga el resto de los RNF.

---

## Rendimiento (Performance)

| ID | Requisito original | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-001 | La aplicación debe cargar y ser interactiva en menos de **3 segundos** en una conexión 3G simulada. | TTI ≤ 3s bajo 3G | Obsoleto | La conexión dejó de condicionar el arranque: los assets se incluyen en el APK. El equivalente vigente es apertura offline, cubierto por RNF-009. |
| RNF-002 | El tiempo de respuesta al crear, editar o eliminar una nota no debe superar **200ms**. | Latencia CRUD ≤ 200ms | Pendiente | Sin muestras temporales aceptadas. Medición sobre APK/perfiles definidos diferida a [post-presentación](../../BACKLOG.md#rendimiento-post-presentación); no bloqueante por esta ausencia. |
| RNF-003 | El bundle de producción, sin assets estáticos, no debe superar **500 KB** comprimido. | Bundle ≤ 500 KB gzip | Verificado | `npm run check:size` aplica presupuestos más estrictos mediante `scripts/bundle-budget.sh` y pasó en el gate final de `v0.5.0`. |
| RNF-004 | La aplicación debe mantener rendimiento fluido al desplazar un listado con al menos **500 notas**. | FPS ≥ 55 durante scroll | Pendiente | Importación funcional de 500 notas aprobada, sin FPS aceptados. Medición reproducible diferida a [post-presentación](../../BACKLOG.md#rendimiento-post-presentación); no bloqueante por esta ausencia. |

---

## Usabilidad

| ID | Requisito | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-005 | Un usuario nuevo debe poder **crear su primera nota en menos de 10 segundos** desde la primera apertura, sin instrucciones previas. | Tiempo a primera nota ≤ 10s | Pendiente | La validación acotada del 2026-10-07 no incluyó participantes nuevos ni midió tiempo; requiere una prueba con usuarios del prototipo. [Evidencia y límites](../gestion/validacion-usabilidad-navegacion-2026-10-07.md). |
| RNF-006 | Toda función principal actual (crear, buscar, organizar) debe ser accesible en **máximo 2 taps** desde la pantalla principal. | Profundidad de navegación ≤ 2 | Verificado | Crear queda visible en 0 taps; buscar y organizar se alcanzan en 2 taps en el debug `0.5.0/500` sobre Samsung SM-G965F. La evidencia cubre profundidad de entrada, no éxito de mutaciones ni adopción. [Registro de casos](../gestion/validacion-usabilidad-navegacion-2026-10-07.md). |
| RNF-007 | La tipografía mínima legible debe ser **16px** en dispositivos móviles. | `font-size` ≥ 16px para texto de lectura/edición | Verificado | [Medición y revisión visual del 2026-10-09](../gestion/validacion-tipografia-rnf-007-2026-10-09.md): editor/feed, Markdown y modo enfoque ≥16 CSS px en debug `f2beef7`, Samsung SM-G965F. Preview comprobado como componente aislado, no vista activa. Excluye controles/metadatos y otros RNF; revisión del autor pendiente, sin transferencia al candidato final. |
| RNF-008 | Los controles principales deben tener un área táctil mínima de **44x44 px**. | Touch target ≥ 44x44 px | Verificado | Medición CDP de `getBoundingClientRect()` sobre el debug `0.5.0/500` en Samsung SM-G965F: encabezado, búsqueda, materias, composer, guardado y 31 opciones de materia alcanzan ≥44×44 CSS px. [Evidencia y límites](../gestion/validacion-touch-targets-rnf-008-2026-10-08.md). |

---

## Disponibilidad y Confiabilidad (Reliability)

| ID | Requisito original / vigente | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-009 | La aplicación instalada debe funcionar **100% offline**; en la formulación PWA se expresaba como “después de la primera visita”. | Flujos principales disponibles sin red | Verificado | [OFF-01–05 PASS, 2026-10-06](../beta-core-validation/offline-2026-10-06.md) en Samsung SM-G965F/debug `348da88`, modo avión y sin red: notas, organización, papelera, fechas y ZIP local con importación/reimportación. Integridad y datos previos conservados. Autor aceptó [PR #31](https://github.com/jdfesa/lumapse/pull/31); no se transfiere al asset publicado ni al candidato final. |
| RNF-010 | El trabajo en curso no debe perderse ante pausa, bloqueo, cambio temporal de app o cierre inesperado. | Pérdida de borrador = 0 en flujos principales | Verificado | [SQLite: migración, CON-01–04 y limpieza PASS, aceptados por el autor](../beta-core-validation/continuidad-2026-10-04.md) en debug `dbc8940`; repetición nativa a 285 ms PASS y cierre aprobado en PR #29. Verificado en los casos/artefacto registrados: no garantiza la última tecla antes del commit ni equivale a apagado físico. |
| RNF-011 | El Service Worker debe cachear todos los assets estáticos. | Cache hit rate = 100% | Obsoleto | Service Worker y `vite-plugin-pwa` fueron eliminados por ADR-005. La disponibilidad offline vigente se obtiene empaquetando assets dentro del APK y se controla mediante RNF-009. |

---

## Seguridad y Privacidad

| ID | Requisito original / vigente | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-012 | La aplicación no debe transmitir automáticamente datos del usuario a servidores externos. Una exportación iniciada explícitamente por el usuario mediante share sheet no se considera transmisión automática. | Requests automáticos con payload de usuario = 0 | Verificado | [Captura runtime y contadores UID, 2026-10-07](../gestion/validacion-trafico-trackers-2026-10-07.md): 0 bytes nuevos atribuibles a Lumapse durante los flujos capturados; la exportación explícita se canceló sin destino. Repetir sobre el APK candidato final. |
| RNF-013 | La aplicación no debe incluir **tracking, analytics ni cookies de terceros**. | Integraciones de tracking de terceros = 0 | Verificado | [Inventario estático y captura runtime, 2026-10-07](../gestion/validacion-trafico-trackers-2026-10-07.md): sin SDK declarado ni tráfico atribuible al UID de Lumapse durante la corrida. Repetir sobre el APK candidato final. |
| RNF-014 | El sitio debe servirse exclusivamente sobre **HTTPS** en producción. | Certificado TLS válido | No aplica al APK | El producto distribuido no es un sitio alojado: el runtime se ejecuta localmente dentro de la APK. HTTPS sigue siendo deseable para el canal de descarga, pero no verifica el runtime. |
| RNF-015 | Los headers web `X-Content-Type-Options` y `X-Frame-Options` deben estar presentes. | Headers presentes en response | No aplica al APK | No existe una respuesta HTTP de producción que controlar. La CSP local y la configuración del WebView son controles distintos; el criterio debe reformularse si se define un RNF nativo equivalente. |

---

## Portabilidad

| ID | Requisito original / vigente | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-016 | La aplicación debe funcionar en los últimos dos major de Chrome, Firefox, Safari y Edge. | Funcionalidad completa en cuatro navegadores | No aplica al APK | La beta distribuida tiene Android como plataforma objetivo. La simulación web sigue siendo herramienta de desarrollo, pero la paridad multinavegador no es criterio de aceptación del APK. |
| RNF-017 | La aplicación debe ser instalable como PWA en Android, iOS y desktop. | Prompt PWA disponible | Obsoleto | La distribución vigente es APK Android mediante Capacitor; `RF-021` también quedó obsoleto por ADR-005. |
| RNF-018 | Las notas incluidas en una exportación local deben conservar un formato `.md` estándar y legible. | Markdown abre en editores de texto comunes | Verificado | El backup `RF-017 / HU-030` genera Markdown legible y fue inspeccionado dentro del ZIP. Compartir una nota individual (`RF-016`) continúa postergado. |

---

## Accesibilidad

| ID | Requisito original / vigente | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-019 | La formulación web exige score mínimo **90/100 en Lighthouse Accessibility**. | Lighthouse Accessibility ≥ 90 | Pendiente | No existe un resultado Lighthouse vigente registrado para la beta. En Hito 06 se debe ejecutar sobre la superficie web equivalente o reemplazar formalmente la métrica por una validación adecuada al APK. |
| RNF-020 | Los elementos interactivos deben poder operarse por teclado cuando la superficie/dispositivo ofrece teclado. | Flujo navegable con Tab, Enter y Escape | Evidencia parcial | Hay componentes y tests focalizados de foco/teclado, pero no una prueba manual del flujo completo. |
| RNF-021 | Los colores deben cumplir contraste mínimo **4.5:1** para texto normal. | Ratio ≥ 4.5:1 | Pendiente | Falta una medición consolidada de ambos temas. La inspección visual no sustituye una herramienta de contraste. |
| RNF-022 | Imágenes informativas y controles sin texto visible deben tener alternativa accesible. | Elementos relevantes sin nombre accesible = 0 | Evidencia parcial | `npm run check:a11y` inspecciona imágenes, botones y `tabindex`, pero es un checker estático acotado; falta revisión manual final. |

---

## Mantenibilidad

| ID | Requisito | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-023 | El código debe seguir una **estructura modular** con separación clara entre componentes, servicios y estilos. | Fronteras de módulo explícitas y responsabilidades acotadas | Verificado | La estructura por feature y la estrategia gradual están documentadas en ADR-007; servicios, store, UI y estilos mantienen carpetas diferenciadas. |
| RNF-024 | Los tests unitarios deben cubrir al menos el **70%** de la lógica de negocio de servicios. | Coverage de servicios ≥ 70% | Verificado | `npm run test:coverage` incluye `src/**/*.{js,ts}`. La medición del 2026-08-21 sobre la fuente actual registró 92,43% de statements (1538/1664) en los 31 archivos de `src/services/**`; debe repetirse en el commit candidato para la matriz final. |
| RNF-025 | El proyecto debe construirse sin errores con `npm run build`. | Exit code = 0 | Verificado | Build, gate local y CI pasaron para el corte `v0.5.0`; el comando forma parte del workflow remoto. |
| RNF-026 | Toda decisión arquitectónica significativa debe documentarse mediante ADR. | ADR trazable por decisión significativa | Evidencia parcial | Existe un conjunto trazable de ADRs y la auditoría valida sus referencias, pero el cierre final debe revisar que no haya decisiones significativas sin ADR y distinguir los ADRs retrospectivos. |

---

## Resumen por categoría

| Categoría | Cantidad | IDs |
|---|---|---|
| Rendimiento | 4 | RNF-001 a RNF-004 |
| Usabilidad | 4 | RNF-005 a RNF-008 |
| Disponibilidad | 3 | RNF-009 a RNF-011 |
| Seguridad | 4 | RNF-012 a RNF-015 |
| Portabilidad | 3 | RNF-016 a RNF-018 |
| Accesibilidad | 4 | RNF-019 a RNF-022 |
| Mantenibilidad | 4 | RNF-023 a RNF-026 |
| **Total** | **26** | |

## Resumen por estado actual

| Estado | Cantidad | IDs |
|---|---:|---|
| Verificado | 12 | RNF-003, RNF-006 a RNF-010, RNF-012, RNF-013, RNF-018, RNF-023 a RNF-025 |
| Evidencia parcial | 3 | RNF-020, RNF-022, RNF-026 |
| Pendiente | 5 | RNF-002, RNF-004, RNF-005, RNF-019, RNF-021 |
| Obsoleto por pivote | 3 | RNF-001, RNF-011, RNF-017 |
| No aplica al APK | 3 | RNF-014 a RNF-016 |
| **Total** | **26** | |

---

## Evolución del plan de verificación

La planificación inicial asignaba grupos de RNF a los Hitos 03, 04 y 05. El pivote arquitectónico volvió inválidas varias verificaciones basadas en PWA, hosting y Service Worker. Las betas `v0.4.8` y `v0.5.0` aportan evidencia técnica sin completar todas las métricas de usuario, rendimiento y accesibilidad; por eso el estado de las tablas anteriores reemplaza cualquier inferencia basada únicamente en el hito originalmente asignado.

### Cierre técnico de Hito 05 (histórico)

- Conservar como evidencia verificada los RNF-003, RNF-018, RNF-023 y RNF-025.
- Mantener RNF-009, RNF-010, RNF-012, RNF-013, RNF-020, RNF-022 y RNF-026 como evidencia parcial; no presentarlos como cumplimiento total.
- Registrar que RNF-002, RNF-004, RNF-019 y RNF-024, originalmente vinculados al Hito 05, no tienen todavía la medición completa requerida.
- Tratar RNF-015 como no aplicable al APK, en vez de dejarlo implícitamente pendiente.

**Seguimiento posterior:** RNF-010 pasó de evidencia parcial a verificado en Hito 06,
con la APK debug SQLite identificada y aceptada en [PR #29](https://github.com/jdfesa/lumapse/pull/29).
El listado histórico anterior no es una tarea por repetir.

### Plan final de Hito 06

1. **Diferido a post-presentación:** medir latencia CRUD/FPS con un volumen reproducible de notas (RNF-002, RNF-004); emitir la matriz de entrega con estos requisitos pendientes y la postergación explícita, sin afirmar cumplimiento.
2. Ejecutar pruebas con usuarios y revisar profundidad de navegación (RNF-005, RNF-006).
3. Auditar tipografía, contraste y navegación accesible (RNF-007, RNF-019 a RNF-022). `RNF-008` quedó verificado en [la medición Android del 2026-10-08](../gestion/validacion-touch-targets-rnf-008-2026-10-08.md).
4. OFF-01–05 de RNF-009 verificados en el debug `348da88` y aceptados por el autor en PR #31. RNF-010 conserva su aceptación y evidencia sin repetir la tarea. La validación de un nuevo candidato final se acuerda por separado.
5. Registrar tráfico de red y un reporte específico de trackers durante los flujos completos para completar RNF-012 y RNF-013. La revisión de dependencias del 2026-10-07 quedó documentada en el [parche de Capacitor](../gestion/validacion-parche-capacitor-2026-10-07.md), pero no sustituye la captura de runtime.
6. [Completado 2026-08-21] Incorporar archivos TypeScript al reporte de coverage y volver a medir RNF-024; repetir la medición en el commit candidato para incorporarla a la matriz final.
7. Confirmar o reformular formalmente los RNF obsoletos/no aplicables, sin reutilizar evidencia PWA como si perteneciera al APK.
8. Emitir una matriz final de cumplimiento con comando, dispositivo, fecha y artefacto para cada verificación realizada.

> Las capturas, resultados y valores finales deben agregarse solo después de ejecutar cada prueba. Este documento no presume cumplimiento donde todavía no existe evidencia.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
