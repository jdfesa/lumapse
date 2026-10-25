# Manual de usuario de Lumapse 0.6.0

**[Abrir manual interactivo](https://jdfesa.github.io/lumapse/manual-de-usuario-lumapse.html)**

Para leerlo en línea, usá el enlace anterior: GitHub muestra el código al abrir
el archivo HTML dentro del repositorio.

Para leerlo sin conexión, descargá o cloná esta carpeta, abrí
`manual-de-usuario-lumapse.html` en un navegador y conservá `assets` a su lado.
Funciona sin instalación ni internet.

## Para editar y regenerar

Editá el texto y los recursos en `fuentes/`, no el HTML generado.

Desde esta carpeta, con **Node 22.20.0**:

```sh
node fuentes/build.mjs
node fuentes/build.mjs --check
node --test fuentes/model.test.mjs fuentes/manual.test.mjs
```

## Publicación web

El workflow [Publicar manual de usuario](../../.github/workflows/manual-pages.yml)
publica en GitHub Pages desde `main` cuando cambia el HTML, sus imágenes o el propio
workflow. También se puede ejecutar manualmente desde la pestaña **Actions**.
En **Settings → Pages**, el origen de publicación es **GitHub Actions**.

El flujo comprueba que el HTML coincide con las fuentes y ejecuta los tests del
manual. Después prepara únicamente el HTML y `assets/` en un directorio temporal
del runner; no publica `fuentes/`, el resto de la documentación ni la aplicación.
La raíz del sitio redirige a `manual-de-usuario-lumapse.html`.
No se mantiene una segunda copia del manual en el repositorio ni en `web-lumapse`.
