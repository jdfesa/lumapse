# AUD-006 — Ownership de solicitudes async

**Fecha:** 2026-09-05
**Rama:** `fix/async-request-ownership`
**Base canónica:** `455860e3ba7ab026942a3a8d61139d6ab4533073` (`main` = `origin/main`)
**Estado:** implementación validada en Mac y Android; integración autorizada y trazada en [PR #8](https://github.com/jdfesa/lumapse/pull/8)

## Alcance

AUD-006 corrige dos carreras relacionadas sin ampliar el producto:

1. una lectura tardía de Papelera ya no puede sobrescribir feed, Backup, Acerca de, una visita
   posterior ni un consumidor reemplazado;
2. una carga académica anterior ya no puede reemplazar el mes vigente ni deshacer una creación,
   edición o eliminación confirmada.

AUD-005 permanece intacto: las lecturas siguen usando la coordinación SQLite integrada mediante
PR #7. AUD-007 conserva el contrato emit-and-rethrow. No se modificaron schema, dependencias,
lockfile, tooling, versiones ni artefactos Android. AUD-008/AUD-009 continúan separados.

## Papelera

`NoteList` posee un coordinador pequeño de ciclo de vida. Cada entrada, salida, refresh,
destrucción o reemplazo cambia la vigencia; únicamente la última solicitud de la visita activa
puede entregar HTML. `TrashView` comprueba esa vigencia después de leer y antes de escribir.

La suscripción del store y todas las acciones de `FeedActionRouter` usan el mismo callback con
ownership. Se eliminó el fallback que renderizaba directamente sin ciclo de vida. Un error vigente
se registra en el límite de `NoteList`; un error obsoleto se consume sin feedback sobre otra vista
ni rechazo no manejado.

Regresiones con promesas controladas cubren Papelera → feed/Backup/Acerca de, salida y reentrada,
refreshes inversos, destrucción, reemplazo, rechazos vigentes/obsoletos y refresh iniciado por una
acción durante navegación.

## Fechas académicas

Las cargas completa, mensual y de próximos eventos tienen generaciones de solicitud. Una respuesta
o un rechazo que ya no posee su cache termina sin modificar estado ni notificar. El identificador
de solicitud, y no solo año/mes, distingue A → B → A y solicitudes repetidas del mismo mes.

Las mutaciones confirmadas registran una revisión por ID. Una lectura iniciada antes se reconcilia
con las creaciones, ediciones o eliminaciones posteriores antes de tocar los caches. Así no se
invalida una lectura todavía vigente ni se deja el mes vacío esperando un refresh adicional. El
Heatmap, además, solo consume la colección mensual cuando `academicEventsMonth` coincide con el mes
visible. Selección, filtros y ordenamiento no cambian.

Regresiones cubren A → B, A → B → A, mismo mes fuera de orden, lectura previa a cada tipo de mutación,
rechazo tardío, recuperación después de error, loader completo, próximos eventos y flujo ordinario.

## Checkpoints publicados

- `a808eef5f73f457355f9eb176cccae5747808cf3` — `fix(feed): ignore stale trash view responses`.
- `7513704198e469f6cf9421327e96a9eae6916aa7` — `fix(store): protect academic event caches from stale reads`.

Ambos SHAs se comprobaron contra `refs/heads/fix/async-request-ownership` en GitHub antes de continuar.

## Evidencia reproducible remota

Entorno: **Node v26.7.0 / npm 12.0.2**. No se encontró Node 22 instalado en PATH ni en las ubicaciones
habituales de nvm, fnm, asdf o Volta. `npm ci` instaló 293 paquetes desde el lockfile sin modificarlo;
se mantuvo el warning conocido del postinstall bloqueado de `esbuild`, con builds correctos.

| Control | Base `455860e` | Código AUD-006 `7513704` |
|---|---|---|
| Focalizados | 5 archivos / 71 tests aprobados | 5 archivos / 93 tests aprobados |
| `npm run verify` normal | 53 fallos Web Storage; 982/1035 tests aprobados; 2 falsos positivos offline | mismos 53 fallos; 1004/1057 aprobados; mismos 2 falsos positivos |
| `npm run test:coverage` normal | falla por los mismos 53 tests | falla por los mismos 53 tests |
| Coverage diagnóstica | 67 archivos / 1035 tests; 95,66% statements | 67 archivos / 1057 tests; 95,69% statements |
| Lint / typecheck | 0 errores, 3 warnings conocidos / aprobado | sin errores ni warnings nuevos / aprobado |
| Build / bundle gzip | 122 módulos; 193,57 kB / 250 kB | 123 módulos; 194,18 kB / 250 kB |
| Checks individuales posteriores | aprobados | aprobados |
| Auditoría npm completa / productiva | 0 / 0 vulnerabilidades | 0 / 0 vulnerabilidades |

Comandos focales y de cierre:

```bash
rtk npm test -- tests/unit/components/feed/TrashView.test.js tests/unit/components/feed/NoteList.test.js tests/unit/components/feed/FeedActionRouter.test.js tests/unit/components/academic-events/Heatmap.test.js tests/unit/store/NoteStore.academicEvents.test.js
rtk npm run verify
rtk npm run test:coverage
rtk npm run check:docs
rtk npm run check:traceability
rtk npm audit
rtk npm audit --omit=dev
```

Como `verify` no alcanza sus comandos posteriores, se ejecutaron por separado `typecheck`,
`check:toolchain`, `check:db-smoke`, `check:size`, `check:native-dialogs`, `check:a11y`, `check:schema`
y `check:dbml`; todos aprobaron. La cobertura diagnóstica se obtuvo con:

```bash
rtk proxy env NODE_OPTIONS=--no-experimental-webstorage npm run test:coverage
```

Ese diagnóstico no sustituye un gate canónico. La colisión de Web Storage pertenece a AUD-009 y
los dos orígenes localhost del fallback offline a AUD-008; ambos se reprodujeron igual en base y
corrección. La Mac debe validar el SHA final con Node 22 antes del PR.

## Checklist manual entregada

El dispositivo Android está conectado exclusivamente a la Mac y no se buscó ni desplegó desde SSH.
Checklist proporcional sobre el SHA publicado, preservando datos:

1. abrir Papelera y navegar rápidamente a Entrada, Backup y Acerca de sin saltos tardíos;
2. salir y volver a Papelera, restaurar un elemento y confirmar que solo aparece el refresh vigente;
3. alternar rápidamente mes anterior/siguiente y confirmar que título, dots y detalle pertenecen al mismo mes;
4. crear y editar una fecha con una navegación mensual cercana y verificar el valor confirmado;
5. eliminar una fecha y navegar entre meses, comprobando que no reaparece;
6. cerrar y reabrir la app para confirmar persistencia normal y ausencia de regresiones generales.

El usuario confirmó el funcionamiento general satisfactorio tras recibir esta checklist y autorizó
PR, merge y limpieza el 2026-09-05. No se atribuye a esa confirmación una medición RNF ni
evidencia individual adicional de cada caso. El merge requiere checks satisfactorios del head final;
no se habilita auto-merge ni limpieza anticipada de la rama.


## Validación Mac y aprobación Android — 2026-09-05

Código validado e instalado: `d248e8b0e8bc2fe9ef9889505466a7a32dbc2de0`.
Entorno local: Node **22.20.0** / npm **10.9.3**.

- `npm run verify` sufrió dos cierres de Vitest con código **139 antes de ejecutar los tests**,
  incluso fuera del sandbox. No se declara ese comando aprobado ni se altera el gate para ocultarlo.
- `npm test -- --maxWorkers=1`: **67 archivos / 1057 tests aprobados**, salida 0, 56,89 s.
  El límite fue un argumento temporal, sin modificar configuración ni dependencias.
- Lint: **0 errores / 3 warnings basales**. Build y auditor Rust aprobados.
- Los pasos restantes de `verify` aprobaron individualmente: `typecheck`, `check:toolchain`,
  `check:db-smoke`, `check:size`, `check:native-dialogs` y `check:a11y`.
- Bundle local: **195,07 kB gzip / 250 kB**. Esta ejecución no midió cobertura local nueva.
- Deploy oficial: `npm run deploy:android -- --target ad071603088c2172aa`, sin `--clean`,
  preservando SQLite y datos; Gradle con dos workers y paralelismo deshabilitado temporalmente.
- Samsung **SM_G965F**, paquete `com.lumapse.app`, versión **0.4.8 / 408**;
  actualización informada por Android: **2026-09-05 14:36:54**; proceso iniciado comprobado.
- SHA256 idéntico del APK local y del instalado:
  `69c52c8f6bc32fc4e9323c8159f843da53b9cc2ccd5a6794b707009a117ebd2b`.
- Aprobación del usuario: «todo en orden», con autorización explícita de merge y eliminación
  de ramas una vez que el trabajo esté en `main`.

La revisión, los checks del head final y el resultado de integración se consultan en
[PR #8](https://github.com/jdfesa/lumapse/pull/8). Este checkpoint solo modifica documentación
respecto al APK probado; no cambia el producto ni publica una nueva release. La aceptación final
versionada de Hito 06 y los frentes AUD-008/AUD-009 mantienen su alcance independiente.

### Gate completo de cierre

Antes de publicar el checkpoint documental se ejecutó
`VITEST_MAX_WORKERS=1 npm run verify`: **aprobado con salida 0**, incluidos los **1057 tests**.
La variable temporal es reconocida por la versión instalada de Vitest y conserva todos los
controles del gate; no se modificaron hooks, scripts ni configuración persistente. Se mantiene
registrado el cierre 139 de las ejecuciones sin ese límite. El pre-push se ejecuta con la misma
variable, sin saltarse el hook. CI del PR ejecuta su configuración habitual en Node 22.
