# Filtros visibles del feed — 2026-09-15

**Estado:** plan acotado definido antes de implementar. Pruebas y validación pendientes.
**Base:** `7dc105c`, `main` sincronizado después del merge de PR #17 por el autor.
**Rama única:** `fix/visible-feed-filters`. No integrar sin nueva prueba y aprobación.

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
4. Gate canónico `npm run verify` (Node 22.20.0/npm 10.9.3), `git diff --check`,
   inspección web auxiliar si está disponible y CI del PR.
5. Autor: probar el caso original en el teléfono, ambas limpiezas, navegación,
   búsqueda global, archivadas y temas. Registrar SHA probado y resultado. Si
   necesita instalar otro artefacto, acordar identidad/firma/versión antes; no
   reutilizar la beta publicada ni desinstalar para probar esta corrección.

## Evidencia y handoff

Pendientes de completar con resultados reales. El PR se entregará abierto; la
confirmación del autor es condición para recién sugerir merge y limpieza.
