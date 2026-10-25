# Manual de usuario de Lumapse 0.6.0

**Para leer la guía, abrí [manual-de-usuario-lumapse.html](./manual-de-usuario-lumapse.html)
en un navegador.** Conservá la carpeta `assets` a su lado. No necesita instalación
ni internet; este archivo README no es el manual.

## Para editar y regenerar

El código está en `fuentes/`: `manual-usuario.md` contiene el texto; `style.css`
y `app.js`, la presentación y las interacciones; `ilustracion.svg`, el dibujo
editable terminado, y `model.mjs`, sus gestos. No edites el HTML generado directamente.

Desde esta carpeta, con **Node 22.20.0**:

```sh
node fuentes/build.mjs
node fuentes/build.mjs --check
node --test fuentes/model.test.mjs fuentes/manual.test.mjs
```

El generador actualiza sólo el HTML; incorpora el SVG existente, sin reconstruir
geometría ni requerir Anatomy. La única biblioteca incluida es Marked, en
`fuentes/vendor/marked/`, para convertir el texto Markdown, con su licencia MIT.
La licencia de la ilustración está en `fuentes/LICENSE-ILUSTRACION.txt`.
No requiere `npm install` ni descargas. Las tipografías son las del sistema.
`--check` verifica sin escribir archivos.
