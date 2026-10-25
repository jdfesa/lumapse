# Manual de usuario de Lumapse 0.6.0

Abrí [manual-de-usuario-lumapse.html](./manual-de-usuario-lumapse.html) en un navegador
y conservá la carpeta `assets` a su lado. Funciona sin instalación ni internet.

## Para editar y regenerar

Editá el texto y los recursos en `fuentes/`, no el HTML generado.

Desde esta carpeta, con **Node 22.20.0**:

```sh
node fuentes/build.mjs
node fuentes/build.mjs --check
node --test fuentes/model.test.mjs fuentes/manual.test.mjs
```
