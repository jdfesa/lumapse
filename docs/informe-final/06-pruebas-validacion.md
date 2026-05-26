# Capítulo 6: Pruebas y Validación

## 6.1. Estrategia de Testing

La estrategia de pruebas de Lumapse combina validaciones automatizadas, pruebas unitarias, smoke tests nativos, auditorías documentales y pruebas manuales en dispositivo. Dado que el proyecto tiene alcance académico y una sola persona desarrolladora, la estrategia prioriza alto impacto y reproducibilidad por encima de una cobertura exhaustiva difícil de sostener.

El enfoque se organiza en capas:

| Capa | Objetivo | Herramientas |
|---|---|---|
| Lint | Detectar errores sintácticos, variables no definidas y malas prácticas. | ESLint |
| Unit tests | Verificar servicios, store, filtros y componentes críticos. | Vitest |
| Build | Confirmar que el proyecto compila para producción. | Vite |
| Auditorías técnicas | Validar bundle, a11y estática, schema, DBML y jerarquía. | Scripts locales |
| Auditorías documentales | Validar links internos y trazabilidad RF/HU/ADR. | Scripts Python |
| Android smoke tests | Confirmar paquete nativo y contexto básico. | Gradle/JUnit |
| Pruebas manuales | Verificar flujos reales en dispositivo. | Android físico, scrcpy |

El comando principal de verificación local es `npm run verify`, que encadena el quality gate y auditorías adicionales. En CI, GitHub Actions ejecuta el workflow `CI — Quality Gate` ante cada push o pull request sobre `main`.

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

## 6.3. Pruebas de Integración y Funcionamiento Offline

El funcionamiento offline se valida desde varias perspectivas:

- Los assets principales se empaquetan dentro del APK, por lo que la app instalada no depende de red para abrir.
- Las notas y materias se persisten localmente en SQLite.
- El proyecto incluye auditorías para detectar dependencias externas no deseadas o diálogos nativos no permitidos.
- La persistencia se verifica con pruebas unitarias sobre servicios SQLite y con pruebas manuales en dispositivo.

En Android se reemplazaron los smoke tests de plantilla por pruebas bajo el paquete real `com.lumapse.app`. Estas pruebas no validan todavía toda la UI, pero sí evitan conservar referencias de plantilla y confirman que el paquete nativo básico corresponde al proyecto.

Además, los scripts `check:schema`, `check:dbml` y `check:subjects` cumplen una función de integración documental y técnica: verifican que el schema SQLite documentado, el DBML derivado del código y las reglas de jerarquía de materias no diverjan.

Las pruebas manuales en dispositivo siguen siendo necesarias para validar escenarios que no se capturan completamente en Node o en CI: instalación del APK, primer uso, modo avión, persistencia tras cerrar la app, restauración desde papelera, archivado, navegación táctil y rendimiento percibido.

## 6.4. Validación de Rendimiento y UX

La validación de rendimiento y UX se apoya en métricas objetivas y revisión manual. En el estado actual del proyecto se verifican automáticamente el build de producción y el presupuesto de bundle, ya que el tamaño final impacta directamente en una app orientada a celulares con recursos limitados.

Las validaciones actuales incluyen:

- `npm run build`: confirma que la aplicación compila sin errores.
- `npm run check:size`: controla que el bundle no exceda presupuestos definidos.
- `npm run check:a11y`: ejecuta auditoría estática de accesibilidad.
- `npm run check:native-dialogs`: bloquea `alert`, `confirm` y `prompt` nativos fuera del seeder.
- Revisión manual de flujos mobile-first en dispositivo Android.

Quedan pendientes para el cierre del Hito 05 y el Hito 06 pruebas más cercanas al usuario final: medición de tiempo hasta crear la primera nota, prueba de uso en modo avión, revisión de contraste y navegación táctil en dispositivo real, y feedback de estudiantes sobre el prototipo instalado.

La validación final no debe limitarse a que el código compile. Para que Lumapse cumpla su objetivo, debe demostrar que una persona puede instalarla, abrirla sin conexión, crear una nota rápidamente, encontrarla después, organizarla por materia y confiar en que no se pierde.
