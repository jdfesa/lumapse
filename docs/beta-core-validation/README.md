# F3 — Validación del núcleo de la beta

**Inicio:** 2026-09-14. **Estado:** preparación verificable; F3 **sin cerrar**, medición Android pendiente.
**Rama única:** `docs/beta-core-validation`. No hay nueva release ni cambios productivos.

F2 fue aceptada por el autor tras probar su funcionamiento y quedó integrada en
[PR #15](https://github.com/jdfesa/lumapse/pull/15), `8e25dcd`. Se actualizó `main` a
`f9c8de0` y se eliminó su rama local; la remota ya estaba eliminada. Esta fase sigue
el [plan aceptado](../gestion/plan-desarrollo-inmediato-beta-2026-09-12.md), sin optimizar
consultas/notificaciones por intuición ni sustituir la validación del teléfono por CI.

## Entrega revisable

- [Protocolo](./protocolo.md): fixtures, seguridad del dispositivo, CRUD/FPS, offline y borradores.
- [Resultados y matriz incremental](./resultados-2026-09-14.md): solo hechos ejecutados; pendientes identificados.
- Plantillas vacías: [sesión](./sesion.template.json), [muestras CRUD](./crud.template.csv)
  y [frames por tramo](./frames.template.csv). Copiarlas a `tmp/` para completar la evidencia.
- Generador existente ampliado con `f3-small` y `f3-500`; `beta-500` sigue siendo el valor por defecto.
- ZIP v1 determinista y pruebas de importación real, repetición sin duplicados, conteos y papelera separada.

## Qué no se afirma

No hay latencias Android, FPS, prueba de bloqueo/terminación ni APK nuevo en esta entrega.
No se accedió al teléfono ni a bases personales. El host Linux no tiene `adb`/Java
en PATH. RNF-002/RNF-004 siguen **pendientes**; RNF-009/RNF-010 no mejoran de estado
por generar datos o ejecutar SQLite en memoria.

La revisión de esta preparación puede hacerse ahora. Para continuar las mediciones se
necesita acordar con el autor dispositivo, APK identificable y espacio de prueba seguro.
Si hace falta otro binario, acordar antes versión/code nuevos y firma compatible;
no reutilizar `0.5.0/500` para código distinto. El PR no autoriza instalación,
reemplazo de datos, merge, tag o publicación automáticos.

Una vez recibida la evidencia del teléfono, incorporarla en esta misma rama. Un fallo
RNF se registra con sus muestras; cualquier corrección se prioriza por separado tras
cerrar este frente. La deuda de filtro de fecha oculto de `main` permanece en backlog.
