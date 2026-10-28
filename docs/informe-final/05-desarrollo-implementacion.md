# Capítulo 5: Desarrollo e Implementación

En el capítulo 4 expliqué las decisiones de arquitectura y sus compromisos. En este capítulo desarrollo cómo las materialicé en el código: composición de la interfaz, coordinación del estado, acceso a datos, continuidad de la edición, portabilidad y herramientas de verificación. El propósito no es enumerar archivos, sino mostrar cómo colaboran las piezas para resolver los recorridos del producto.

La implementación descrita corresponde a la fuente de **Lumapse 0.6.0/600 — Release Candidate 1**, identificada en la sección 1.4.4. Su inspección permite explicar mecanismos presentes en el programa, pero no demuestra que todos los recorridos del APK estén validados. Mantengo esa diferencia respecto del capítulo 6, donde corresponde atribuir cada resultado a su método, artefacto y alcance.

## 5.1. Estructura del repositorio y entorno

Organicé código, documentación, configuración nativa y automatización en una misma base versionada. Esto permite relacionar una modificación con sus requisitos y decisiones, sin confundir el código fuente con los archivos generados para distribuirlo.

| Ubicación | Responsabilidad en la implementación |
|---|---|
| `src/components/`, `src/layout/` y `src/styles/` | Componentes, composición visual, navegación y estilos |
| `src/store/` | Estado observable, selección, filtros y coordinación de operaciones |
| `src/domain/` | Contratos y reglas de datos compartidos por servicios y consumidores |
| `src/services/` | Servicios de aplicación, reglas de dominio, SQLite e integraciones nativas |
| `android/` | Proyecto nativo de Capacitor, configuración y construcción Android |
| `public/` | Recursos locales que se incorporan a la salida web |
| `tests/` | Pruebas de aplicación y de herramientas; no sólo pruebas de interfaz |
| `scripts/` y `.github/workflows/` | Controles locales y ejecución remota de tareas automatizadas |
| `docs/` | Requisitos, decisiones, gestión, evidencia e informe académico |

El entorno canónico fija **Node.js 22.20.0 y npm 10.9.3**. La declaración se mantiene coherente entre `.nvmrc`, los campos de entorno de `package.json` y el workflow remoto. El control `check:runtime` rechaza una versión distinta antes de ejecutar la suite; no se interpreta un fallo de un entorno no soportado como un defecto del producto. Esta decisión de reproducibilidad se formaliza en ADR-010.

Vite sirve la aplicación durante el desarrollo y construye los archivos web en `dist/`. Para el entorno SQLite de navegador, `copy-wasm` copia el recurso WebAssembly de `sql.js` a los assets locales: se ejecuta antes de desarrollo y construcción, y después de instalar dependencias. El servidor de desarrollo no es un backend requerido por el APK instalado.

La construcción Android utiliza un JDK, el SDK Android, el wrapper de Gradle y herramientas como ADB y `apksigner`. Android Studio puede facilitar la configuración y la inspección del proyecto, pero el script de despliegue realiza la construcción por línea de comandos. Disponer del entorno web no acredita disponer de esas herramientas ni de un teléfono accesible.

Mantuve JavaScript y adopté TypeScript gradualmente en contratos, reglas y servicios. La configuración utiliza comprobación estricta para TypeScript, sin emitir archivos, pero conserva `checkJs: false`: no convierte todo el JavaScript existente en código comprobado estáticamente. Tampoco los tipos validan por sí solos un JSON importado; esa responsabilidad requiere controles en ejecución.

## 5.2. Capa de presentación y edición

La presentación utiliza DOM, JavaScript, auxiliares TypeScript y CSS, sin un framework de interfaz. Los componentes crean su estructura, conectan eventos y reaccionan a las suscripciones pertinentes. La organización por funcionalidad de ADR-007 mantiene juntas las piezas de cada recorrido; no establece un ciclo de vida uniforme ni elimina la necesidad de liberar listeners y suscripciones.

| Área | Piezas principales y colaboración |
|---|---|
| Edición | `NoteEditor`, captura/restauración de borrador, selector de materia y herramientas Markdown |
| Listado | `NoteList`, auxiliares de tarjetas, filtros visibles y `VirtualFeed` |
| Papelera | Vista de elementos eliminados y control de vigencia de sus lecturas |
| Fechas académicas | `Heatmap`, próximas fechas y diálogos de gestión |
| Respaldo | `BackupView` y controladores que separan preparación, confirmación y feedback |
| Navegación e información | Drawer de materias, cambio de vistas y Acerca de |
| Interacción compartida | Confirmaciones, mensajes y utilidades de presentación defensiva |

El punto de entrada prepara SQLite, hidrata el borrador y carga los datos antes de montar los componentes. Así, el editor no intenta restaurar una edición sobre una base todavía sin inicializar. El límite de arranque muestra un estado accesible y permite reintentar la preparación; ante un montaje parcial, exige cerrar de forma segura la conexión antes de recargar, en lugar de volver a instalar los mismos listeners sobre el documento incompleto.

En el editor separé título, cuerpo y asociación organizativa. Los eventos de entrada actualizan la disponibilidad de `Guardar` o `Actualizar` y capturan el trabajo pendiente. El modo de enfoque cambia la disposición visual; no convierte la edición en un guardado automático. Durante guardado o descarte se bloquean los controles y una comprobación explícita impide repetir la operación mientras está en curso.

Las ayudas de RF-028 modifican el texto Markdown, no un documento de edición visual independiente. El registro tipado de comandos comparte definiciones entre `/` y el menú `+`; `Aa` aplica transformaciones sobre la selección. La continuidad de listas y bloques al pulsar Enter también opera sobre el texto y vuelve a emitir el evento de entrada. Esto mantiene el contenido editable sin exigir utilizar los menús. La representación Markdown se realiza en las tarjetas del listado; el editor no incorpora un panel dividido activo de previsualización.

Para el listado, `NoteList` renderiza directamente hasta 50 notas y utiliza `VirtualFeed` cuando el resultado supera ese umbral. Este último calcula una ventana visible con margen, conserva espaciadores y ajusta las alturas a partir de las tarjetas medidas. Agrupa las actualizaciones de desplazamiento mediante `requestAnimationFrame` y retira sus listeners al destruirse.

La virtualización reduce el conjunto de tarjetas presentes en el DOM, **no la cantidad de notas cargadas desde SQLite**. La lectura vigente recupera las notas activas completas y el filtrado trabaja en memoria: no hay paginación de consultas por ese mecanismo. Su existencia tampoco demuestra un valor de FPS, una latencia ni rendimiento óptimo con 500 notas; esas mediciones conservan sus límites y postergaciones.

## 5.3. Estado observable, filtros y operaciones asíncronas

El store mantiene notas, organización, selecciones, búsqueda, fecha, vistas y cachés académicos. `NoteStore.state.js` utiliza un conjunto de suscriptores: al suscribirse, cada consumidor recibe el estado actual y una función para cancelar la suscripción. Las notificaciones posteriores entregan esa misma referencia de estado; no se trata de un sistema general de instantáneas inmutables.

Dividí la coordinación para hacer visibles responsabilidades distintas:

| Módulo | Responsabilidad |
|---|---|
| `NoteStore.state.js` | Estado base y suscripciones |
| `NoteStore.data.js` | Datos y mutaciones de notas y organización |
| `NoteStore.ui.js` | Navegación, selección y filtros de interfaz |
| `NoteStore.academicEvents.js` | Cargas, mutaciones y cachés de fechas académicas |
| `NoteStore.errors.js` | Publicación de errores de persistencia y propagación del rechazo |
| `NoteStore.refresh.js` | Avisos y recuperación de lecturas posteriores a una escritura confirmada |
| `noteFilters.ts` | Selección y ordenamiento de notas sin manipular el DOM |

La búsqueda normaliza mayúsculas y tildes y compara título y contenido en memoria. En Entrada, materia y vista general, una búsqueda activa recorre globalmente las notas activas no archivadas; no queda limitada a la materia desde la que se abrió. Archivo mantiene su propio ámbito. El filtro de fecha utiliza la última modificación de la nota, `updatedAt`, y no la fecha de un evento académico. El orden prioriza notas fijadas y luego la modificación más reciente. Las notas eliminadas lógicamente ya están excluidas de la carga del listado activo.

Las lecturas asíncronas requieren además comprobar su vigencia. Una respuesta de Papelera no debe reemplazar el contenido de otra vista si el usuario ya salió de ella. Para ese recorrido, un propietario de solicitud combina identidad del consumidor, estado activo y versión de lectura. En las fechas académicas, las versiones de solicitud y una revisión de mutaciones evitan aplicar resultados obsoletos o deshacer cambios confirmados mientras una lectura estaba pendiente. Estos mecanismos corresponden a consumidores concretos, no a una cancelación universal de toda operación asíncrona.

El manejo de errores distingue persistencia y presentación. Cuando una acción envuelta por `runStoreAction` recibe un `DatabaseError`, publica el evento y relanza la excepción. La composición conecta ese canal con el feedback visual; el store no importa el componente de mensajes. Así, un formulario puede conservar sus campos ante el rechazo sin generar por sí mismo un segundo mensaje para el mismo error de persistencia.

Una lectura secundaria fallida tampoco equivale a una escritura fallida. Tras crear una nota, el store conserva la entidad recibida y utiliza `refreshAfterWrite` para actualizar materias y conteos. Si esa lectura falla, ofrece recuperarla sin volver a insertar la nota. La misma frontera se aplica a la creación de fechas y a las extensiones registradas para crear materias y actualizar o eliminar fechas académicas, conforme a ADR-011. Otras mutaciones mantienen contratos distintos; no generalizo este comportamiento a todo el store.

## 5.4. Persistencia, continuidad y respaldo

### 5.4.1. Acceso SQLite y composición de operaciones

La evolución desde IndexedDB y la elección del motor se fundamentan en el capítulo 4. En la implementación vigente, `src/services/sqlite/` concentra conexión, esquema, migraciones y operaciones de notas, materias y fechas. La presentación no ejecuta SQL: utiliza el store o servicios de aplicación. Para notas, el store accede directamente a los módulos SQLite; para organización y fechas intervienen servicios con validaciones propias. No existe una cadena rígida de capas que todas las acciones deban recorrer.

Las operaciones parametrizan los valores de las consultas y transforman filas a contratos de aplicación, por ejemplo convirtiendo marcas enteras a booleanos. El esquema y las migraciones permanecen en `connection.js`. Antes de agregar una columna se consulta `PRAGMA table_info`; su existencia permite omitir el cambio, pero un error inesperado aborta la inicialización. No se ignoran indiscriminadamente los errores de migración.

ADR-009 se materializa en una cola por conexión y un ámbito transaccional explícito, `scope`. Las operaciones que componen una transacción reciben ese ámbito; las independientes esperan su turno. El módulo no entrega la conexión nativa a cualquier consumidor. La resolución externa espera la confirmación y, en el entorno web, la persistencia correspondiente. Ante resultados inciertos de confirmación o fallos de recuperación, la conexión se bloquea hasta recuperar un estado comprobable: no se afirma que cualquier error implique que nada se escribió.

La migración legada desde IndexedDB conserva notas y marcador de migración dentro de una transacción y no reemplaza notas SQLite existentes al reintentar. Es compatibilidad con la etapa anterior, no una segunda autoridad de almacenamiento del producto. El entorno web auxiliar conserva SQLite mediante `jeep-sqlite` y `sql.js`, sin equipararlo al plugin nativo.

### 5.4.2. Borrador y confirmación explícita

La continuidad de RF-005 utiliza un único borrador en `metadata`, bajo la clave `lumapse-editor-draft-v1`. `EditorDraftService` valida y normaliza su formato, mantiene la caché hidratada al iniciar y delega la persistencia en el módulo SQLite. Capturar una edición no crea ni actualiza automáticamente la nota definitiva.

La captura toma una instantánea en cada cambio, sin esperar un intervalo de inactividad. Incluye título, contenido, asociación y, en modo edición, referencia a la nota original. Si esa nota ya no existe al restaurar, el texto pendiente puede recuperarse como borrador de una nota nueva, sin recrear silenciosamente el registro desaparecido.

Guardar desde el editor solicita `flush` de la captura y utiliza la opción `clearDraft`; la cola SQLite ordena las escrituras. El store coordina entonces la escritura de la nota y el marcador JSON `null` en una misma transacción. Ese marcador distingue borrador vacío de fila ausente y evita reimportar un borrador legado ya consumido. Los campos se limpian después de recibir la entidad confirmada; descartar también espera la confirmación de la limpieza. La secuencia y los límites de fallo se desarrollan en la sección 4.5.

SQLite es la autoridad del borrador después de su inicialización. La lectura legada de `localStorage` sólo se considera si falta la fila, no como alternativa cuando falla SQLite. El mecanismo no garantiza la última tecla si el proceso termina antes del commit, ni recuperación ante desinstalación o pérdida del dispositivo. Tampoco el ZIP respalda este trabajo pendiente.

### 5.4.3. Exportación e importación del conjunto de datos

Implementé la portabilidad de RF-017 y RF-018 mediante un formato ZIP propio. La exportación reúne notas confirmadas, materias/secciones y fechas académicas, conserva elementos archivados y excluye la papelera y el borrador. El paquete contiene un manifiesto, JSON con los datos restaurables y notas Markdown organizadas en carpetas para lectura fuera de Lumapse. Los Markdown no sustituyen el contrato JSON ni constituyen un flujo de importación de notas individuales.

La generación utiliza los módulos propios `BackupZipService` y `BackupZipArchive`, con entradas `STORE`, sin compresión. JSZip permanece declarado como dependencia, pero sus importaciones observadas pertenecen a las pruebas, no al generador de producción. La lectura está acotada al formato admitido: inspecciona estructura y límites antes de procesar los JSON, verifica tamaño y CRC32 al leerlos y exige texto UTF-8 válido. Los respaldos históricos `DEFLATE` dependen del soporte de descompresión del WebView. CRC32 permite detectar corrupción del contenido leído, no comprobar identidad del emisor ni autenticidad criptográfica.

La importación separa preparación y confirmación. Primero valida manifiesto, entidades y relaciones, y calcula un plan frente a los datos locales. La interfaz presenta elementos a incorporar, omisiones, renombrados y advertencias; sólo después de la confirmación se aplica el plan mediante inserciones dentro de una transacción. La política no destructiva no equivale a reemplazar íntegramente el workspace ni a una sincronización de cambios entre dispositivos.

La salida nativa también tiene una frontera concreta. `BackupShareService` escribe el archivo en caché mediante Filesystem, obtiene una URI y abre el selector con Share. El ZIP y el selector pueden prepararse sin red; un destino externo puede necesitar conectividad. Abrir o completar ese selector no permite demostrar que un proveedor conservó una copia durable. Por ello, respaldo manual, archivo temporal y sincronización automática no se presentan como capacidades equivalentes.

## 5.5. Procesamiento de Markdown y seguridad de presentación

Markdown conserva el contenido como texto, pero su transformación a HTML introduce una frontera de confianza. El riesgo de *cross-site scripting* (XSS) consiste en que el contenido presentado permita ejecutar código no previsto. Que una nota provenga del mismo dispositivo no vuelve seguro todo su contenido: también puede contener material copiado o importado. Parsear ese texto y sanear el resultado son responsabilidades diferentes.

`MarkdownService` concentra el recorrido de renderizado:

1. Procesa los bloques destacados o *callouts* y convierte el Markdown mediante `marked`, con sintaxis GFM (*GitHub Flavored Markdown*) y saltos de línea habilitados.
2. Sanea el HTML con DOMPurify mediante listas explícitas de etiquetas y atributos permitidos y prohibidos. El HTML admitido por el parser no se considera confiable y también pasa por ese control.
3. Aplica reglas de atributos para enlaces y recursos. En particular, elimina fuentes de imagen HTTP/HTTPS y agrega atributos de apertura a enlaces externos.
4. Reconstruye las casillas de tareas con APIs del DOM, identifica su línea y obtiene su nombre accesible del contenido ya saneado; finalmente serializa el fragmento para presentarlo.

El índice de línea permite que una interacción sobre una casilla modifique la tarea correspondiente en el Markdown. Esa correspondencia también contempla el desplazamiento de líneas cuando el título y el cuerpo se presentan por separado. La lógica de las tarjetas consume el HTML procesado; no implementa otro parser en cada vista.

La sanitización de Markdown no protege automáticamente los demás campos que se interpolan en plantillas. Para títulos, nombres e identificadores utilicé utilidades distintas de escape de texto y atributos. Los colores se validan antes de incorporarlos a estilos. Esta separación responde al contexto de salida: un valor apto como texto no es necesariamente apto como atributo o propiedad visual.

La política CSP del documento de entrada complementa estos controles limitando orígenes de recursos y permitiendo los recursos locales necesarios. Conserva permisos para evaluación de scripts y estilos inline, por lo que no se describe como una prohibición absoluta de ejecución. Los enlaces externos pueden abrirse por acción del usuario; restringir la carga automática de recursos no equivale a impedir toda comunicación externa.

La suite contiene casos de Markdown válido, contenido peligroso, atributos, casillas y regresiones específicas del sanitizador. Esos casos comprueban contratos automatizados en su entorno, no ausencia universal de XSS ni falta de tráfico en el APK. La evidencia de seguridad y sus límites corresponden al capítulo 6, sin convertir esta descripción del mecanismo en una certificación.

## 5.6. Empaquetado Android e identificación del artefacto

Capacitor integra los archivos web con un proyecto Android y conecta capacidades nativas mediante plugins (Ionic, s. f.). En Lumapse, `webDir` apunta a `dist/`: Vite produce esos archivos y la sincronización los incorpora al proyecto nativo. Gradle construye el APK. La interfaz sigue ejecutándose en una WebView; ni la construcción optimizada de Vite ni la sincronización crean por sí solas una entrega firmada y publicada.

El despliegue de desarrollo distingue construcción e instalación. Conforme a ADR-013, el script realiza la siguiente secuencia:

1. Identifica el dispositivo y construye la salida web con canal de debug declarado.
2. Sincroniza el proyecto Android y compila mediante el wrapper de Gradle.
3. Verifica el APK con `apksigner` y, si hay una instalación previa en modo normal, comprueba la igualdad de sus certificados de firma.
4. Instala con ADB sin desinstalar previamente y comprueba el éxito explícito antes de abrir la actividad.

Si faltan medios para verificar la firma, ésta difiere o Android rechaza la actualización, el modo normal se detiene. No delega la instalación en un mecanismo que reintente mediante desinstalación. La opción `--clean` es una operación destructiva separada, no una reparación automática: elimina datos locales y requiere autorización y recuperación acordadas. Un ZIP no recupera el borrador ni la papelera que esa operación elimina.

Acerca de muestra versión y procedencia de construcción. Los metadatos distinguen servidor de desarrollo, prueba optimizada y canales Android declarados, e incluyen el commit y el estado conocido de las fuentes. No demuestran firma, publicación ni identidad binaria: el hash del APK y su certificado deben registrarse por separado. Tampoco el paso de CI que construye los assets web produce automáticamente el candidato de presentación.

El corte entregable sigue siendo la RC1 identificada en la sección 1.4.4, con aceptación parcial y desarrollo congelado. Describir el script y los metadatos no significa volver a ejecutarlo, recompilar ese artefacto o completar sus pruebas diferidas. La reproducción de una build y la aceptación de un binario son actividades distintas.

## 5.7. Licenciamiento y continuidad académica

Publiqué el código del proyecto con el texto de la GNU GPL versión 3 y la declaración `GPL-3.0-or-later` en los metadatos del paquete. Esta elección permite que el trabajo pueda estudiarse, modificarse y reutilizarse bajo sus condiciones, en lugar de quedar limitado a una demostración cerrada.

La GPLv3 permite el uso y la modificación privada sin exigir publicar cada cambio. Al redistribuir código o una obra cubierta, establece condiciones de conservación de avisos y de acceso al código fuente correspondiente; no basta entregar un ejecutable sin atender esas obligaciones (Free Software Foundation, 2007). La declaración del proyecto no reemplaza los avisos y condiciones de sus dependencias.

En el contexto académico, busco facilitar que futuras cohortes comprendan tanto la solución como sus decisiones y límites. Un repositorio público y una licencia libre habilitan esa posibilidad, pero no prueban que exista una comunidad de contribuidores, adopción institucional o mantenimiento futuro asegurado.

## 5.8. Integración continua y control automatizado

Utilicé integración continua para ejecutar comprobaciones reproducibles sobre cambios versionados y ofrecer un resultado remoto revisable. La definición vigente supera la separación anterior entre una lista local y otra remota: **`npm run verify` y el workflow de CI ejecutan el mismo gate canónico**, establecido en ADR-010 y mantenido en `scripts/quality.sh`.

### 5.8.1. Entorno y entrada común

El workflow `CI — Quality Gate` se activa ante pushes a `main` y eventos de pull request cuya base es `main`; no ante todo push a cualquier rama por el mero hecho de existir. Prepara Node desde `.nvmrc`, configura Python 3.12, comprueba el entorno antes de instalar e instala las dependencias mediante `npm ci`, usando el archivo de bloqueo. Después invoca literalmente `npm run verify`.

El siguiente fragmento reproduce los tres pasos finales de esa configuración, no un workflow completo:

```yaml
- name: Verificar entorno canónico
  run: npm run check:runtime
- name: Instalar dependencias
  run: npm ci
- name: Ejecutar gate canónico completo
  run: npm run verify
```

El punto de entrada local delega en ese mismo script. Compartir la definición evita mantener dos listas divergentes; no significa que un equipo local y el runner remoto tengan idénticos sistema operativo, recursos o integraciones nativas. Tampoco la ejecución local depende de que exista un hook de Git instalado o un binario auxiliar en una máquina particular.

### 5.8.2. Controles y criterio de fallo

El gate comprueba primero el runtime y luego coordina lint, pruebas de herramientas, suite de aplicación, validación de su reporte, construcción web, tipos y guardias técnicas/documentales. Las herramientas aportan evidencias de naturaleza diferente:

| Control | Qué comprueba y cuál es su límite |
|---|---|
| ESLint | Analiza JS y TS de `src/` con reglas apropiadas a cada lenguaje, sin corregir archivos mediante `--fix`; advertencias no equivalen a errores bloqueantes |
| Pruebas de herramientas y Vitest | Ejecutan escenarios automatizados; la suite de aplicación utiliza el entorno DOM simulado y sus adaptadores de prueba, no el plugin Android instalado |
| Construcción y tipos | Detectan problemas de empaquetado web y contratos estáticos; no producen una APK firmada ni validan todos los valores recibidos en ejecución |
| Versión, base y esquema | Contrastan versiones y aspectos del esquema, ejecutan un smoke SQLite y revisan su representación DBML; cada control conserva un alcance parcial |
| Bundle, diálogos, jerarquía y accesibilidad | Aplican presupuestos y reglas automatizables; una auditoría estática no certifica experiencia de uso o accesibilidad completa |
| Trazabilidad, enlaces, toolchain y offline | Buscan inconsistencias y referencias inválidas o remotas; no comprueban por sí solos la veracidad de un resultado, todos los enlaces posibles ni el tráfico efectivo |

La aceptación de Vitest no se basa sólo en leer un resumen de consola. Se exige salida normal con código cero y un reporte JSON nuevo, completo y coherente con los archivos esperados. El validador rechaza omisiones, duplicados, casos pendientes o totales inconsistentes; la ejecución impide `.only`. Un crash no se acepta porque antes haya impreso resultados exitosos. El gate utiliza un worker para acotar memoria, sin reducir la suite a un subconjunto.

Los controles posteriores agregan sus resultados y un fallo mantiene el resultado global como fallido. Los diagnósticos de tamaño y complejidad conservan advertencias orientativas, sin convertir en advertencia un error de ejecución de la herramienta. La medición de cobertura y las auditorías de dependencias son comprobaciones separadas: no se atribuyen automáticamente a cada ejecución de `verify`.

### 5.8.3. Relación entre automatización y aceptación

El valor de este mecanismo está en hacer explícitos los criterios comprobables, reducir diferencias accidentales entre ejecuciones y asociar resultados a una revisión concreta. Es un mecanismo de control, no una medida general de madurez ni una prueba de ausencia de errores. Un resultado correcto tampoco garantiza el comportamiento de todas las combinaciones de datos o del puente nativo.

La revisión documental, la ejecución de CI, la comprobación Android y la aceptación del artefacto son niveles distintos. El análisis de resultados del capítulo 6 complementa esta descripción distinguiendo controles del candidato, pruebas históricas de otros debugs y recorridos diferidos de la RC1. Así, la implementación explica qué mecanismos existen y cómo colaboran, sin convertir posibilidades de prueba o controles automatizados en resultados que no fueron obtenidos.
