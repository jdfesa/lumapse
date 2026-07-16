# Capítulo 7: Conclusiones

## 7.1. Cumplimiento de Objetivos

El objetivo general se considera **cumplido para el alcance de una beta controlada**: Lumapse materializa una aplicación móvil offline-first que permite capturar, organizar y recuperar notas de estudio sin cuenta ni conexión obligatoria, y el proceso queda respaldado por relevamiento, requisitos, decisiones arquitectónicas, código versionado, pruebas y documentación. Esta conclusión no equivale todavía al cierre académico definitivo ni a declarar una versión estable para todo público.

| Objetivo específico | Evidencia alcanzada | Evaluación |
|---|---|---|
| Relevar necesidades del público objetivo y revisar las hipótesis iniciales. | Encuesta con 120 respuestas válidas, análisis cuantitativo y pivote documentado de PWA a aplicación Android local-first. | Cumplido. |
| Formalizar alcance, usuarios, requisitos y decisiones trazables. | Personas, problem statement, RF/RNF, historias de usuario, decisiones de producto, ADRs, backlog y changelog versionados. | Cumplido, con revisión documental final en curso. |
| Diseñar una solución offline y orientada al uso móvil. | Arquitectura Capacitor + SQLite, UI mobile-first, persistencia local y funcionamiento sin red para los flujos principales. | Cumplido para el dispositivo y los escenarios validados. |
| Implementar el núcleo de captura y organización académica. | Editor Markdown, borradores persistentes, búsqueda, materias/secciones, archivo, papelera, fechas académicas, tema, Acerca de y portabilidad manual mediante backup/importación `.zip`. | Cumplido para `v0.4.8`. |
| Preparar una distribución Android verificable. | APK firmado, hash SHA-256, pre-release publicada y validación inicial en un Samsung Galaxy S20 FE con Android 13. | Cumplido como beta controlada. |
| Incorporar calidad automatizada y validación reproducible. | `npm run verify`, 773 tests unitarios, typecheck, build, auditorías técnicas/documentales y checklist manual Android. | Cumplido parcialmente: quedan límites de cobertura, accesibilidad, rendimiento, seguridad y equivalencia CI/local explicitados en el Capítulo 6. |
| Producir documentación académica defendible. | Documentación viva por capítulos, diagramas fuente y trazabilidad dentro del repositorio. | Cumplido como corpus versionado, con gráficos DB incorporados; el Hito 06 completa revisión editorial, consolidación de evidencias y maquetación. |

En términos del Hito 05, las fases de congelamiento de la versión, generación y firma del APK, validación en Android, publicación y sincronización documental de la beta quedaron completadas. El hito se considera cerrado. En Hito 06 ya se incorporaron los gráficos finales de base de datos; el hito continúa activo para la revisión editorial y de maquetación, la consolidación de evidencias no funcionales y la preparación de la defensa, sin reabrir por defecto el alcance funcional de `v0.4.8`.

## 7.2. Lecciones Aprendidas

A lo largo del desarrollo de Lumapse, se produjeron situaciones no planificadas que
obligaron a tomar decisiones técnicas y metodológicas que, en retrospectiva, resultaron
ser las experiencias de aprendizaje más valiosas del proyecto. A continuación se
documentan las más significativas.

### 7.2.1. Gestión de riesgos técnicos: la estimación PERT como herramienta de decisión

La migración de la aplicación web (PWA) a una aplicación Android híbrida con Capacitor fue una decisión
de alto riesgo técnico. No se trataba de agregar una funcionalidad nueva, sino de cambiar
la base sobre la cual el sistema entero se ejecutaba. Para gestionar este riesgo se
aplicó la técnica de estimación PERT (Program Evaluation and Review Technique), según el material metodológico utilizado por la cátedra (Gómez, 2014; Parada, 2026), asignando
tres escenarios —optimista, más probable y pesimista— exclusivamente a los módulos
críticos: la integración de Capacitor y la migración de IndexedDB a SQLite.

**Lección:** La estimación formal no es solo un requisito académico; es una herramienta
que obliga a pensar en los escenarios de fracaso antes de escribir la primera línea de
código. Gracias a la estimación PERT, se identificó que la integración de Capacitor
podía extenderse hasta 14 días en el peor caso, lo que permitió planificar el hito
con holgura suficiente. Sin esta estimación, el desvío habría sido una sorpresa.

> **Referencia:** [`docs/gestion/estimacion-pert.md`](../gestion/estimacion-pert.md)

### 7.2.2. Adaptación del entorno de pruebas: hardware limitado como oportunidad

El dispositivo principal de desarrollo (Samsung Galaxy S7 Edge) tenía el módulo de
pantalla dañado: no mostraba imagen alguna. En lugar de descartarlo, se configuró un
flujo de trabajo alternativo utilizando **scrcpy**, una herramienta open source que
proyecta la pantalla del dispositivo Android en la computadora de desarrollo a través
de USB.

El comando utilizado (`scrcpy --turn-screen-off -K`) permitía:

- Ver la pantalla del celular en una ventana de macOS.
- Enviar toques y texto desde el teclado de la computadora.
- Apagar la pantalla física del dispositivo para ahorrar batería.

**Lección:** Los recursos limitados no son un impedimento si se buscan soluciones
creativas. Un dispositivo con la pantalla rota se convirtió en una estación de
debugging dedicada, aislada de los datos personales del teléfono principal, que podía ser formateada y
reinstalada sin afectar ese entorno personal. Esta restricción forzó a documentar exhaustivamente el
flujo de trabajo de compilación y despliegue
([`docs/flujo-desarrollo-android.md`](../flujo-desarrollo-android.md)),
lo cual terminó beneficiando la reproducibilidad del proyecto.

### 7.2.3. Estimación retroactiva vs. prospectiva: el sesgo de confirmación

Durante los Hitos 02 y 03, la estimación de Story Points se realizó de forma
**retroactiva**: primero se desarrollaron las funcionalidades y luego se les asignó
un valor en puntos. Este enfoque, si bien es pragmático para proyectos en marcha,
introduce un sesgo de confirmación: se tiende a asignar valores que confirman la
velocidad deseada, en lugar de reflejar la complejidad real.

A partir del Hito 04, se adoptó la práctica de estimar **antes** del inicio del
desarrollo, lo que permite contrastar la estimación con la realidad y generar datos
de velocidad realmente útiles para la planificación futura.

**Lección:** La estimación que no puede equivocarse no sirve. El valor de estimar
no está en acertar, sino en poder medir cuánto nos desviamos y por qué. La honestidad
en la documentación de los desvíos es más valiosa que un reporte "perfecto" que no
refleje la realidad.

> **Referencia:** [`docs/gestion/seguimiento-velocidad.md`](../gestion/seguimiento-velocidad.md)

### 7.2.4. Documentación viva vs. documentación muerta

Una de las decisiones más importantes del proyecto fue mantener toda la documentación
en formato Markdown dentro del repositorio Git, en lugar de escribirla en documentos
Word o PDF separados. Esto tuvo consecuencias profundas:

- **Versionamiento:** Cada cambio en la documentación tiene un commit asociado con
  fecha, autor y motivo. Es posible ver cómo evolucionó cualquier decisión en el tiempo.
- **Trazabilidad:** Los documentos se referencian entre sí mediante enlaces relativos
  (`[ver ADR-005](../adr/ADR-005-pivote-app-nativa.md)`), lo que permite navegar la
  documentación como un sistema interconectado.
- **Mantenimiento:** Al vivir junto al código, la documentación puede actualizarse en el
  mismo flujo de trabajo. Esto reduce el riesgo de desincronización entre "lo que dice el
  documento" y "lo que hace el código", aunque no elimina la necesidad de revisiones
  periódicas, como demuestra la corrección de métricas y estados realizada en este corte.

**Lección:** La documentación más completa del mundo es inútil si nadie la mantiene.
Al integrar la documentación en el flujo de Git (commit → push → review), se reduce
la fricción y se conserva la historia de los cambios. El costo de documentar también
disminuye cuando el trabajo se realiza incrementalmente, aunque antes de cada corte sigue
siendo necesaria una revisión transversal de métricas, alcance y evidencias.

## 7.3. Trabajo Futuro y Posibles Mejoras

El trabajo futuro se organiza por prioridad para evitar que una lista abierta de ideas impida cerrar incrementos terminados. El Hito 05 ya está cerrado: algunos puntos corresponden al Hito 06 documental y otros al backlog post-beta; ninguno debe convertirse automáticamente en una nueva funcionalidad.

### 7.3.1. Cierre documental y de calidad

Las tareas inmediatas corresponden al cierre del trabajo ya realizado:

- Tras la reconciliación transversal y la incorporación de las figuras DB completadas el 2026-07-15, consolidar la evidencia final, verificar los metadatos pendientes de los materiales de cátedra, ejecutar la revisión de congelamiento y regenerar el informe ensamblado.
- Confirmar en la maquetación PDF y en las diapositivas que las imágenes conceptual y lógica ya verificadas sean legibles, especialmente el formato panorámico del modelo conceptual; el DDL y la representación del campo `title` ya coinciden con la implementación vigente.
- Alinear los requisitos no funcionales con evidencia reproducible: revisar las advertencias no bloqueantes del build como deuda separada de `RNF-025`, ampliar coverage a TypeScript antes de fijar umbrales, verificar la portabilidad del auditor local y acercar el workflow remoto al alcance de `npm run verify`.
- Mantener evidencia de revisión de dependencias y seguridad, y completar pruebas de accesibilidad, rendimiento con volumen realista y uso con estudiantes. Estas pruebas deben distinguir resultados automáticos, sintéticos y manuales.
- Preparar materiales de defensa y, cuando el contenido quede congelado, convertir Markdown a LaTeX/PDF como capa de presentación, sin crear una segunda fuente de verdad.
- Calcular el factor de ajuste real entre estimación y esfuerzo registrado, y convertir sus desvíos en recomendaciones concretas para futuros proyectos individuales; esta medición permanece pendiente hasta consolidar la evidencia temporal del cierre.

### 7.3.2. Mejoras posteriores a la beta

Las observaciones de la validación Android sugieren revisar primero la interacción **Mover a** si la fricción vuelve a reproducirse y medir el comportamiento con feeds más extensos. También pueden evaluarse, con evidencia de uso:

- Compartir una nota individual mediante la hoja nativa; el backup vigente ya exporta contenido legible organizado por materia o sección.
- Importar archivos Markdown individuales sin confundir ese flujo con la restauración completa de un respaldo.
- Incorporar búsqueda FTS5, estadísticas académicas mínimas, contador de palabras o una ayuda breve, siempre que aporten valor sin volver pesada la experiencia de captura.
- Extender el backup hacia Drive API directa o restauración/merge avanzado; la beta ya ofrece salida a destinos externos mediante share sheet/gestor de archivos y un recordatorio local acotado.
- Continuar la migración gradual a TypeScript archivo por archivo, priorizando contratos y módulos puros; el store y los componentes DOM grandes deben abordarse solo con un plan incremental y pruebas focalizadas.

### 7.3.3. Evolución de largo plazo

La sincronización multidispositivo, un backend, la colaboración o la publicación en tiendas requieren otra etapa de investigación. Antes de implementarlas se debería validar demanda real, política de privacidad, resolución de conflictos, costos de infraestructura y experiencia offline. El principio rector es preservar la propuesta que originó Lumapse: una herramienta local, rápida y comprensible para estudiantes, no una plataforma generalista de productividad.

## 7.4. Cierre

Lumapse demuestra que un proyecto académico puede producir a la vez un incremento de software utilizable y evidencia profesional del proceso que lo originó. Su aporte no reside solamente en el APK: incluye el relevamiento que modificó la dirección del producto, las decisiones registradas, la arquitectura local-first, la disciplina de pruebas y la capacidad de reconocer límites sin ocultarlos.

La beta `v0.4.8` constituye un punto de cierre concreto: está empaquetada, firmada, publicada y validada inicialmente en Android real. El producto todavía admite mejoras y la entrega académica conserva tareas editoriales, pero esas tareas ya pueden separarse del núcleo funcional y priorizarse en un hito posterior. Concluir de forma responsable no significa vaciar el backlog, sino congelar un alcance coherente, demostrar qué funciona, documentar qué falta y evitar que nuevas ideas diluyan una entrega verificable.

En ese sentido, el resultado principal del proyecto es doble. Para el estudiante usuario, Lumapse ofrece una herramienta simple y disponible sin conexión para conservar y organizar conocimiento. Para la formación profesional, deja una experiencia completa de análisis, adaptación, diseño, implementación, validación y cierre incremental que puede ser auditada y continuada sobre evidencia versionada.
