# Requisitos No Funcionales — Lumapse

**Fase Design Thinking:** Idear / Prototipar / Testear
**Formulación inicial:** Abril 2026
**Última revisión:** 2026-10-22 — [revisión precorte](../gestion/revision-precorte-2026-10-22.md): observaciones clasificadas, corrección localizada de contraste y parches de tooling; aceptación del autor pendiente. RNF-026 verificado documentalmente por inventario de decisiones y ADR retrospectivos identificados; RNF-020 conserva evidencia parcial. No acredita el candidato final ni modifica las postergaciones de RNF-002/004/005.
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
> temporal/FPS ni a rendimiento óptimo demostrado. Esa decisión no posterga otros RNF.

> **Ajuste aprobado (2026-10-12):** [flujo de corte y feedback](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa):
> RNF-005 se evalúa después del APK de presentación, sin bloquear corte, congelación
> ni entrega. Conserva estado pendiente y umbral ≤10 s; la encuesta voluntaria no
> acredita tiempos ni obliga a corregir. Los demás RNF conservan su tratamiento.

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
| RNF-005 | Un usuario nuevo debe poder **crear su primera nota en menos de 10 segundos** desde la primera apertura, sin instrucciones previas. | Tiempo a primera nota ≤ 10s | Pendiente | Sin medición con participantes nuevos; [evidencia previa y límites](../gestion/validacion-usabilidad-navegacion-2026-10-07.md). Por [decisión del autor del 2026-10-12](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa), evaluación posterior al corte APK, no bloqueante para congelación o entrega. Feedback voluntario no verifica ≤10 s; el estado y umbral se conservan. |
| RNF-006 | Toda función principal actual (crear, buscar, organizar) debe ser accesible en **máximo 2 taps** desde la pantalla principal. | Profundidad de navegación ≤ 2 | Verificado | Crear queda visible en 0 taps; buscar y organizar se alcanzan en 2 taps en el debug `0.5.0/500` sobre Samsung SM-G965F. La evidencia cubre profundidad de entrada, no éxito de mutaciones ni adopción. [Registro de casos](../gestion/validacion-usabilidad-navegacion-2026-10-07.md). |
| RNF-007 | La tipografía mínima legible debe ser **16px** en dispositivos móviles. | `font-size` ≥ 16px para texto de lectura/edición | Verificado | [Medición, revisión visual y aceptación del 2026-10-09](../gestion/validacion-tipografia-rnf-007-2026-10-09.md): editor/feed, Markdown y modo enfoque ≥16 CSS px en debug `f2beef7`, Samsung SM-G965F. Preview comprobado como componente aislado, no vista activa. Excluye controles/metadatos y otros RNF; PR #36 aceptado por el autor, sin transferencia al candidato final. |
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
| RNF-019 | La formulación web exige score mínimo **90/100 en Lighthouse Accessibility**. | Lighthouse Accessibility ≥ 90 | Verificado | [Medición del 2026-10-20](../gestion/validacion-lighthouse-rnf-019-2026-10-20.md): 40 snapshots Lighthouse 13.5.0, 96–100/100 en ambos temas del WebView real del debug `92deffd`, Samsung SM-G965F. Etiquetas corregidas con autorización y datos conservados. Verificado técnicamente para esa métrica/alcance, con observaciones de controles cubiertos y revisión incompleta registradas; no certifica WCAG/TalkBack ni el APK final. El autor aprobó [PR #40](https://github.com/jdfesa/lumapse/pull/40) y autorizó merge/limpieza; aceptación general sin nuevas pruebas por caso. La [clasificación precorte](../gestion/revision-precorte-2026-10-22.md) está documentada; aceptación expresa de sus límites pendiente. |
| RNF-020 | Los elementos interactivos deben poder operarse por teclado cuando la superficie/dispositivo ofrece teclado. | Flujo navegable con Tab, Enter y Escape | Evidencia parcial | [Revisión del 2026-10-19](../gestion/validacion-teclado-rnf-020-2026-10-19.md): 16 casos PASS sobre Samsung SM-G965F/debug `538c906` con Tab/Enter/Escape por ADB y Shift+Tab complementario por CDP. Se corrigieron barreras reproducidas, conservando datos/borrador. No hubo teclado físico ni ensayo completo de mutaciones; no certifica flujo completo, otros dispositivos ni el APK final. El autor revisó y aprobó [PR #39](https://github.com/jdfesa/lumapse/pull/39) y autorizó merge/limpieza; aceptación general sin nuevas pruebas por caso, conservando los límites registrados. |
| RNF-021 | Los colores deben cumplir contraste mínimo **4.5:1** para texto normal. | Ratio ≥ 4.5:1 | Verificado | [Medición y aceptación del 2026-10-12](../gestion/validacion-contraste-rnf-021-2026-10-12.md) en Samsung SM-G965F/debug `803947e`: 208 fixtures y 174 muestras de recorridos, ambos temas ≥4,5:1, con alfa/opacidad compuestos. Estados hover reproducidos mediante CSS del APK en fixtures, no hover físico. Verificado solo en el alcance registrado; PR #37 aceptado por el autor, sin nuevas pruebas por caso ni acreditar otros RNF o el APK final. El [precorte](../gestion/revision-precorte-2026-10-22.md#debug-definitivo-y-comprobación-posterior-a-la-recuperación) añade el hover visible de «Agregar fecha» en debug `e0700f6`: 8,82:1 oscuro/6,29:1 claro; aceptación del autor pendiente. |
| RNF-022 | Imágenes informativas y controles sin texto visible deben tener alternativa accesible. | Elementos relevantes sin nombre accesible = 0 | Verificado | [Inventario AX, revisión manual y límites del 2026-10-13](../gestion/validacion-nombres-accesibles-rnf-022-2026-10-13.md): 24 escenas/2188 muestras sin nombres vacíos o de símbolo solo en Samsung SM-G965F/debug `b7c3d31`; nombres de propósito y decoración revisados, datos conservados. Verificado técnicamente en ese alcance; el autor aceptó [PR #38](https://github.com/jdfesa/lumapse/pull/38) y autorizó merge/limpieza, sin nuevas pruebas por caso. No certifica contenido arbitrario, TalkBack, teclado/Lighthouse ni el candidato final. |

---

## Mantenibilidad

| ID | Requisito | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-023 | El código debe seguir una **estructura modular** con separación clara entre componentes, servicios y estilos. | Fronteras de módulo explícitas y responsabilidades acotadas | Verificado | La estructura por feature y la estrategia gradual están documentadas en ADR-007; servicios, store, UI y estilos mantienen carpetas diferenciadas. |
| RNF-024 | Los tests unitarios deben cubrir al menos el **70%** de la lógica de negocio de servicios. | Coverage de servicios ≥ 70% | Verificado | [Medición del precorte, 2026-10-22](../gestion/revision-precorte-2026-10-22.md#verificación-del-cambio): `npm run test:coverage -- --maxWorkers=1 --allowOnly=false`, 96,06% de statements (2095/2181) en 42 archivos de `src/services/**`, JS/TS y subdirectorios incluidos. Supera el 70%; repetir en la fuente candidata, sin atribuir el porcentaje al parche CSS/tooling. |
| RNF-025 | El proyecto debe construirse sin errores con `npm run build`. | Exit code = 0 | Verificado | Build, gate local y CI pasaron para el corte `v0.5.0`; el comando forma parte del workflow remoto. |
| RNF-026 | Toda decisión arquitectónica significativa debe documentarse mediante ADR. | ADR trazable por decisión significativa | Verificado | [Inventario revisado el 2026-10-22](../adr/README.md#revisión-de-trazabilidad-precorte--2026-10-22): doce ADR contrastados con decisiones, rutas e historia hasta `7adea77`; no se encontró una decisión significativa inventariada sin ADR. ADR-013 añade la decisión de despliegue seguro autorizada durante este precorte. Formalizaciones retrospectivas ADR-008/009 y límites temporales explícitos; no demuestra que todos precedieran a implementar ni acredita un APK nuevo. |

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
| Verificado | 16 | RNF-003, RNF-006 a RNF-010, RNF-012, RNF-013, RNF-018, RNF-019, RNF-021 a RNF-026 |
| Evidencia parcial | 1 | RNF-020 |
| Pendiente | 3 | RNF-002, RNF-004, RNF-005 |
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
2. **Posterior al corte APK, no bloqueante:** recoger feedback voluntario de usuarios (RNF-005), sin esperar respuestas para congelar, preparar manual/informe o entregar. La métrica ≤10 s permanece pendiente sin medición específica. Conservar la revisión técnica ya verificada de profundidad de RNF-006, sin reabrirla ni inferir adopción.
3. RNF-019 tiene [40 snapshots Lighthouse 96–100/100](../gestion/validacion-lighthouse-rnf-019-2026-10-20.md) sobre el WebView del debug `92deffd`, ambos temas y umbral conservado, con observaciones/límites documentados. El autor aprobó [PR #40](https://github.com/jdfesa/lumapse/pull/40) y autorizó merge/limpieza; aceptación general sin nuevas pruebas por caso. La [clasificación precorte](../gestion/revision-precorte-2026-10-22.md) está documentada; aceptación expresa de sus límites pendiente. No acredita accesibilidad exhaustiva ni otro binario. La [revisión acotada de RNF-020](../gestion/validacion-teclado-rnf-020-2026-10-19.md) completó 16 casos de navegación; conserva evidencia parcial, sin teclado físico ni mutaciones completas. El autor revisó y aprobó [PR #39](https://github.com/jdfesa/lumapse/pull/39) y autorizó merge/limpieza, sin nuevas pruebas por caso ni autorización del APK final. `RNF-022` tiene [nombres/alternativas verificados técnicamente en el debug `b7c3d31`](../gestion/validacion-nombres-accesibles-rnf-022-2026-10-13.md), con aceptación general del autor en [PR #38](https://github.com/jdfesa/lumapse/pull/38), integración/limpieza autorizadas y alcance explícito, sin nuevas pruebas por caso. `RNF-021` tiene [contraste verificado técnicamente en el debug `803947e` y aceptación del autor en PR #37](../gestion/validacion-contraste-rnf-021-2026-10-12.md). `RNF-007` quedó verificado y aceptado en [la evidencia de PR #36](../gestion/validacion-tipografia-rnf-007-2026-10-09.md); `RNF-008` quedó verificado en [la medición Android del 2026-10-08](../gestion/validacion-touch-targets-rnf-008-2026-10-08.md). No extrapolar esas evidencias al APK final.
4. OFF-01–05 de RNF-009 verificados en el debug `348da88` y aceptados por el autor en PR #31. RNF-010 conserva su aceptación y evidencia sin repetir la tarea. La validación de un nuevo candidato final se acuerda por separado.
5. RNF-012/013 tienen [captura runtime y revisión de trackers completadas el 2026-10-07](../gestion/validacion-trafico-trackers-2026-10-07.md); repetir sobre el APK candidato. La revisión de dependencias del precorte no sustituye esa captura.
6. [Completado 2026-08-21] Incorporar archivos TypeScript al reporte de coverage y volver a medir RNF-024; repetir la medición en el commit candidato para incorporarla a la matriz final.
7. [Confirmado 2026-10-22] RNF-001/011/017 obsoletos y RNF-014/015/016 no aplicables al APK según ADR-005/006; sin reformular umbrales ni reutilizar evidencia PWA.
8. [Completado 2026-10-22] Revisar inventario de decisiones significativas/ADR y distinguir formalizaciones retrospectivas (RNF-026); no reconstruir fechas.
9. Emitir una matriz final de cumplimiento con comando, dispositivo, fecha y artefacto para cada verificación realizada.

> Las capturas, resultados y valores finales deben agregarse solo después de ejecutar cada prueba. Este documento no presume cumplimiento donde todavía no existe evidencia.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
