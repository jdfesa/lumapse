# Plan: Borradores persistentes del editor

Fecha: 2026-06-06

## Objetivo

Implementar un sistema de borradores persistentes para el editor de Lumapse, de modo que un estudiante no pierda lo que estaba escribiendo si sale de la app, cambia a WhatsApp, consulta un PDF, abre el navegador, bloquea el telefono o vuelve mas tarde.

La intencion no es guardar silenciosamente una nota final, sino proteger el trabajo en curso y devolverle el control al usuario.

Principios del cambio:

- Offline first: el borrador debe persistir localmente sin depender de red.
- Mobile first: debe tolerar cambios de app, pausa, cierre y reanudacion.
- Student first: debe ser comprensible desde el primer uso, sin manual ni configuracion.
- Cero friccion: Lumapse debe asumir la complejidad y avisar lo minimo necesario.
- Respeto por la intencion del usuario: si el usuario cancela o descarta, la app debe obedecer y limpiar el borrador.

## Decision de producto

No se implementara auto-guardado final silencioso de notas.

En su lugar se implementara un borrador persistente del editor:

- Para nota nueva: se guarda temporalmente titulo, cuerpo y materia seleccionada.
- Para edicion: se guarda temporalmente el cambio pendiente asociado a la nota original.
- El borrador se restaura en el editor al volver a la app.
- La nota definitiva solo se crea o actualiza cuando el usuario toca `Guardar` o `Actualizar`.
- Si el usuario descarta/cancela, el borrador se elimina.

Razon:

Guardar notas finales sin confirmacion puede ensuciar el feed con ideas incompletas, contenido pegado temporalmente o duplicados. Un borrador persistente protege contra perdida de datos sin romper la claridad del modelo mental.

## Alcance

Incluido:

- Borrador persistente para nota nueva.
- Borrador persistente para edicion de nota existente.
- Recuperacion al iniciar la app o volver a una vista con editor disponible.
- Indicador visual sutil de cambios pendientes.
- Accion explicita para descartar borrador.
- Limpieza del borrador al guardar, actualizar o cancelar.
- Tests unitarios para servicio, editor y flujos principales.
- Documentacion de la decision y criterios de aceptacion.

No incluido en esta primera version:

- Historial de versiones completo.
- Fusion avanzada de conflictos entre nota editada y borrador viejo.
- Sincronizacion multi-dispositivo.
- Borradores multiples simultaneos.
- Recuperacion desde papelera de borradores.

## Rama sugerida

Cuando se ejecute el plan, crear una rama dedicada:

```bash
git switch -c feature/borradores-persistentes
```

Motivo:

- Usar una rama corta y descriptiva alineada con la feature.
- Aislar los cambios de persistencia y UX.
- Poder probar por fases.
- Hacer merge final solo cuando el comportamiento este validado.

Nota:

`develop` solo convendria si el proyecto adopta formalmente Git Flow con una rama de integracion permanente. Para esta mejora concreta, una rama `feature/...` es mas clara y evita mezclar trabajo de otras iniciativas.

## Modelo mental para el usuario

El usuario no tiene que aprender "autosave", "drafts" o conceptos tecnicos.

La experiencia esperada:

1. Escribe una nota.
2. Sale de Lumapse para mirar otra cosa.
3. Vuelve.
4. La nota sigue ahi.
5. Lumapse muestra un aviso discreto: `Borrador recuperado` o `Cambios pendientes`.
6. El usuario puede guardar, actualizar o descartar.

Lenguaje recomendado:

- `Borrador sin guardar`
- `Cambios pendientes`
- `Borrador recuperado`
- `Descartar`

Evitar:

- `Error`
- `Conflicto`
- `Autosave`
- Mensajes largos o tecnicos.

## Senales visuales

No usar rojo como color principal del estado pendiente.

Rojo comunica error, peligro o accion destructiva. Para Lumapse conviene una senal mas serena:

- linea lateral color accent o ambar suave en el composer;
- texto pequeno y discreto cerca del boton principal;
- boton/accion `Descartar` solo cuando hay borrador;
- toast breve al restaurar.

Propuesta visual:

- Estado normal: editor sin marca.
- Estado con cambios pendientes: borde o linea izquierda sutil en `var(--color-accent)` o ambar suave.
- Estado restaurado: toast breve `Borrador recuperado`.
- Accion destructiva: confirmacion antes de `Descartar`.

## Persistencia

### Opcion recomendada

Crear un servicio `EditorDraftService`.

Primera implementacion propuesta:

- Persistir en `localStorage` con JSON versionado.
- Guardar solo estado de editor, no notas definitivas.
- Mantener una clave unica, por ejemplo `lumapse-editor-draft-v1`.

Justificacion:

- Es inmediato y disponible antes/despues de la inicializacion del editor.
- Es suficiente para texto de una nota en curso.
- No requiere migracion SQLite para una sola ranura de borrador.
- Permite tests simples y rapidos.

Mitigacion:

- El formato debe estar versionado.
- Debe tolerar JSON corrupto.
- Debe borrar entradas invalidas.
- Debe tener fallback silencioso si `localStorage` no esta disponible.

### Alternativa futura

Si las pruebas muestran que necesitamos mas robustez o multiples borradores, migrar a SQLite:

- tabla `editor_drafts`;
- un borrador activo por usuario/app;
- soporte eventual para multiples borradores;
- limpieza transaccional junto a guardado de nota.

No conviene empezar por SQLite salvo que aparezca una razon fuerte, porque aumenta superficie de migracion y complejidad para una primera version.

## Contrato del borrador

Formato sugerido:

```js
{
  version: 1,
  mode: 'create' | 'edit',
  noteId: string | null,
  title: string,
  content: string,
  subjectId: string | null,
  baseUpdatedAt: string | null,
  savedAt: string
}
```

Campos:

- `version`: permite migrar el formato.
- `mode`: distingue nota nueva de edicion.
- `noteId`: identifica la nota original cuando se edita.
- `title`: titulo escrito en el campo separado.
- `content`: cuerpo Markdown del editor.
- `subjectId`: materia/seccion elegida en el composer.
- `baseUpdatedAt`: fecha de la nota al empezar a editar, util para detectar si cambio desde otra accion.
- `savedAt`: timestamp del ultimo guardado del borrador.

## Reglas funcionales

### Nota nueva

- Al escribir titulo, cuerpo o cambiar materia, se persiste un borrador.
- Si el usuario cierra o abandona la app, el borrador queda disponible.
- Al volver, el editor se restaura con ese titulo, cuerpo y materia.
- Al tocar `Guardar`, se crea la nota y se elimina el borrador.
- Al tocar `Descartar`, se pide confirmacion y se elimina el borrador sin crear nota.

### Edicion de nota existente

- Al tocar `Editar`, se carga la nota en el editor.
- Si el usuario modifica titulo, cuerpo o materia, se persiste un borrador de edicion.
- Si sale de la app y vuelve, se recuperan esos cambios pendientes.
- La card original no cambia hasta tocar `Actualizar`.
- Al tocar `Actualizar`, se actualiza la nota y se elimina el borrador.
- Al tocar `Descartar`, se pide confirmacion y se vuelve al estado guardado de la nota original.

### Cambios vacios

- Si el editor queda vacio y sin titulo real, el borrador se elimina.
- Si el usuario borra el contenido de una nota nueva y sale, no se debe restaurar un editor vacio inutil.
- En edicion, borrar todo puede ser una intencion valida; debe considerarse cambio pendiente si habia una nota original.

### Cancelar / descartar

Debe existir una accion clara para cancelar cambios en curso.

Propuesta:

- En modo creacion con borrador: mostrar `Descartar` como accion secundaria discreta.
- En modo edicion: `Descartar cambios` o `Cancelar edicion`.
- Confirmacion: `¿Descartar este borrador?`
- Si confirma: limpiar borrador, limpiar editor o volver al estado anterior.

El usuario siempre debe tener forma de salir de un borrador que ya no quiere.

## Fases de implementacion

### Fase 0 - Preparacion

Objetivo:

Dejar la rama y el contexto listos.

Tareas:

- Crear rama `feature/borradores-persistentes`.
- Revisar estado actual del editor luego del cambio de titulo separado.
- Verificar tests actuales antes de tocar comportamiento.

Criterios de salida:

- Rama feature creada.
- `npm run lint` pasa.
- `npm test -- tests/unit/components/NoteEditor.test.js` pasa.

### Fase 1 - Servicio de borrador

Objetivo:

Crear una capa pequena y testeable para persistir/restaurar/limpiar el borrador.

Archivos esperados:

- `src/services/EditorDraftService.js`
- `tests/unit/services/EditorDraftService.test.js`

Tareas:

- Definir constante de storage key.
- Implementar `saveDraft(draft)`.
- Implementar `loadDraft()`.
- Implementar `clearDraft()`.
- Implementar normalizacion y validacion del payload.
- Manejar `localStorage` no disponible.
- Manejar JSON corrupto limpiando el borrador.

Criterios de salida:

- Tests cubren guardado, carga, limpieza, payload corrupto y storage no disponible.
- Ningun componente UI depende aun del servicio.

### Fase 2 - Captura automatica desde el editor

Objetivo:

Guardar el estado del editor mientras el usuario escribe, sin crear ni actualizar notas definitivas.

Archivos esperados:

- `src/components/NoteEditor.js`
- `tests/unit/components/NoteEditor.test.js`

Tareas:

- Guardar borrador al cambiar titulo.
- Guardar borrador al cambiar cuerpo.
- Guardar borrador al cambiar materia.
- Guardar con debounce corto, por ejemplo 300-800 ms.
- Forzar guardado inmediato en eventos criticos:
  - `visibilitychange`;
  - `pagehide`;
  - antes de destruir el editor;
  - antes de cambiar de nota activa.
- Evitar guardar borradores vacios de notas nuevas.
- Diferenciar modo `create` y modo `edit`.

Criterios de salida:

- Nota nueva en progreso genera borrador.
- Nota nueva vacia no genera borrador.
- Edicion en progreso genera borrador asociado a `noteId`.
- Guardar/actualizar sigue funcionando igual.

### Fase 3 - Restauracion amable

Objetivo:

Restaurar el borrador cuando el usuario vuelve a Lumapse, sin sorprenderlo ni taparle la app.

Tareas:

- Al inicializar el editor, buscar borrador existente.
- Si el borrador es de creacion, restaurar titulo, cuerpo y materia.
- Si el borrador es de edicion, restaurar modo edicion y asociarlo a la nota original.
- Mostrar estado visual `Borrador recuperado` o `Cambios pendientes`.
- Mantener foco natural en el cuerpo, salvo que el titulo sea lo unico escrito.

Criterios de salida:

- Reabrir app restaura nota nueva en curso.
- Reabrir app restaura edicion pendiente.
- No se crea card automaticamente.
- El usuario entiende que aun debe guardar/actualizar o descartar.

### Fase 4 - Indicador visual y accion de descarte

Objetivo:

Hacer visible el estado pendiente sin abrumar.

Tareas:

- Agregar clase visual al composer cuando hay borrador pendiente.
- Agregar texto discreto: `Borrador sin guardar` o `Cambios pendientes`.
- Agregar boton secundario `Descartar`.
- Pedir confirmacion antes de descartar.
- Limpiar editor o volver al estado guardado segun el modo.

Criterios de salida:

- El estado pendiente es visible pero no grita.
- El usuario puede cancelar su propia intencion.
- Descartar limpia storage.
- Descartar una edicion no modifica la nota original.

### Fase 5 - Limpieza al guardar o actualizar

Objetivo:

Asegurar que el borrador no sobreviva cuando el usuario confirma.

Tareas:

- En `Guardar`, crear nota y limpiar borrador.
- En `Actualizar`, actualizar nota y limpiar borrador.
- Si falla el guardado, conservar borrador.
- Si se sale del modo enfoque tras guardar, no restaurar borrador viejo.

Criterios de salida:

- No hay borradores obsoletos despues de guardar.
- Si falla persistencia, el texto queda recuperable.
- Tests cubren exito y falla.

### Fase 6 - Casos limite

Objetivo:

Evitar sorpresas en flujos reales de estudiantes.

Casos a revisar:

- El usuario cambia de materia mientras hay borrador.
- El usuario edita una nota y luego la nota es enviada a papelera desde otra accion.
- El usuario restaura un borrador de edicion cuyo `noteId` ya no existe.
- El usuario cambia a vista Papelera o Backup.
- El usuario entra y sale de Modo Enfoque.
- El usuario escribe solo titulo.
- El usuario escribe solo cuerpo.
- El usuario pega `# Titulo` en el cuerpo.

Criterios de salida:

- Los casos tienen comportamiento definido.
- No hay perdida silenciosa.
- No hay creacion accidental de notas.

### Fase 7 - Documentacion y validacion final

Objetivo:

Actualizar evidencia de producto y cerrar feature.

Tareas:

- Actualizar `CHANGELOG.md`.
- Actualizar requisitos o historias si corresponde:
  - `docs/producto/requisitos-funcionales.md`;
  - `docs/producto/historias-de-usuario.md`.
- Ajustar diagramas/documentacion si el alcance lo requiere.
- Ejecutar:
  - `npm run lint`;
  - `npm test`;
  - `npm run build`.
- Probar manualmente en Android o navegador mobile:
  - escribir nota nueva;
  - salir y volver;
  - guardar;
  - editar nota existente;
  - salir y volver;
  - descartar;
  - actualizar.

Criterios de salida:

- Suite completa verde.
- Build verde.
- Flujo validado manualmente.
- PR listo para merge.

## Riesgos

### Borradores obsoletos

Riesgo:

Restaurar un borrador viejo puede confundir.

Mitigacion:

- Mostrar timestamp relativo si el borrador tiene mas de cierto tiempo.
- Permitir descartar facilmente.
- Limpiar siempre al guardar/actualizar.

### Conflicto con nota editada

Riesgo:

La nota original pudo cambiar desde que se creo el borrador.

Mitigacion inicial:

- Guardar `baseUpdatedAt`.
- Si cambia, mostrar aviso discreto antes de aplicar.
- En primera version, priorizar no perder el borrador y no pisar silenciosamente.

### Ruido visual

Riesgo:

Demasiados indicadores pueden romper la calma de Lumapse.

Mitigacion:

- Una sola senal visual.
- Texto corto.
- Sin colores de error.
- Sin modal al restaurar, salvo para descartar.

### Dependencia de localStorage

Riesgo:

`localStorage` puede fallar o estar bloqueado en algunos entornos.

Mitigacion:

- Servicio tolerante a errores.
- No romper el editor si falla.
- Evaluar SQLite si las pruebas en Android muestran problemas.

## Criterios de aceptacion globales

- Un estudiante puede escribir una nota nueva, salir de la app y volver sin perder texto.
- Un estudiante puede editar una nota existente, salir de la app y volver sin perder cambios pendientes.
- Guardar crea la nota y limpia el borrador.
- Actualizar modifica la nota y limpia el borrador.
- Descartar respeta la decision del usuario y limpia el borrador.
- No se crean notas finales sin confirmacion.
- No se actualizan notas finales sin confirmacion.
- El indicador visual no abruma.
- La feature funciona offline.
- Tests unitarios cubren servicio, editor y flujos principales.

## Preguntas abiertas antes de implementar

- Texto final del indicador: `Borrador sin guardar` o `Cambios pendientes`.
- Texto final de descarte en creacion: `Descartar` o `Limpiar borrador`.
- Texto final de descarte en edicion: `Cancelar edicion` o `Descartar cambios`.
- Tiempo de debounce: 300 ms, 500 ms u 800 ms.
- Politica de antiguedad: restaurar siempre o avisar si el borrador tiene mas de 7 dias.

## Recomendacion inicial

Implementar en este orden:

1. Servicio de borrador.
2. Persistencia automatica desde editor.
3. Restauracion al iniciar.
4. Indicador visual y descarte.
5. Casos limite y documentacion.

La primera version debe resolver una sola cosa muy bien: que Lumapse cuide el texto en curso sin crear confusion ni notas fantasma.
