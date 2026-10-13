# Validación acotada de nombres accesibles — RNF-022

**Inicio:** 2026-10-13 (Argentina)<br>
**Rama:** `test/rnf-022-accessible-names`<br>
**Base:** `21624e0`<br>
**Estado:** plan aceptado; inspección y resultados pendientes.

## Objetivo y alcance acordados

Comprobar nombres accesibles de controles sin texto visible y alternativas de
imágenes informativas en las superficies existentes de Lumapse. Corregir solo
fallos demostrados de RNF-022, sin rediseño ni cambios de comportamiento funcional.
El autor autorizó rama, commits Conventional Commits en inglés, push y PR para
revisión. No autorizó merge, APK final ni publicación.

El autor confirmó teléfono de pruebas conectado a este equipo, con notas de prueba,
desbloqueado y root; permite su uso y despertar la pantalla. Se preservan notas,
borradores, papelera y preferencias. Un debug privado necesario para comprobar
correcciones utiliza el script habitual, sin `--clean`, bump ni firma de release.

Se revisarán principal/editor/feed, menús, organización/búsqueda, fechas, Backup,
Acerca de, Papelera y diálogos disponibles, separando recorridos reales de pruebas
aisladas. Contenido arbitrario del usuario y destinos externos no se certifican.
Quedan fuera teclado/foco (RNF-020), Lighthouse (RNF-019), contraste, rendimiento,+nuevas funciones y otros cambios de producto.

## Método, pruebas y aceptación

1. Identificar dispositivo, fuente/canal, versión/code, hash APK y certificado.
2. Inventariar controles e imágenes; contrastar DOM con nombres calculados del
   árbol de accesibilidad del WebView y revisar manualmente propósito/contexto.
   No equiparar presencia de `title`/`aria-label` a nombre correcto.
3. Distinguir imágenes decorativas de informativas, estados ocultos y controles
   que aparecen al abrir menús/diálogos. Registrar cobertura y ausencias explícitas.
4. Corregir solo incumplimientos reproducidos y agregar regresiones focalizadas.
   Si cambia la app, repetir revisión sobre debug identificado y firma compatible.
5. Ejecutar tests focalizados y `npm run verify`, controles de enlaces/trazabilidad
   y actualizar las fuentes canónicas con resultados reales.

La aceptación requiere **cero elementos relevantes sin nombre accesible en el
alcance revisado**, alternativas que describan su propósito, evidencia reproducible
y límites visibles. Si la cobertura es incompleta no se declara cumplimiento
global. La revisión y autorización de integración del autor siguen pendientes.

Referencias: [WCAG 2.2 — alternativas de contenido no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
[nombres de controles](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)
y [protocolo Accessibility de Chromium](https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/).
No es una certificación WCAG exhaustiva ni una prueba de TalkBack.

## Preparación comprobada

- `main` limpio y sincronizado con `origin/main` en `21624e0`, divergencia 0/0;
  GitHub sin PR abiertos, PR #37 integrado. Rama creada desde esa base.
- `npm run check:runtime`: exit 0, Node 22.20.0/npm 10.9.3 existentes;
  sin instalaciones ni cambios globales.
- `npm run check:docs`: exit 0, 106 archivos/915 enlaces, cero errores.
- `npm run check:traceability`: exit 0, cero advertencias.
- `npm run check:a11y`: exit 0, cero avisos. Es estático, no verifica RNF-022.
- `npm run doctor:android`: primer diagnóstico sin SDK/JDK en PATH dio tres
  advertencias ambientales. Seleccionados los existentes, exit 0 sin advertencias:
  un Samsung SM-G965F conectado, app y SQLite presentes. Sin modificar datos.

## Resultados

Pendientes de ejecución. No se atribuye evidencia previa al binario que se revise.
