# Validación acotada de contraste — RNF-021

**Inicio:** 2026-10-12 (Argentina)  
**Rama:** `test/rnf-021-contrast`  
**Base:** `81c438f7c5d0c82c55e8ef0d8d0055cc4f872c9e`  
**Estado:** plan aceptado; medición y cierre pendientes.

## Objetivo y alcance acordados

El autor aceptó comprobar el contraste del texto en los temas claro y oscuro y
corregir únicamente incumplimientos demostrados de `RNF-021` (ratio **≥4,5:1**).
Esta es la única unidad activa: no se abren otros frentes ni se rediseña la app.
Se autorizan commits Conventional Commits en inglés, push final y preparación de
un PR; no merge ni publicación.

El recorte incluye texto de lectura/edición, etiquetas, metadatos, placeholders,
menús, avisos y diálogos existentes. Los fondos con transparencia y las opacidades
se deben componer antes de calcular el ratio. Los colores elegidos para materias
o tipos de fechas se revisan cuando aparecen como texto; no se cambian los datos.

Quedan fuera teclado/foco, nombres accesibles, Lighthouse, adopción, rendimiento,
dependencias, persistencia y funciones nuevas. Una prueba de contraste no acredita
los demás RNF ni una certificación exhaustiva de accesibilidad.

## Método y aceptación

1. Identificar dispositivo, APK instalada, fuente, canal, hash y certificado;
   registrar el estado de prueba y preservar notas/borrador/tema.
2. Obtener colores computados del WebView y sus fondos efectivos en ambos temas,
   con recorrido de las superficies y fixtures transitorios para los estados no
   presentes en las notas de prueba. Distinguir esos fixtures del flujo real.
3. Calcular luminancia relativa sRGB y ratio `(Lmayor + 0,05)/(Lmenor + 0,05)`;
   comparar sin redondear con 4,5. La revisión visual complementa la medición.
4. Corregir solo los fallos medidos y agregar regresiones focalizadas; repetir la
   medición sobre el debug identificado si cambia el código.
5. Ejecutar `npm run verify` sobre el cambio final, revisar evidencia y límites,
   actualizar RNF y tablero con resultados reales y preparar el PR para el autor.

Referencia del método: [WCAG 2.2 — luminancia relativa](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance)
y [contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Se conserva el umbral del proyecto incluso para títulos; se distinguen los controles
inactivos y los iconos/decoraciones sin texto, no evaluados como texto normal.

La aceptación requiere pares de colores, ratios, superficies/estados y artefacto
reproducibles, con cobertura y límites explícitos. Si la cobertura es parcial,
no se declara cumplimiento global. La revisión del autor y el merge permanecen
pendientes hasta su confirmación expresa.

## Preparación comprobada

- `main` limpio y sincronizado, divergencia 0/0; GitHub sin PR abiertos.
- `check:runtime`: exit 0, Node 22.20.0/npm 10.9.3 existentes, sin instalar ni
  modificar el runtime global.
- `check:docs`: exit 0, 105 archivos/901 enlaces, sin errores ni anclas pendientes.
- `check:traceability`: exit 0, sin advertencias.
- Regresiones fuente RNF-007/RNF-008: exit 0, 8 casos; no son mediciones Android.
  El runner se reejecutó fuera del sandbox para confirmar los casos completos.
- El autor confirmó Samsung conectado a este equipo, desbloqueado, con root y
  únicamente notas de prueba; autoriza inspección y debug habitual si hace falta,
  preservando datos, sin `--clean` ni publicación. La identidad se verificará antes
  de intervenir.

## Resultados y cierre

Pendientes. Este plan no modifica todavía el estado `Pendiente` de RNF-021.
El corte APK de presentación se decidirá después de los imprescindibles; informe,
manual y defensa siguen el [recorte vigente](../../BACKLOG.md#cierre-de-entrega-y-deuda-postdefensa).
