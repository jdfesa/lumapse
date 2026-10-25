# Documentación del Proyecto — Lumapse

Este directorio reúne la documentación viva de Lumapse. El corte vigente es la **pre-release `v0.6.0` — Release Candidate 1**, aceptada con validación parcial y desarrollo congelado hasta después de la presentación académica oficial. El producto es Android/Capacitor con SQLite; PWA e IndexedDB pertenecen a su evolución histórica. La [decisión canónica](../BACKLOG.md#congelación-académica--2026-10-22) limita las próximas sesiones a documentación: primero manual de usuario, luego informe final y defensa, sin nuevas pruebas o cambios de app.

## Cómo leer la documentación

| Necesidad | Fuente canónica |
|---|---|
| Aprender a usar Lumapse | [Manual de usuario 0.6.0](https://jdfesa.github.io/lumapse/manual-de-usuario-lumapse.html) |
| Editar y regenerar el manual | [Fuentes y regeneración](./manual-de-usuario-0.6.0/README.md#para-editar-y-regenerar) |
| Entender el producto y su alcance actual | [`producto/`](./producto/) |
| Entender la arquitectura y sus decisiones | [`adr/`](./adr/) y [`diagramas/arquitectura-componentes.md`](./diagramas/arquitectura-componentes.md) |
| Consultar el modelo de datos | [`diagramas/database/`](./diagramas/database/) |
| Seguir el trabajo pendiente y los hitos | [`../BACKLOG.md`](../BACKLOG.md), [`../TODO.md`](../TODO.md), [`gestion/`](./gestion/) e [`hitos/`](./hitos/) |
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
- [Manual de usuario 0.6.0](https://jdfesa.github.io/lumapse/manual-de-usuario-lumapse.html) — Guía HTML interactiva de uso, con capturas de la versión actual.
- [`producto/`](./producto/) — Problema, personas, requisitos, historias de usuario y evidencia del relevamiento.
- [`flujo-desarrollo-android.md`](./flujo-desarrollo-android.md) — Build, despliegue y pruebas con dispositivos Android físicos desde macOS.
- [`flujo-desarrollo-android-en-arch.md`](./flujo-desarrollo-android-en-arch.md) — Instalación y pruebas con Android Emulator en Arch Linux.

## Criterio editorial

Los documentos deben distinguir explícitamente entre:

- **Vigente:** describe el corte `v0.6.0` con sus límites o identifica explícitamente el artefacto histórico de una evidencia. Los capítulos del informe aún requieren adaptación documental; la guía de usuario 0.6.0 está incorporada y pendiente de revisión final. Ninguno se considera un entregable final por deducción.
- **Histórico:** registra una hipótesis o decisión reemplazada, sin presentarla como estado actual.
- **Fuente:** archivo que se edita y del cual se deriva otro artefacto.
- **Generado:** salida reproducible que no debe corregirse manualmente si existe una fuente.
- **Pendiente externo:** artefacto que requiere una herramienta fuera del repositorio, como la exportación gráfica de los modelos de base de datos.

El informe completo se ensambla a partir de sus capítulos fuente. La migración editorial a LaTeX queda deliberadamente para una etapa posterior, una vez estabilizados contenido, gráficos y referencias.

Para el cierre público, distinguir resultados comprobados, pendientes, limitaciones
y postergaciones conforme al [recorte de entrega](../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa).
Ni un plan aceptado ni una casilla del tablero sustituyen la evidencia. Los capítulos
y el informe ensamblado conservan su checkpoint hasta la revisión final; no se
reescriben resultados históricos para aparentar cumplimiento del APK nuevo.

## Estado documental actual

- [Manual de usuario 0.6.0](https://jdfesa.github.io/lumapse/manual-de-usuario-lumapse.html):
  guía breve e interactiva con siete capturas actuales, disponible para leer
  directamente en el navegador mediante GitHub Pages. También funciona sin conexión
  abriendo `manual-de-usuario-lumapse.html` desde una copia local de su carpeta,
  conservando `assets` a su lado; no requiere instalar dependencias. Su revisión
  final queda pendiente y no acredita pruebas funcionales ni requisitos del APK.
  El texto, SVG editable y código del generador se conservan en
  `fuentes/`; el [README de la guía](./manual-de-usuario-0.6.0/README.md) indica
  cómo regenerar el HTML sin depender de archivos temporales de un equipo.

- [Candidato APK 0.6.0 — RC1](./gestion/candidato-apk-0.6.0.md): APK local generada
  con firma de distribución original, fuente limpia identificada y controles del
  corte aprobados. Se preserva la prueba pública `0.5.0` → candidato inicial;
  el corregido (`bcefe6a`, etiqueta neutral y DOMPurify 3.4.17 autorizados) también
  quedó instalado por actualización, con datos conservados y Acerca de comprobado.
  PR #42 quedó integrado; posteriormente el autor aceptó la cobertura parcial y
  congeló el desarrollo. `v0.6.0` publicada como Pre-release; comprobaciones
  restantes diferidas hasta después de la presentación, no aprobadas.

- [Revisión precorte del 2026-10-22](./gestion/revision-precorte-2026-10-22.md): evidencia histórica de clasificación, correcciones y criterios iniciales; al cerrar PR #41 aún no existía el APK final. La decisión posterior de publicación/congelación está en el registro de RC1, sin reescribir resultados previos. El [índice ADR](./adr/README.md#revisión-de-trazabilidad-precorte--2026-10-22) conserva el inventario de RNF-026 y sus límites temporales.

- La arquitectura y los patrones quedan formalizados en [ADR-008](./adr/ADR-008-arquitectura-modular-y-patrones.md).
- [ADR-009](./adr/ADR-009-propiedad-transaccional-sqlite.md) documenta la propiedad transaccional y el arranque recuperable incluidos en `v0.5.0`.
- El Hito 05 conserva el cierre de la primera beta `v0.4.8`; Hito 06 publicó `v0.5.0` y continúa con presentación, coherencia documental, matriz RNF y cierre académico.
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
