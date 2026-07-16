# Requisitos No Funcionales — Lumapse

**Fase Design Thinking:** Idear / Prototipar / Testear
**Formulación inicial:** Abril 2026
**Última revisión:** 2026-07-15
**Autor:** José David Sandoval

> **Nota de evolución:** Estos RNF se definieron originalmente para una PWA con IndexedDB. Después del relevamiento, Lumapse pivotó a una aplicación Android híbrida empaquetada con Capacitor, con persistencia SQLite y distribución por APK ([ADR-005](../adr/ADR-005-pivote-app-nativa.md), [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md)). La revisión conserva los criterios originales, pero distingue cuáles siguen vigentes, cuáles requieren evidencia y cuáles quedaron obsoletos o no aplican al artefacto Android.

---

## Convenciones

- **ID:** `RNF-XXX` (Requisito No Funcional)
- **Categoría:** Clasificación según el modelo de calidad ISO/IEC 25010
- **Métrica:** Criterio de aceptación objetivo y verificable
- **Verificación:** Cómo se valida que el requisito se cumple
- **Estado actual:**
  - `Verificado`: existe evidencia reproducible registrada y se identifica si corresponde a la APK `v0.4.8` o al estado posterior de `main`.
  - `Evidencia parcial`: hay controles o pruebas relacionadas, pero no cubren por completo la métrica original.
  - `Pendiente`: la medición o prueba todavía debe ejecutarse y registrarse.
  - `Obsoleto`: el criterio dependía de la arquitectura PWA reemplazada por ADR-005.
  - `No aplica al APK`: el control pertenece al hosting web, no al artefacto Android distribuido.

> Un build correcto, la ausencia de crashes o una auditoría estática no se consideran por sí solos evidencia suficiente para métricas de tiempo, FPS, contraste, touch targets o pruebas con usuarios.

> El estado se revisa sobre el repositorio al 2026-07-15. La evidencia de `main` posterior al tag no se atribuye automáticamente a la APK publicada `v0.4.8`.

---

## Rendimiento (Performance)

| ID | Requisito original | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-001 | La aplicación debe cargar y ser interactiva en menos de **3 segundos** en una conexión 3G simulada. | TTI ≤ 3s bajo 3G | Obsoleto | La conexión dejó de condicionar el arranque: los assets se incluyen en el APK. El equivalente vigente es apertura offline, cubierto por RNF-009. |
| RNF-002 | El tiempo de respuesta al crear, editar o eliminar una nota no debe superar **200ms**. | Latencia CRUD ≤ 200ms | Pendiente | No hay una medición temporal registrada. Medir sobre el APK y un conjunto de datos definido en Hito 06. |
| RNF-003 | El bundle de producción, sin assets estáticos, no debe superar **500 KB** comprimido. | Bundle ≤ 500 KB gzip | Verificado | `npm run check:size` aplica presupuestos más estrictos mediante `scripts/bundle-budget.sh` y pasó en el gate documentado de `v0.4.8`. |
| RNF-004 | La aplicación debe mantener rendimiento fluido al desplazar un listado con al menos **500 notas**. | FPS ≥ 55 durante scroll | Pendiente | La prueba de `v0.4.8` fue perceptual y con pocas notas; falta una medición reproducible con 500 o más notas. |

---

## Usabilidad

| ID | Requisito | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-005 | Un usuario nuevo debe poder **crear su primera nota en menos de 10 segundos** desde la primera apertura, sin instrucciones previas. | Tiempo a primera nota ≤ 10s | Pendiente | Requiere prueba con usuarios del prototipo. Se traslada explícitamente al Hito 06; la validación Android del autor no sustituye esta medición. |
| RNF-006 | Toda función principal actual (crear, buscar, organizar) debe ser accesible en **máximo 2 taps** desde la pantalla principal. | Profundidad de navegación ≤ 2 | Pendiente | Falta registrar una revisión completa de flujos sobre la interfaz vigente. |
| RNF-007 | La tipografía mínima legible debe ser **16px** en dispositivos móviles. | `font-size` ≥ 16px para texto de lectura/edición | Pendiente | Requiere inspección CSS consolidada y comprobación visual; el checker a11y actual no mide tamaños tipográficos. |
| RNF-008 | Los controles principales deben tener un área táctil mínima de **44x44 px**. | Touch target ≥ 44x44 px | Pendiente | Requiere medición en viewport/dispositivo móvil; el checker estático actual no calcula dimensiones. |

---

## Disponibilidad y Confiabilidad (Reliability)

| ID | Requisito original / vigente | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-009 | La aplicación instalada debe funcionar **100% offline**; en la formulación PWA se expresaba como “después de la primera visita”. | Flujos principales disponibles sin red | Evidencia parcial | VM-02 confirma que la APK `v0.4.8` abre en modo avión y el gate controla que no haya assets remotos; falta repetir y registrar todos los flujos principales sin red. Ver [checklist Android](../gestion/checklist-validacion-android.md). |
| RNF-010 | El trabajo en curso no debe perderse ante pausa, bloqueo, cambio temporal de app o cierre inesperado. | Pérdida de borrador = 0 en flujos principales | Evidencia parcial | `RF-005 / HU-005` cuenta con tests y prueba manual de salida a otra app/PDF y restauración del borrador. Falta cubrir de forma explícita bloqueo y terminación inesperada para satisfacer todo el RNF. |
| RNF-011 | El Service Worker debe cachear todos los assets estáticos. | Cache hit rate = 100% | Obsoleto | Service Worker y `vite-plugin-pwa` fueron eliminados por ADR-005. La disponibilidad offline vigente se obtiene empaquetando assets dentro del APK y se controla mediante RNF-009. |

---

## Seguridad y Privacidad

| ID | Requisito original / vigente | Métrica | Estado actual | Evidencia / siguiente paso |
|---|---|---|---|---|
| RNF-012 | La aplicación no debe transmitir automáticamente datos del usuario a servidores externos. Una exportación iniciada explícitamente por el usuario mediante share sheet no se considera transmisión automática. | Requests automáticos con payload de usuario = 0 | Evidencia parcial | La arquitectura no tiene backend y la auditoría offline bloquea dependencias externas en runtime; falta registrar una captura de tráfico durante los flujos completos. |
| RNF-013 | La aplicación no debe incluir **tracking, analytics ni cookies de terceros**. | Integraciones de tracking de terceros = 0 | Evidencia parcial | No hay una integración de analytics declarada y el runtime se audita para recursos externos; falta conservar un reporte específico del bundle/dependencias para el cierre final. |
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
| RNF-024 | Los tests unitarios deben cubrir al menos el **70%** de la lógica de negocio de servicios. | Coverage de servicios ≥ 70% | Pendiente | La cobertura histórica superó el umbral sobre el scope JavaScript, pero la configuración vigente no incluye `src/**/*.ts`. Debe medirse una nueva línea base antes del cierre final. |
| RNF-025 | El proyecto debe construirse sin errores con `npm run build`. | Exit code = 0 | Verificado | Build y gate local pasaron para el corte `v0.4.8`; el comando también forma parte de CI. |
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
| Verificado | 4 | RNF-003, RNF-018, RNF-023, RNF-025 |
| Evidencia parcial | 7 | RNF-009, RNF-010, RNF-012, RNF-013, RNF-020, RNF-022, RNF-026 |
| Pendiente | 9 | RNF-002, RNF-004 a RNF-008, RNF-019, RNF-021, RNF-024 |
| Obsoleto por pivote | 3 | RNF-001, RNF-011, RNF-017 |
| No aplica al APK | 3 | RNF-014 a RNF-016 |
| **Total** | **26** | |

---

## Evolución del plan de verificación

La planificación inicial asignaba grupos de RNF a los Hitos 03, 04 y 05. El pivote arquitectónico volvió inválidas varias verificaciones basadas en PWA, hosting y Service Worker, y la beta `v0.4.8` aportó evidencia técnica sin completar todas las métricas de usuario, rendimiento y accesibilidad. Por eso el estado de las tablas anteriores reemplaza cualquier inferencia basada únicamente en el hito originalmente asignado.

### Cierre técnico de Hito 05

- Conservar como evidencia verificada los RNF-003, RNF-018, RNF-023 y RNF-025.
- Mantener RNF-009, RNF-010, RNF-012, RNF-013, RNF-020, RNF-022 y RNF-026 como evidencia parcial; no presentarlos como cumplimiento total.
- Registrar que RNF-002, RNF-004, RNF-019 y RNF-024, originalmente vinculados al Hito 05, no tienen todavía la medición completa requerida.
- Tratar RNF-015 como no aplicable al APK, en vez de dejarlo implícitamente pendiente.

### Plan final de Hito 06

1. Medir latencia CRUD y rendimiento con un volumen reproducible de notas (RNF-002, RNF-004).
2. Ejecutar pruebas con usuarios y revisar profundidad de navegación (RNF-005, RNF-006).
3. Auditar tipografía, touch targets, contraste y navegación accesible (RNF-007, RNF-008, RNF-019 a RNF-022).
4. Repetir los flujos principales en modo avión y cubrir bloqueo/terminación inesperada del editor (RNF-009, RNF-010).
5. Registrar tráfico de red y un reporte específico de dependencias/trackers para completar RNF-012 y RNF-013.
6. Incorporar archivos TypeScript al reporte de coverage y volver a medir RNF-024.
7. Confirmar o reformular formalmente los RNF obsoletos/no aplicables, sin reutilizar evidencia PWA como si perteneciera al APK.
8. Emitir una matriz final de cumplimiento con comando, dispositivo, fecha y artefacto para cada verificación realizada.

> Las capturas, resultados y valores finales deben agregarse solo después de ejecutar cada prueba. Este documento no presume cumplimiento donde todavía no existe evidencia.

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
