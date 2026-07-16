# Documentación del Proyecto — Lumapse

Este directorio reúne la documentación viva de Lumapse. La referencia técnica actual corresponde a la **versión `0.4.8`**, una beta funcional instalable en Android y candidata a presentación académica. El producto vigente es una aplicación móvil empaquetada con Capacitor, con persistencia local SQLite y funcionamiento offline; la PWA e IndexedDB pertenecen a la evolución histórica del proyecto.

## Cómo leer la documentación

| Necesidad | Fuente canónica |
|---|---|
| Entender el producto y su alcance actual | [`producto/`](./producto/) |
| Entender la arquitectura y sus decisiones | [`adr/`](./adr/) y [`diagramas/arquitectura-componentes.md`](./diagramas/arquitectura-componentes.md) |
| Consultar el modelo de datos | [`diagramas/database/`](./diagramas/database/) |
| Seguir el trabajo pendiente y los hitos | [`../BACKLOG.md`](../BACKLOG.md), [`../TODO`](../TODO), [`gestion/`](./gestion/) e [`hitos/`](./hitos/) |
| Redactar el informe académico | capítulos fuente de [`informe-final/`](./informe-final/) |
| Revisar la evolución por versión | [`../CHANGELOG.md`](../CHANGELOG.md) |

Cuando un documento histórico contradiga una decisión posterior, prevalece el ADR vigente y la documentación de producto actual. Los ADR reemplazados se conservan porque explican la evolución del proyecto; no describen la solución en producción.

## Índice

- [`adr/`](./adr/) — Architecture Decision Records y estado de cada decisión técnica.
- [`anteproyecto/`](./anteproyecto/) — Definición académica original; debe leerse como línea de base histórica cuando difiera del alcance validado.
- [`diagramas/`](./diagramas/) — Arquitectura, comportamiento, dominio y diseño de datos.
- [`gestion/`](./gestion/) — Estimación, planificación, trazabilidad y seguimiento.
- [`hitos/`](./hitos/) — Informes de avance y cierre mensual.
- [`informe-final/`](./informe-final/) — Capítulos fuente del informe académico final.
- [`inspiracion/`](./inspiracion/) — Benchmarking y referencias externas; no constituye especificación del producto.
- [`producto/`](./producto/) — Problema, personas, requisitos, historias de usuario y evidencia del relevamiento.
- [`flujo-desarrollo-android.md`](./flujo-desarrollo-android.md) — Build, despliegue y prueba en Android.

## Criterio editorial

Los documentos deben distinguir explícitamente entre:

- **Vigente:** describe la versión `0.4.8` y puede usarse en la defensa.
- **Histórico:** registra una hipótesis o decisión reemplazada, sin presentarla como estado actual.
- **Fuente:** archivo que se edita y del cual se deriva otro artefacto.
- **Generado:** salida reproducible que no debe corregirse manualmente si existe una fuente.
- **Pendiente externo:** artefacto que requiere una herramienta fuera del repositorio, como la exportación gráfica de los modelos de base de datos.

El informe completo se ensambla a partir de sus capítulos fuente. La migración editorial a LaTeX queda deliberadamente para una etapa posterior, una vez estabilizados contenido, gráficos y referencias.

## Estado documental actual

- La arquitectura y los patrones quedan formalizados en [ADR-008](./adr/ADR-008-arquitectura-modular-y-patrones.md).
- El Hito 05 representa el cierre funcional de la beta; el trabajo de presentación, coherencia documental, gráficos y validación final corresponde al hito siguiente.
- Las fuentes DOT, DBML y DDL del modelo de datos están sincronizadas; las imágenes conceptual y lógica fueron regeneradas externamente, verificadas e incorporadas al informe el 2026-07-15. Solo resta comprobar su legibilidad en la maquetación final de PDF y diapositivas. El alcance exacto está registrado en [`diagramas/database/README.md`](./diagramas/database/README.md).

## Documentación formal académica (PP3)

Los PDFs, presentaciones y plantillas institucionales se conservan en Dropbox para mantener liviano el repositorio:

> [Carpeta Dropbox — Lumapse / PP3](https://www.dropbox.com/scl/fo/efl03t0ywteggi6dk3mvu/AGodfqlsy7t68P7atK_NqPg?rlkey=mk50fjx0wwb58jpn92ygqbrwp&st=jtv5846&dl=0)

| Carpeta | Descripción |
|---|---|
| `00-resolucion-ppiii/` | Resolución oficial y guía del profesor |
| `01-lluvia-de-ideas/` | Actividad inicial de brainstorming |
| `02-definiendo-anteproyecto/` | Anteproyecto formal entregado |
| `03-presentacion-anteproyecto/` | Pitch y presentación del anteproyecto |
| `04-design-thinking/` | Ejercicios y material de Design Thinking |
| `05-analisis-y-relevamiento/` | Material de análisis y relevamiento de sistemas |
| `06-estimacion-y-medicion/` | Bibliografía de estimación y medición |
| `07-guia-relevamiento-y-analisis/` | Guía de relevamiento y análisis |
| `08-planilla-de-seguimiento/` | Seguimiento de actividades y encuentros con la tutora |

Los documentos externos son referencia académica. El código, las decisiones técnicas y el historial verificable viven en este repositorio.
