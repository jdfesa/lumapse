# Diagrama de Casos de Uso — Lumapse

**Tipo:** Casos de uso UML, vista sintética del producto<br>
**Última actualización:** 2026-11-23<br>
**Autor:** José David Sandoval

---

## Objetivo del diagrama

Representar las funcionalidades principales del sistema desde la perspectiva del usuario, identificando los **actores** que interactúan con la aplicación y los **casos de uso** que Lumapse ofrece en el corte `v0.6.0`. La figura muestra **qué hace el producto** durante su uso; las tablas desglosan las capacidades y separan la distribución del APK y las funcionalidades futuras.

> **Nota de evolución:** Desde el pivote a aplicación Android híbrida ([ADR-005](../adr/ADR-005-pivote-app-nativa.md)), se eliminaron los casos de uso relacionados con PWA y Service Worker. En Hito 05 se incorporan borradores persistentes (`RF-005`), backup manual `.zip` (`RF-017`), importación de backups ZIP (`RF-018`), sección Acerca de (`RF-023`), fechas académicas discretas (`RF-027`) y editor enriquecido (`RF-028`). Compartir/exportar una nota individual e importar una nota `.md` quedan explícitamente como post-release.

> **Frontera de versión:** Modelo funcional contrastado con los requisitos, el
> manual 0.6.0 y la fuente del corte 0.6.0 RC1. Describe capacidades y límites, no una
> nueva validación de la APK. La [cobertura parcial aceptada](../../BACKLOG.md#congelación-académica--2026-10-22)
> se conserva; no se cambian estados RF/RNF por actualizar este diagrama.

---

## Diagrama

![Casos de uso principales del cliente Android Lumapse](./figuras/casos-de-uso.svg)

La figura agrupa los casos por finalidad para mantener visible la frontera del
cliente Android. Usa asociaciones sin dirección: no expresa un orden de pasos.
La fuente editable es [`figuras/casos-de-uso.dot`](./figuras/casos-de-uso.dot);
la regeneración y la selección para el informe se describen en el
[índice de diagramas](./README.md#figuras-seleccionadas-para-el-informe).

| Grupo de la figura | Casos detallados |
|---|---|
| Crear y editar notas | UC-01, UC-02, UC-08 y UC-19; UC-14 conserva el borrador dentro de ese flujo |
| Consultar y buscar notas | UC-04, UC-05 y UC-09 |
| Organizar contenido | UC-06, UC-07, UC-17 y UC-18 |
| Gestionar papelera | UC-03 y UC-16 |
| Gestionar fechas académicas | UC-21 |
| Exportar e importar respaldo ZIP | UC-12 y UC-20 |
| Tema e información | UC-15 y UC-22 |

La instalación (UC-13) pertenece a la distribución, no a la ejecución del cliente.
Los casos individuales Markdown UC-10 y UC-11 siguen fuera del alcance vigente;
no se dibujan como funciones disponibles.

---

## Descripción de Actores

| Actor | Tipo | Descripción |
|---|---|---|
| **Estudiante** | Principal | Usuario final de la aplicación. Representa a las personas [Lucía](../producto/personas.md#persona-1--lucía-la-estudiante-organizada) y [Martín](../producto/personas.md#persona-2--martín-el-estudiante-práctico). Interactúa directamente con las funcionalidades de captura, organización, búsqueda, backup y consulta académica. |
| **Docente evaluador** | Contexto de uso del mismo usuario | Puede consultar Acerca de o usar las mismas funciones que cualquier estudiante. No existe un rol autenticado ni permisos especiales; por eso la figura no lo separa como actor con capacidades exclusivas. |
| **Sistema de Archivos / Share Sheet** | Sistema | Interfaz del sistema operativo usada por la portabilidad local: exportar backups `.zip`, importar backups generados por Lumapse y, en el futuro, compartir/importar notas individuales. |

Capacitor es infraestructura interna del cliente, no un actor externo de estos casos de uso. El empaquetado y la instalación del APK se explican mediante [ADR-005](../adr/ADR-005-pivote-app-nativa.md) y el flujo de distribución, separados de esta frontera funcional.

---

## Descripción de Casos de Uso

### Gestión de Notas (Core)

| ID | Caso de Uso | Descripción | RF asociado |
|---|---|---|---|
| UC-01 | Crear Nota | El estudiante redacta una nueva nota y confirma su creación con `Guardar`. Si no escribe un título explícito, se utiliza la primera línea no vacía del contenido sólo cuando es un H1 (`# `); en otro caso queda `Sin título`. | [RF-001](../producto/requisitos-funcionales.md) |
| UC-02 | Editar Nota | El estudiante modifica el contenido de una nota existente y confirma los cambios con `Actualizar`. | [RF-002](../producto/requisitos-funcionales.md) |
| UC-03 | Eliminar Nota | El estudiante elimina una nota con confirmación previa desde el menú contextual. La eliminación es lógica y envía la nota a la papelera. | [RF-003](../producto/requisitos-funcionales.md), [RF-026](../producto/requisitos-funcionales.md) |
| UC-04 | Ver Listado de Notas | El sistema muestra las notas de la vista y los filtros actuales: Entrada, materia/secciones, general o Archivo. Ordena por fijado y, dentro de cada grupo, por última modificación; no muestra todas las notas no eliminadas a la vez en cualquier vista. | [RF-004](../producto/requisitos-funcionales.md) |
| UC-05 | Buscar Notas | El estudiante filtra notas activas por texto en título y contenido. En Entrada, materia y general, la búsqueda abarca las notas no archivadas de todas las materias; en Archivo busca dentro de las archivadas. El filtro de fecha puede acotar los resultados. Tolera mayúsculas/minúsculas y tildes. | [RF-015](../producto/requisitos-funcionales.md) |
| UC-18 | Marcar Estado Académico | El estudiante asigna a una nota un marcador visual curado de estado académico (`📖`, `❓`, `🔥`, `✅`). | [RF-025](../producto/requisitos-funcionales.md) |

### Organización

| ID | Caso de Uso | Descripción | RF asociado |
|---|---|---|---|
| UC-06 | Fijar Nota | El estudiante fija una nota para que aparezca siempre al tope del feed. La acción es reversible. | [RF-013](../producto/requisitos-funcionales.md) |
| UC-07 | Archivar Nota | El estudiante archiva una nota para ocultarla del feed principal. Las notas archivadas quedan accesibles desde el drawer. | [RF-013](../producto/requisitos-funcionales.md) |
| UC-17 | Gestionar Materias y Secciones | El estudiante crea, renombra, elimina, archiva o selecciona materias y secciones de hasta dos niveles para clasificar sus notas. | [RF-014](../producto/requisitos-funcionales.md) |
| UC-16 | Gestionar Papelera | El estudiante accede a la papelera de reciclaje para ver notas y materias eliminadas, restaurar elementos o vaciarla permanentemente. | [RF-026](../producto/requisitos-funcionales.md) |

### Markdown y Escritura

| ID | Caso de Uso | Descripción | RF asociado |
|---|---|---|---|
| UC-08 | Escribir en Markdown | El estudiante escribe contenido en texto plano o Markdown portable. | [RF-010](../producto/requisitos-funcionales.md), [RF-011](../producto/requisitos-funcionales.md) |
| UC-09 | Previsualizar Nota | El estudiante consulta Markdown renderizado en las tarjetas del listado. `MarkdownPreview` se conserva como componente aislado; no se presenta una vista dividida del editor como flujo activo de la versión 0.6.0 RC1. | [RF-012](../producto/requisitos-funcionales.md) |
| UC-19 | Usar Comandos de Formato | El estudiante usa comandos `/`, botón `+`, botón `Aa`, callouts y continuidad inteligente para enriquecer la nota sin formato propietario. | [RF-028](../producto/requisitos-funcionales.md) |

### Fechas Académicas

| ID | Caso de Uso | Descripción | RF asociado |
|---|---|---|---|
| UC-21 | Gestionar Fechas Académicas | El estudiante registra parciales, finales, trabajos prácticos o exposiciones como recordatorios visuales discretos integrados al Heatmap y a la lista de próximas fechas. | [RF-027](../producto/requisitos-funcionales.md) |

### Datos y Portabilidad

| ID | Caso de Uso | Descripción | RF asociado |
|---|---|---|---|
| UC-12 | Exportar Backup .zip | El estudiante genera un respaldo local `.zip` del workspace, con manifiesto, datos estructurados, notas Markdown legibles y salida externa por share sheet o gestor de archivos. | [RF-017](../producto/requisitos-funcionales.md) |
| UC-20 | Importar Backup .zip | El estudiante selecciona un backup ZIP generado por Lumapse, revisa una vista previa e importa notas, materias, secciones y fechas académicas de forma no destructiva y transaccional. | [RF-018](../producto/requisitos-funcionales.md) |
| UC-10 | Compartir/Exportar Nota .md | Post-release. El estudiante comparte o guarda una nota individual como Markdown usando share sheet nativo validado. | [RF-016](../producto/requisitos-funcionales.md) |
| UC-11 | Importar Nota .md | Post-release. El estudiante importa una nota individual hacia `Entrada`, sin recrear materias o secciones de origen. | — Sin RF formal vigente |

### Sistema e Información

| ID | Caso de Uso | Descripción | RF asociado |
|---|---|---|---|
| UC-13 | Instalar como APK | El estudiante instala Lumapse como APK Android híbrida empaquetada mediante Capacitor. | Sin RF funcional independiente; decisión de canal en [ADR-005](../adr/ADR-005-pivote-app-nativa.md) |
| UC-14 | Conservar Borrador | El sistema conserva localmente el borrador del editor mientras el usuario crea o edita, lo recupera al reconstruir el editor y lo limpia al guardar, actualizar o descartar. | [RF-005](../producto/requisitos-funcionales.md) |
| UC-15 | Alternar Modo Oscuro/Claro | El estudiante alterna entre modo oscuro y claro desde el drawer. La preferencia se persiste localmente y puede respetar la configuración del sistema operativo. | [RF-019](../producto/requisitos-funcionales.md) |
| UC-22 | Consultar Acerca de | El docente evaluador o estudiante consulta versión, autor, licencia, propósito y alcance offline/local de la app. | [RF-023](../producto/requisitos-funcionales.md) |

---

## Relaciones entre Casos de Uso

| Relación | Origen | Destino | Justificación |
|---|---|---|---|
| **«include»** | UC-01 (Crear Nota) | UC-14 (Conservar Borrador) | Mientras se redacta una nota nueva, el sistema protege el trabajo en curso sin crear la nota final hasta que el usuario confirma con `Guardar`. |
| **«include»** | UC-02 (Editar Nota) | UC-14 (Conservar Borrador) | Mientras se edita una nota existente, el sistema protege los cambios pendientes sin actualizar la nota final hasta que el usuario confirma con `Actualizar`. |
| **«extend»** | UC-19 (Usar Comandos de Formato) | UC-08 (Escribir en Markdown) | Los comandos enriquecen la escritura, pero no son obligatorios para usar Lumapse: escribir texto plano sigue siendo el flujo base. |

Eliminar una nota (UC-03) tiene como resultado su envío a Papelera. Consultar,
restaurar o vaciar esa papelera (UC-16) son recorridos posteriores independientes:
no se utiliza `«extend»` para representar esa sucesión temporal. La figura
sintética no dibuja las relaciones internas de inclusión o extensión de la tabla.

### ¿Por qué `«include»` y no `«extend»` para conservar borrador?

- **`«include»`** indica que la protección del borrador se ejecuta como parte normal de crear o editar. No cambia la intención final del usuario, pero evita pérdida de texto si sale de la app, cambia de vista o consulta otro material.
- **`«extend»`** indicaría un comportamiento opcional o excepcional. Esto no aplica a la protección del trabajo en curso, que debe estar disponible de forma permanente.

---

## Trazabilidad: Casos de Uso → Hitos

| Hito | Casos de Uso |
|---|---|
| **02** (Junio) | UC-01, UC-02, UC-03, UC-04 |
| **03** (Julio) | UC-08, UC-09 |
| **04** (Agosto) | UC-05, UC-06, UC-07, UC-13, UC-15, UC-16, UC-17, UC-18 |
| **05** (Septiembre) | UC-12, UC-14, UC-19, UC-20, UC-21, UC-22 |
| **Futuro / Post-release** | UC-10, UC-11 |

---

*Documento de la fase Idear · Análisis y Relevamiento · Lumapse · PP3 · 2026*
