# Capítulo 6: Pruebas y Validación

## 6.1. Estrategia de Testing

La estrategia de pruebas de Lumapse combina validaciones automatizadas, pruebas unitarias, smoke tests nativos, auditorías documentales y pruebas manuales en dispositivo. Dado que el proyecto tiene alcance académico y una sola persona desarrolladora, la estrategia prioriza alto impacto y reproducibilidad por encima de una cobertura exhaustiva difícil de sostener.

El enfoque se organiza en capas:

| Capa | Objetivo | Herramientas |
|---|---|---|
| Lint | Detectar errores sintácticos, variables no definidas y malas prácticas. | ESLint |
| Unit tests | Verificar servicios, store, filtros y componentes críticos en JavaScript y TypeScript gradual. | Vitest |
| Build | Confirmar que el proyecto compila para producción. | Vite |
| Auditorías técnicas | Validar bundle, a11y estática, schema, DBML y jerarquía. | Scripts locales |
| Auditorías documentales | Validar links internos y trazabilidad RF/HU/ADR. | Scripts Python |
| Android smoke tests | Confirmar paquete nativo y contexto básico. | Gradle/JUnit |
| Pruebas manuales | Verificar flujos reales en dispositivo. | Android físico, scrcpy |

El comando principal de verificación local es `npm run verify`, que encadena el quality gate y auditorías adicionales. En CI, GitHub Actions ejecuta el workflow `CI — Quality Gate` ante cada push o pull request sobre `main`.

Para la beta controlada `v0.4.8`, el gate final se ejecutó sin fallos bloqueantes antes de publicar el APK firmado en GitHub Releases. La evidencia operativa queda registrada en `CHANGELOG.md`, `TODO`, `docs/hitos/hito-05-septiembre.md` y `docs/gestion/checklist-validacion-android.md`.

## 6.2. Pruebas Unitarias

Las pruebas unitarias se implementan con Vitest. Cubren principalmente lógica de negocio y reglas de estado, porque son las zonas donde un error puede afectar datos del usuario o romper flujos centrales.

Los módulos actualmente cubiertos incluyen:

- `MarkdownService`: renderizado y sanitización de Markdown.
- `ThemeService`: persistencia y alternancia de tema visual.
- Servicios SQLite: conexión, errores, notas y materias.
- `SubjectService`: validaciones de jerarquía, nombres, CRUD y papelera.
- `NoteStore`: carga, mutación de datos y acciones de UI.
- `noteFilters`: reglas de visibilidad y filtrado.
- Componentes críticos: confirmación, routing de acciones de feed y papelera.

La suite unitaria permite sostener cambios internos sin depender exclusivamente de pruebas manuales. Esto fue especialmente importante durante la migración a SQLite, la implementación de papelera y la consolidación de materias/secciones, porque esas áreas afectan persistencia, visibilidad y recuperación de datos.

Al corte `v0.4.8`, y nuevamente sobre la fuente documental actual, la suite local registra 773 tests unitarios distribuidos en 53 archivos y pasando dentro del flujo `npm run verify`.

El repositorio dispone de `npm run test:coverage`, pero la configuración vigente toma como línea base únicamente archivos `src/**/*.js` y no define umbrales bloqueantes. Por ello, el número de tests aporta evidencia de amplitud y regresión, pero no debe confundirse con una cobertura completa de la migración gradual a TypeScript. Incorporar archivos `.ts`, registrar una línea base estable y recién después decidir umbrales permanece como mejora de calidad.

## 6.3. Pruebas de Integración y Funcionamiento Offline

El funcionamiento offline se valida desde varias perspectivas:

- Los assets principales se empaquetan dentro del APK, por lo que la app instalada no depende de red para abrir.
- Las notas y materias se persisten localmente en SQLite.
- El proyecto incluye auditorías para detectar dependencias externas no deseadas o diálogos nativos no permitidos.
- La persistencia se verifica con pruebas unitarias sobre servicios SQLite y con pruebas manuales en dispositivo.

En Android se reemplazaron los smoke tests de plantilla por pruebas bajo el paquete real `com.lumapse.app`. Estas pruebas no validan todavía toda la UI, pero sí evitan conservar referencias de plantilla y confirman que el paquete nativo básico corresponde al proyecto.

Además, los scripts `check:schema`, `check:dbml` y `check:subjects` cumplen una función de integración documental y técnica: comparan tablas, columnas, tipos y relaciones configuradas, y validan las reglas de jerarquía de materias. No sustituyen una revisión exhaustiva de índices, restricciones `CHECK`, acciones referenciales ni comportamiento real en Android. El smoke test ejecuta el DDL completo, pero sus aserciones explícitas de columnas y relaciones todavía se concentran en `subjects`, `notes` y `metadata`; `academic_events` debe incorporarse a esa cobertura antes de presentar el smoke como exhaustivo.

Las pruebas manuales en dispositivo siguen siendo necesarias para validar escenarios que no se capturan completamente en Node o en CI: instalación del APK, primer uso, modo avión, persistencia tras cerrar la app, restauración desde papelera, archivado, navegación táctil y rendimiento percibido.

La beta `v0.4.8` fue validada inicialmente el 2026-07-01 en un Samsung Galaxy S20 FE (`SM-G780G`) con Android 13. Esa ejecución cubrió instalación limpia, apertura offline, creación/edición/persistencia de notas, materias y secciones, búsqueda, pin/archivo, estados académicos, fechas discretas, papelera, tema, rotación/responsivo y rendimiento percibido (VM-01 a VM-14). El resultado fue apto para beta controlada, con observaciones UX menores.

Exportar e importar ZIP cuenta con una ejecución Android separada del 2026-06-18 sobre un Samsung `SM-G965F`, Android 10 y un build previo de la rama `feature/importar-backup-zip` (`a1be7c9`, `versionName=1.0`). Esa evidencia confirma el flujo en un corte anterior, pero no se atribuye al S20 FE ni al APK firmado `v0.4.8`. Hito 06 exige repetirlo dentro de la checklist del artefacto final elegido.

## 6.4. Validación de Rendimiento y UX

La validación de rendimiento y UX se apoya en métricas objetivas y revisión manual. En el estado actual del proyecto se verifican automáticamente el build de producción y el presupuesto de bundle, ya que el tamaño final impacta directamente en una app orientada a celulares con recursos limitados.

Las validaciones actuales incluyen:

- `npm run build`: confirma que la aplicación compila sin errores bloqueantes.
- `npm run check:size`: controla que el bundle no exceda presupuestos definidos.
- `npm run check:a11y`: ejecuta auditoría estática de accesibilidad.
- `npm run check:native-dialogs`: bloquea `alert`, `confirm` y `prompt` nativos fuera del seeder.
- Revisión manual de flujos mobile-first en dispositivo Android.
- Publicación de `v0.4.8` como beta controlada con APK firmado y SHA-256 documentado.

Quedan pendientes para el cierre documental final y Hito 06 pruebas más cercanas al usuario final: medición de tiempo hasta crear la primera nota, revisión fina de contraste y navegación táctil, comportamiento con mayor volumen real de notas y feedback de estudiantes sobre el prototipo instalado.

El build vigente finaliza con código 0, por lo que satisface el criterio explícito de `RNF-025` (construcción sin errores). Vite informa advertencias no bloqueantes sobre módulos importados de forma estática y dinámica; se registran como deuda de empaquetado y deben revisarse, pero no se reinterpretan como errores ni cambian retroactivamente el criterio del requisito.

## 6.5. Alcance de la Evidencia y Validación Pendiente

La evidencia reunida permite calificar `v0.4.8` como beta controlada instalable y funcional en el dispositivo probado. No permite generalizar todavía el mismo resultado a todo el parque Android ni afirmar una validación integral de accesibilidad, seguridad, rendimiento y experiencia de usuario.

Los límites principales son:

- La auditoría `check:a11y` es estática; no sustituye Lighthouse, lector de pantalla, navegación táctil real ni revisión manual completa de contraste. La evaluación final debe tomar WCAG 2.2 como referencia, sin declarar conformidad hasta comprobar los criterios aplicables con métodos automáticos y humanos (World Wide Web Consortium [W3C], 2024).
- Los smoke tests Gradle verifican el paquete y el contexto nativo básico, no los flujos completos de UI ni una prueba end-to-end del APK.
- La prueba Python con 5.000 notas es sintética, compara dos estrategias aisladas y no mide CPU ni renderizado Android. La revisión en dispositivo se realizó con un volumen acotado; falta una medición reproducible con un conjunto realista y criterios temporales definidos.
- El reporte de cobertura todavía excluye TypeScript y no existe un umbral acordado para convertirlo en gate.
- El workflow remoto y `npm run verify` no ejecutan exactamente los mismos pasos; conviene alinear al menos typecheck y smoke test de base de datos cuando sean portables en CI.
- `quality.sh` puede usar un binario Rust compilado para la plataforma y, si no está disponible, recurrir a scripts de compatibilidad. Un resultado exitoso en macOS no prueba por sí solo ambos caminos; la portabilidad requiere compilar o distribuir el auditor por plataforma y verificar el fallback en un checkout limpio.
- La revisión periódica de dependencias y vulnerabilidades debe conservar evidencia propia; sanitizar Markdown reduce el riesgo XSS, pero no reemplaza el mantenimiento de las bibliotecas involucradas.

Estos puntos no reabren el alcance funcional de la beta: delimitan con precisión qué está validado y qué debe cerrarse como evidencia técnica o prueba de usuario en el siguiente hito.

La validación final no debe limitarse a que el código compile. Para que Lumapse cumpla su objetivo, debe demostrar que una persona puede instalarla, abrirla sin conexión, crear una nota rápidamente, encontrarla después, organizarla por materia y confiar en que no se pierde.
