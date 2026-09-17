# Filtros visibles del feed — 2026-09-15

**Estado:** cerrado; regresiones automáticas y prueba Android aprobadas por el autor,
con PR #18 integrado en `main` mediante `3898db8` el 2026-09-16.
**Base:** `7dc105c`, después del merge de PR #17.
**HEAD probado:** `1ffa7f33723dc800968259036405ed4524835ae9`.
**Checkpoint funcional:** `d481b8a`; documentación final del PR: `1ffa7f3`.

## Problema y selección

El [backlog](../../BACKLOG.md#deuda-técnica-viva) registra una confusión real con
500 notas: cerrar el calendario oculta el único indicador de fecha, pero conserva
el filtro al elegir materia/sección. El feed puede quedar vacío mientras el menú
muestra el total. No es pérdida de datos ni un problema de persistencia.

Se elige este pendiente de alta prioridad, no una F4 del plan anterior. El autor
informó que probó y fusionó PR #17; su rama local se eliminó después de comprobar
que su árbol completo era idéntico al squash en `main`. Esa aceptación no se
extiende al nuevo cambio de interfaz ni cierra las mediciones cuantitativas F3.

## Alternativas comparadas

| Alternativa | Ventaja | Riesgo / decisión |
|---|---|---|
| Limpiar fecha al navegar | Evita algunas combinaciones vacías | Cambia silenciosamente la intención de consultar un día entre materias y no explica la fecha antes de navegar. No elegida. |
| Resumen persistente con filtros removibles | Expone fecha y búsqueda fuera del calendario/drawer, conserva el alcance y permite quitar cada restricción | Agrega una franja solo cuando hay filtros; exige nombres de alcance honestos y controles accesibles. **Elegida.** |
| Recalcular los conteos del menú | Alinea números con parte de los resultados | Cambia el significado del total, amplía lógica y no explica por sí sola el filtro. No elegida; aclarar que los conteos son totales sin filtrar. |

## Contrato de la solución

- Resumen antes de las tarjetas, fuera del contenedor reemplazado por `VirtualFeed`;
  visible con el calendario cerrado, en feed vacío, normal y virtualizado.
- Mostrar fecha sin conversión horaria (`DD/MM/YYYY` a partir del día ISO); mantiene
  la regla existente de fecha de actualización UTC, sin reinterpretar el día.
- Mostrar el alcance efectivo: Entrada, materia con secciones, sección con su
  materia, notas activas o Archivadas. Con búsqueda en Entrada/materia/todas,
  indicar **búsqueda global en notas activas**, no resultados solo de esa materia.
- Fecha y búsqueda se quitan individualmente con botones explícitos. No cambiar
  materia/sección, datos, selección de nota, conteos ni el otro filtro. Al quitar
  búsqueda, reflejar el estado en el input del drawer y cancelar su debounce viejo;
  una notificación ajena no debe borrar texto que todavía se está escribiendo.
- Sin franja cuando no hay filtros efectivos ni en Papelera, Backup o Acerca de.
  Esas vistas conservan el estado; al volver al feed, reaparecen los filtros.
- Texto seguro mediante APIs DOM, botones nativos de al menos 44 px, foco visible,
  texto largo adaptable al ancho y foco predecible después de quitar un control.
- El estado vacío debe orientar a quitar los filtros visibles, sin sugerir que
  crear una nota en ese día resolverá una consulta sobre una fecha pasada.

## Alcance excluido

Sin nuevas dependencias, cambios SQL/schema/store de filtrado, zonas horarias,
conteos, política de búsqueda global, rendimiento/virtualización, agenda, release,
versión/code o APK. Sin intervenir en teléfono/datos. Refrescos vecinos de F2,
smoke SQLite y evidencia cuantitativa F3 permanecen pendientes por separado.

## Validación prevista

1. Regresión DOM con store y filtros reales: elegir fecha, cerrar calendario,
   navegar a materia/sección con total positivo y cero coincidencias, quitar fecha
   y recuperar sus notas sin reabrir calendario ni modificar datos/conteos.
2. Búsqueda global + fecha, búsqueda en Archivadas, limpieza independiente, vuelta
   desde vistas especiales y transiciones vacío/normal/>50 notas.
3. Texto adversarial/largo, fecha inválida recuperable, foco y limpieza de listeners;
   sincronización del drawer sin reactivar búsquedas con timers obsoletos.
4. Gate canónico `npm run verify` (Node 22.20.0/npm 10.9.3), `git diff --check`
   y CI del PR. No usar la versión web como validación de Lumapse: el autor
   reitera que en su entorno no muestra la interfaz. No instalar Android Studio
   por una prueba web ni iniciar servidores para ese propósito.
5. Autor: probar el caso original en el teléfono, ambas limpiezas, navegación,
   búsqueda global, archivadas y temas. Registrar SHA probado y resultado. Si
   necesita instalar otro artefacto, acordar identidad/firma/versión antes; no
   reutilizar la beta publicada ni desinstalar para probar esta corrección.

## Evidencia y handoff

### Implementación y controles

- `FeedFilters.js`/CSS conservan nodos y listeners propios fuera de `#feed-items`.
  `NoteList` les pasa el estado existente; no agregan otra suscripción al store.
- `NoteListEmptyState.js` separa solo la presentación afectada, con escape de texto
  en la salida. Evita que esta corrección agregue un warning de tamaño a NoteList.
- La fecha se muestra como día ISO reordenado; una fecha inválida queda visible
  y removible, sin interpretar su contenido como HTML.
- Se ensayan filtros con DOM/store reales y SQLite en memoria para inicializar
  el store; las notas/conteos del caso UI se colocan como datos sintéticos en memoria.
  El cierre del popup se simula quitando su clase; no equivale a ejecutar `main.js`
  completo ni a probar Android. Backup se sustituye por una vista inerte.
- RED previo: **11/11** regresiones de integración fallaban porque faltaban
  indicador/botones. GREEN: esas **11/11** pasan, incluidos navegación real del
  drawer, UTC, limpieza independiente, búsqueda global/archivada, foco y 500 notas.
- Otras **14** pruebas del componente cubren datos adversariales, fechas inválidas,
  normalización, alcances, foco y retiro de listeners; dos regresiones adicionales
  protegen texto adversarial en estados vacíos. No afirman cobertura manual a11y.

Comandos con Node **22.20.0**, npm **10.9.3**, sin `NODE_OPTIONS`:

```bash
npm run test -- --maxWorkers=1 --allowOnly=false tests/unit/components/feed
npm run verify
git diff --check
```

| Control final | Resultado observado |
|---|---|
| Suite focalizada de feed | 6 archivos / 77 tests aprobados |
| `npm run verify` en `d481b8a` y documentación candidata | Exit 0; 61 tooling tests, 74 archivos / 1131 tests de aplicación; reporte JSON completo, build, typecheck y todos los controles aprobados |
| Lint | 0 errores; los 3 warnings históricos, sin agregar warning a NoteList |
| Bundle gzip | 197,53 kB total; JS 185,95 kB y CSS 10,74 kB, dentro de presupuestos |
| Documentación / a11y estática | Sin enlaces rotos ni hallazgos del linter; no sustituye revisión manual |
| Manifests, store, servicios y Android vs. `main` | Diff vacío; sin cambios a persistencia, dependencias ni versión |
| CI del HEAD final | Se enlaza en el PR al finalizar; no inferida del gate local |

El primer gate del candidato también pasó (61 tooling / 1129 tests); después se
separó el estado vacío para no agregar deuda de tamaño y se sumaron dos regresiones.
La primera invocación en sandbox falla al detectar npm; el gate canónico se ejecuta
fuera de esa restricción, sin cambiar el runtime ni omitir controles.

Se inició y cerró una fixture web temporal de presentación; **no se cuenta como
validación de Lumapse ni evidencia Android**. Ante la aclaración del autor se
detuvo el servidor y se descartó continuar ese camino. Ningún paso de esta
entrega requiere abrir `localhost` o instalar Android Studio por la prueba web.

### Prueba del autor y límite de aprobación

**Cierre registrado:** el HEAD `1ffa7f3` se instaló en el Samsung SM-G965F
`ad071603088c2172aa` sin `--clean`, preservando SQLite. APK debug de prueba:
SHA-256 `998501094b535c3d3971657f491e1a05bf59184029a0807ff385769d42ea7418`,
27.171.436 bytes, identidad Android `0.5.0/500`. Esta identidad compartida con la
beta publicada no convierte el build en asset de release: el próximo APK
distribuible debe usar una versión/code nuevos.

En la Mac, con checkout limpio y usando el entorno Android habitual:

```bash
git status --short --branch
git fetch origin --prune
git switch fix/visible-feed-filters
git pull --ff-only
# Activar .nvmrc en el entorno habitual
node --version
npm --version
npm ci
npm run verify
git rev-parse HEAD
```

- [x] Registrar SHA probado e identidad del artefacto usado; no se desinstaló ni
  se borraron datos. El build de prueba no debe publicarse como `v0.5.0/500`.
- [x] Elegir un día sin notas en el calendario, cerrarlo, abrir una materia y
  una sección con notas. Ver fecha/alcance y aclaración de totales; **Quitar fecha**
  debe devolver las notas de esa ubicación sin reabrir calendario.
- [x] Combinar búsqueda y fecha: ver alcance global en notas activas. Quitar
  fecha conserva búsqueda; quitar búsqueda conserva fecha y vuelve al alcance
  seleccionado. Reabrir el menú: su campo debe coincidir con el filtro vigente.
- [ ] Probar Archivadas y volver desde Papelera/Backup/Acerca de: sin franja en
  vistas especiales, con los filtros conservados al regresar al feed.
- [ ] Comprobar legibilidad y controles en ambos temas/ancho del teléfono, nombres
  largos, lista vacía/normal/500 notas y creación/edición sin regresiones.
- [x] Autor confirmó que probó el cambio y que todo estaba OK; autorizó merge y
  limpieza. PR #18 quedó integrado mediante `3898db8`.

Las mediciones CRUD/FPS de F3 y los otros pendientes siguen separados. La
aprobación de PR #18 cierra esta corrección, pero no las mediciones F3.
