# Plan: Drawer de materias colapsables

Fecha: 2026-06-09
Rama de trabajo: `feature-drawer-subject-collapse`

## Contexto

El drawer de Lumapse muestra hoy todas las materias y todas sus secciones de forma expandida. Con pocas materias funciona bien, pero con muchas materias activas y varias secciones por materia la navegacion se vuelve larga, ruidosa y poco comoda en mobile.

Este ajuste busca que el estudiante pueda mantener una vista compacta cuando lo necesita, sin perder el acceso rapido a sus secciones.

## Principios

- Offline first: la preferencia debe vivir localmente y funcionar sin red.
- Mobile first: el control debe ser tocable, claro y no agregar friccion en pantallas chicas.
- Student first: la organizacion debe sentirse simple desde el dia 1, incluso si el estudiante aun no tiene una estructura perfecta.

## Objetivo

Agregar un control de expandir/contraer secciones por materia en el drawer, con persistencia local de la ultima decision del usuario.

## Alcance

- Agregar una flecha/boton junto al color de cada materia que tenga secciones.
- Permitir contraer o expandir las secciones de cada materia.
- Persistir el estado colapsado/expandido en `localStorage`.
- Mantener expandido por defecto para no cambiar de golpe el comportamiento actual.
- Evitar que el boton de expandir/contraer dispare navegacion.
- Mantener accesibilidad basica con `aria-expanded` y labels claros.
- Expandir automaticamente una materia cuando se crea una seccion nueva dentro de ella.

## Fuera de alcance

- Cambiar el modelo de datos de materias/secciones.
- Cambiar la navegacion por materia o seccion.
- Cambiar reglas de archivado, papelera o conteos.
- Agregar busqueda especifica dentro del arbol de materias.
- Sincronizar esta preferencia entre dispositivos.

## Decisiones UX

- Estado inicial: expandido, para respetar la experiencia actual.
- Persistencia: por materia raiz, usando el ID de la materia.
- Si una seccion activa queda dentro de una materia colapsada, la materia debe mostrar una senal clara de contexto o expandirse automaticamente. Decision propuesta para Fase 2: expandir automaticamente la materia activa para evitar que el usuario pierda ubicacion.
- Materias sin secciones no necesitan flecha.
- La flecha debe ser discreta y familiar: cerrada apunta a la derecha, abierta apunta hacia abajo.

## Fases

### Fase 0 - Preparacion

- [x] Crear rama de trabajo.
- [x] Crear este plan en la raiz del repo.
- [x] Confirmar comportamiento deseado para seccion activa dentro de materia colapsada.

### Fase 1 - Estado persistente local

- [x] Definir clave de `localStorage`.
- [x] Crear helpers para leer/escribir IDs de materias colapsadas.
- [x] Manejar errores silenciosamente si `localStorage` no esta disponible.
- [x] Mantener expandido por defecto cuando no exista preferencia previa.

### Fase 2 - Render e interaccion del drawer

- [x] Agregar boton de expandir/contraer por materia con secciones.
- [x] Renderizar secciones segun estado expandido/colapsado.
- [x] Actualizar `aria-expanded`.
- [x] Evitar navegacion cuando se toca la flecha.
- [x] Expandir una materia al crear una nueva seccion.
- [x] Resolver visualmente el caso de seccion activa dentro de materia colapsada.

### Fase 3 - Estilos mobile first

- [x] Ajustar tamanos tactiles del boton.
- [x] Mantener alineacion con bolita de color, nombre y contador.
- [x] Evitar saltos visuales al expandir o contraer.
- [x] Verificar nombres largos con ellipsis.
- [x] Mantener coherencia visual con el resto del drawer.

### Fase 4 - Tests

- [x] Testear que una materia con secciones renderiza flecha.
- [x] Testear que una materia sin secciones no renderiza flecha.
- [x] Testear contraer y expandir.
- [x] Testear persistencia en `localStorage`.
- [x] Testear que click en la flecha no navega.
- [x] Testear que crear seccion expande la materia padre.

### Fase 5 - Verificacion manual

- [ ] Probar drawer con pocas materias.
- [ ] Probar drawer con muchas materias y muchas secciones.
- [ ] Probar mobile viewport.
- [ ] Probar que la preferencia persiste al cerrar y reabrir la app.
- [ ] Probar sin `localStorage` disponible.

## Criterios de aceptacion

- El usuario puede ver solo materias principales si contrae secciones.
- La app recuerda la ultima decision del usuario.
- La navegacion por materia y seccion sigue funcionando igual.
- El drawer se mantiene usable con N materias y N secciones.
- La experiencia sigue sintiendose nativa de Lumapse.
- La solucion no introduce dependencias nuevas.

## Verificacion tecnica esperada

- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run check:native-dialogs`

## Notas de producto

Este cambio no busca ocultar complejidad academica, sino permitir que el estudiante elija cuanto detalle necesita ver en cada momento. El drawer debe ayudar a orientarse, no convertirse en una lista interminable que obligue a hacer scroll para todo.

## Estado 2026-06-10

- Fases 0 a 4 cerradas por implementacion y tests automatizados.
- Verificacion tecnica ejecutada: `npm run test`, `npm run build`, `npm run lint`, `npm run check:native-dialogs`.
- Verificacion manual pendiente: no se pudo levantar el servidor local dentro del sandbox (`EPERM` en `127.0.0.1:5173`) y no se aprobo ejecutarlo fuera del sandbox.
