# Guía de Contribución — Lumapse

Lumapse es un proyecto académico mantenido con prácticas de ingeniería verificables. Una contribución debe preservar el alcance offline-first, la privacidad local, la trazabilidad y la documentación que se utilizará en la defensa.

Antes de editar, seguir el procedimiento de inicio de [AGENTS.md](./AGENTS.md), tanto
para contribuciones humanas como asistidas por IA. Esta guía define las reglas de
trabajo y aceptación; no reemplaza esa comprobación inicial.

## 1. Antes de cambiar el proyecto

- Una funcionalidad debe responder a un requisito funcional o una historia de usuario de [`docs/producto/`](./docs/producto/).
- Una decisión que cambie arquitectura, persistencia, plataforma o tooling requiere un ADR en [`docs/adr/`](./docs/adr/).
- Los defectos y refactors deben identificar el riesgo que corrigen, sin ampliar silenciosamente el alcance.
- Respetar la [política de alcance del hito](./BACKLOG.md#política-de-alcance--hito-06);
  las funciones postergadas y los refactors amplios no se habilitan por esta guía.
- La documentación actual distingue estado vigente e historia. No se debe presentar PWA/IndexedDB como arquitectura actual ni reescribir los hitos que explican su evolución.

La arquitectura vigente se resume en [ADR-008](./docs/adr/ADR-008-arquitectura-modular-y-patrones.md): monolito modular cliente, Android/Capacitor, SQLite, módulos ES y TypeScript gradual.

## 2. Flujo de trabajo

Mantener **una sola rama de tarea activa**, incluida su revisión. No desarrollar en
`main` ni abrir otro frente antes de integrar y limpiar la rama anterior conforme
al [cierre del PR](#6-pull-request). La sincronización inicial y la decisión de
retomar una rama o partir de `main` se resuelven mediante [AGENTS.md](./AGENTS.md).

Para una tarea nueva, usar un nombre breve en inglés y kebab-case con el prefijo
que describa su propósito: `feat/`, `fix/`, `docs/`, `refactor/`, `test/` o `chore/`.

### Plan acotado por rama

**Una rama y su PR resuelven un único objetivo concreto y verificable.** Una fase
completa o una lista de mejoras independientes no constituye una unidad de trabajo.
El límite no es la cantidad de archivos: cada cambio debe ser necesario para el
mismo resultado y su validación.

Antes de modificar archivos, presentar y acordar con el autor un plan breve:

- **Objetivo:** comportamiento, defecto o entrega puntual que se aborda.
- **Alcance y exclusiones:** qué se puede cambiar y qué queda fuera.
- **Pasos:** acciones específicas necesarias para obtener ese resultado.
- **Pruebas:** verificaciones focalizadas y controles de la [sección 5](#5-verificación);
  para cambios de la app, casos de revisión en dispositivo y artefacto a identificar.
- **Aceptación:** resultado observable y evidencia que revisará el autor.

Los hallazgos ajenos al objetivo se registran en la fuente canónica y se consultan,
sin corregirlos dentro de la misma rama. Si el objetivo exige ampliar el alcance,
detener esa ampliación y acordar un nuevo límite antes de implementarla.

Consultar al autor antes de adoptar cambios de flujo o ajustes operativos no aprobados.
Una propuesta o una idea del backlog no equivale a autorización para desarrollarla.

## 3. Commits

Se utiliza Conventional Commits con el formato:

```text
<tipo>: <descripción breve en minúsculas>
```

Tipos habituales:

- `feat`: funcionalidad visible nueva;
- `fix`: corrección de comportamiento;
- `docs`: cambio exclusivamente documental;
- `refactor`: cambio interno sin alterar funcionalidad;
- `test`: pruebas nuevas o corregidas;
- `style`: formato sin cambio lógico;
- `chore`: mantenimiento de tooling o dependencias.

Los mensajes se escriben en inglés y pueden incluir un scope, por ejemplo
`fix(tooling): validate the canonical runtime`. Hacer commits incrementales por
unidad verificable. La interfaz, la documentación del proyecto y la comunicación
con el autor se mantienen en español; los nombres de ramas y los títulos y
descripciones de PR se escriben en inglés.

El mensaje debe explicar el cambio concreto. La motivación y las consecuencias relevantes pertenecen al cuerpo del commit, al PR o al ADR.

## 4. Reglas técnicas

- La UI no usa un framework: se implementa con módulos ES, JavaScript y TypeScript gradual sobre Vite.
- Una conversión a TypeScript debe reducir un riesgo real y conservar comportamiento; no se migra un módulo solo para aumentar una métrica.
- Los componentes se agrupan por feature según [ADR-007](./docs/adr/ADR-007-organizacion-componentes-por-feature.md).
- La presentación no ejecuta SQL. Persistencia y migraciones permanecen en `src/services/sqlite/`.
- Las funcionalidades principales deben operar sin red. Ningún dato se transmite automáticamente; el usuario puede iniciar de forma explícita la exportación y compartición de un backup.
- Las APIs nativas se aíslan mediante servicios/adaptadores y deben ofrecer dependencias reemplazables cuando el flujo requiera pruebas deterministas.
- No se agrega una dependencia sin justificar costo, seguridad, mantenimiento y comportamiento offline.

## 5. Verificación

Para cambios de código, ejecutar los tests focalizados y el gate completo:

```bash
npm run verify
```

Para documentación pura, como mínimo:

```bash
npm run check:docs
npm run check:traceability
```

Comprobar además los enlaces de los archivos modificados que el auditor no descubre
automáticamente, incluidos `AGENTS.md`, `CONTRIBUTING.md` y `TODO.md`. Los controles
iniciales establecen una referencia previa; repetir las verificaciones pertinentes
sobre el cambio terminado, sin presentar la ejecución anterior como validación final.

Registrar comando, resultado y limitaciones. Separar evidencia local, CI y Android;
para pruebas nativas, identificar dispositivo, artefacto y confirmación del autor.
No declarar requisitos cumplidos con métricas inferidas o casos no ejecutados.

Los cambios Android o de persistencia requieren además pruebas en el entorno correspondiente y evidencia en los checklists de gestión. Un test web no sustituye una validación nativa cuando intervienen SQLite, Filesystem, Network o Share.

Las pruebas automatizadas de `verify` (Node, DOM simulado y SQLite en memoria) no requieren abrir manualmente la app en el navegador. El smoke manual web es auxiliar, no obligatorio para este ciclo Android. Usar el entorno nativo existente para la prueba en el teléfono; no instalar Android Studio solo para intentar validar la web.

Una compilación debug privada autorizada se prueba con el **script habitual**, sin
bump ni publicación por cada cambio. Identificar versión base, canal/origen en Acerca
de, hash del APK y certificado en la evidencia: Git SHA no equivale a identidad binaria.
Un candidato/entrega posterior requiere corte separado, versión/code nuevos y autorización
específica; nunca reemplazar el asset publicado previo. Vite production no acredita una
release. Ver [flujo e identificación Android](./docs/flujo-desarrollo-android.md#identificación-de-compilaciones-en-acerca-de).

### Límites operativos

- No modificar el runtime global para resolver diferencias entre equipos sin
  autorización. Usar el entorno canónico definido en ADR-010.
- Instalación de APK, importación/restauración de datos, terminación de procesos,
  manejo de claves de firma y publicación requieren autorización específica.
  `--clean`, desinstalación y borrado requieren además recuperación acordada: el ZIP no respalda borradores
  ni papelera. Ante firma incompatible, detenerse.
- El teléfono puede estar conectado a otro equipo. Confirmar anfitrión, dispositivo
  y acceso antes de una operación nativa; no asumir disponibilidad local.
- No versionar secretos, keystores, bases personales, logs privados, artefactos
  temporales ni dependencias instaladas.

## 6. Pull Request

Al completar la unidad acordada y sus verificaciones, hacer push y abrir un PR hacia
`main`. Describir objetivo, alcance/exclusiones, pruebas ejecutadas, limitaciones,
pendientes y pasos de revisión. No presentar pruebas previstas como realizadas.

**No hacer merge ni habilitar auto-merge sin autorización explícita del autor.**
La aprobación del plan, un CI verde, la ausencia de comentarios o una prueba exitosa
no constituyen esa autorización. El autor debe revisar el PR y, para cambios de la
app, confirmar los casos acordados en el dispositivo; si falta esa validación,
mantenerla pendiente, sin sustituirla por tests web. Para documentación pura,
corresponden la revisión documental y los controles de la sección anterior, sin
atribuir evidencia Android inexistente.

Antes de solicitar la aprobación, comprobar:

- El alcance sigue limitado al objetivo acordado y tiene trazabilidad cuando corresponde.
- Las verificaciones pertinentes se ejecutaron sobre el cambio final; cualquier
  limitación o prueba pendiente está identificada.
- La documentación refleja solo cambios y resultados reales.
- El título usa Conventional Commits y la descripción contiene lo necesario para revisar.

Tras recibir autorización de merge, comprobar el HEAD actual del PR y sus checks antes
de integrarlo. Si el autor ya hizo el merge, verificar la integración en GitHub.
Actualizar el checkout mediante fetch/pull y eliminar únicamente las ramas de esa
tarea cuya integración esté comprobada y que no contengan trabajo pendiente. Una
rama remota ausente no demuestra un merge; ante squash o dudas, cotejar el PR y sus
cambios antes de borrar. Cerrar con árbol limpio, `main` sincronizado y sin ramas
residuales de la tarea.

---

*Lumapse: Tus notas. En tu equipo. Sin cuenta. Sin internet.*
