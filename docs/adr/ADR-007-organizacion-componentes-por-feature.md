# ADR-007: Organización de Componentes por Feature

**Fecha:** 2026-06-11  
**Estado:** Aceptado  
**Autor:** Jose David Sandoval

---

## Contexto

La carpeta `src/components/` creció hasta concentrar componentes de dominios distintos: editor, feed, fechas académicas, backup, Markdown y componentes compartidos. Aunque cada archivo mantenía una responsabilidad razonable, una carpeta plana con muchos archivos empezaba a dificultar la navegación del código y aumentaba el riesgo de tocar el componente equivocado durante mantenimiento.

La auditoría local también mostraba varios módulos de UI por encima del umbral saludable de 250 LOC. La prioridad no era cambiar comportamiento, sino ordenar la ubicación de las piezas para que Lumapse pueda escalar y para que un desarrollador futuro encuentre rápidamente qué archivos pertenecen a cada flujo de usuario.

## Decisión

Organizar `src/components/` por **feature folders**. Cada carpeta agrupa componentes, helpers y CSS que pertenecen al mismo flujo funcional:

```txt
src/components/
├── academic-events/   # Calendario, heatmap y fechas académicas
├── backup/            # Vista UI del backup manual
├── common/            # Componentes reutilizables transversales
├── feed/              # Listado, tarjetas, acciones y papelera
├── markdown/          # Preview y estilos del Markdown renderizado
└── note-editor/       # Composer, borradores, comandos y popups del editor
```

Reglas de organización:

1. **Agrupar por funcionalidad, no por tipo técnico.** Por ejemplo, `NoteEditor.js`, `NoteEditorDrafts.js`, `SubjectPicker.js` y `editorCommandRegistry.js` viven juntos porque todos sostienen el flujo de edición.
2. **Colocar CSS junto a la feature que estiliza.** El CSS compartido de Markdown queda en `markdown/` y puede ser importado desde otras features.
3. **Usar `common/` solo para piezas realmente transversales.** `ConfirmDialog` y `Toast` son compartidos por varios flujos; componentes específicos no deben moverse ahí por comodidad.
4. **Mantener imports explícitos entre features.** No se introduce un barrel global de componentes para evitar ocultar dependencias y generar acoplamiento accidental.
5. **Preservar las capas existentes.** Los componentes siguen consumiendo `store/` y `services/`; la persistencia SQLite continúa encapsulada fuera de la UI.

## Consecuencias

**Positivas:**
- Mejora la navegabilidad del código: cada flujo tiene una ubicación predecible.
- Reduce el costo de onboarding de otro desarrollador.
- Facilita futuras refactorizaciones internas por feature sin mezclar dominios.
- Hace más visible el acoplamiento real entre features mediante imports explícitos.
- Mantiene los tests unitarios apuntando a unidades concretas y verificables.

**Negativas / Costos:**
- Los imports relativos quedan un poco más largos (`../../store`, `../common`, etc.).
- Cambios futuros que muevan archivos requieren actualizar rutas en tests y documentación.
- La carpeta `common/` requiere disciplina para no transformarse en un cajón de sastre.

## Guía de mantenimiento

Cuando se agregue una nueva pieza de UI:

- Si pertenece al editor, usar `src/components/note-editor/`.
- Si renderiza o acciona sobre notas del feed, usar `src/components/feed/`.
- Si pertenece a fechas académicas, usar `src/components/academic-events/`.
- Si pertenece al backup manual, usar `src/components/backup/`.
- Si procesa o presenta Markdown renderizado, usar `src/components/markdown/`.
- Si es una pieza transversal y estable usada por varias features, usar `src/components/common/`.

Si algo falla después de tocar esta estructura, revisar en este orden:

1. Imports relativos en el archivo movido.
2. Imports de CSS dentro del componente o archivo `.css`.
3. Mocks/imports de tests unitarios.
4. Entrypoints como `src/main.js`, `src/layout/*` y `src/store/*`.
5. Documentación viva que mencione rutas concretas.

## Verificación

La reestructuración se valida con:

```bash
npm test
npm run lint
npm run build
```

Además, las búsquedas de rutas antiguas ayudan a detectar referencias obsoletas:

```bash
rg "components/(Note|Academic|Heatmap|Upcoming|Confirm|Toast|Backup|Markdown|Feed|Trash|Editor|Slash|SubjectPicker|Virtual|editor)" src tests/unit
```
