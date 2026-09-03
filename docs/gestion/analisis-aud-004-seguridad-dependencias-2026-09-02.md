# Análisis AUD-004 — Seguridad de dependencias

**Fecha de revalidación:** 2026-09-02  
**Base Git:** `45b2b1ea162ec94b993e9b959c2435d6e4dcd191` (`main` y `origin/main`)  
**Entorno:** Node.js `v22.20.0`, npm `10.9.3`  
**Rama:** `fix/aud-004-dependency-security`  
**Estado:** plan de remediación aprobado técnicamente; implementación y gates pendientes

## 1. Alcance

AUD-004 cubre exclusivamente la dependencia productiva DOMPurify y las vulnerabilidades del
toolchain informadas por `npm audit`. Este frente no incluye otros hallazgos de la revisión
técnica, refactors, cambios funcionales, modificaciones al release helper, incremento de versión,
publicación de APK, tags ni líneas base.

La versión debe permanecer en `0.4.8`; Android debe conservar `versionName 0.4.8` y
`versionCode 408`.

## 2. Baseline reproducible

Comandos ejecutados desde la raíz del repositorio:

```bash
node --version
npm --version
npm audit --json
npm audit --omit=dev --json
npm explain <paquete>
npm audit fix --dry-run --json
```

Resultados frescos:

| Auditoría | Critical | High | Moderate | Total |
|---|---:|---:|---:|---:|
| Completa | 1 | 5 | 2 | 8 |
| Producción (`--omit=dev`) | 0 | 0 | 1 | 1 |

La única exposición del bundle productivo es `dompurify@3.4.2`, dependencia directa. Las otras
siete entradas pertenecen exclusivamente al entorno de desarrollo, build, tests o CLI nativa.

## 3. Grafo, advisories y selección de versiones

| Paquete | Alcance y cadena introductora | Versión actual | Último rango vulnerable decisivo | Versión elegida |
|---|---|---:|---:|---:|
| `dompurify` | Producción; dependencia directa | 3.4.2 | `<=3.4.12` | 3.4.14 |
| `vite` | Desarrollo; dependencia directa y peer de Vitest | 6.4.2 | `<=6.4.2` | 6.4.3 |
| `tar` | Desarrollo; `@capacitor/cli@8.3.4 -> tar` | 7.5.15 | `<=7.5.20` | 7.5.22 |
| `postcss` | Desarrollo; `vite -> postcss` | 8.5.10 | `<=8.5.22` | 8.5.26 |
| `nanoid` | Desarrollo; `vite -> postcss -> nanoid` | 3.3.11 | `<=3.3.17` | 3.3.18 |
| `undici` | Desarrollo/tests; `jsdom@29.1.1 -> undici` | 7.25.0 | `<7.29.0` | 7.29.0 |
| `brace-expansion` | Desarrollo; toolchain ESLint/Capacitor mediante `minimatch` | 5.0.5 | `<5.0.9` | 5.0.9 |
| `@xmldom/xmldom` | Desarrollo/CLI; `@capacitor/cli -> plist -> @xmldom/xmldom` | 0.9.10 | `<=0.9.11` | 0.9.12 |

Advisories determinantes y fuentes primarias de versión:

- DOMPurify: [GHSA-55q2-fjhq-7xh7](https://github.com/advisories/GHSA-55q2-fjhq-7xh7)
  fija el mayor límite afectado actual (`<=3.4.12`). También aplican los advisories de `IN_PLACE`,
  configuración y hooks incluidos en la auditoría; la
  [release 3.4.14](https://github.com/cure53/DOMPurify/releases/tag/3.4.14) agrega hardening
  posterior dentro de la misma línea 3.x.
- Vite: [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) y
  [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff); ambos dejan de
  afectar a partir de 6.4.3.
- `tar`: [GHSA-23hp-3jrh-7fpw](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) es el
  hallazgo crítico y [GHSA-r292-9mhp-454m](https://github.com/advisories/GHSA-r292-9mhp-454m)
  eleva el límite afectado hasta 7.5.20.
- PostCSS: [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) cubre la
  corrección incompleta hasta 8.5.22; el
  [changelog oficial](https://github.com/postcss/postcss/blob/main/CHANGELOG.md) registra el
  endurecimiento de source maps en 8.5.23.
- nanoid: [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) requiere
  3.3.18 o posterior dentro de 3.x.
- undici: [GHSA-8xcm-r25x-g524](https://github.com/advisories/GHSA-8xcm-r25x-g524) y
  [GHSA-4cwx-7wf7-3272](https://github.com/advisories/GHSA-4cwx-7wf7-3272) mantienen afectada
  la rama 7.x anterior a 7.29.0.
- `brace-expansion`: [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895)
  requiere 5.0.9 o posterior.
- `@xmldom/xmldom`: [GHSA-6gmq-8vp8-gcm6](https://github.com/advisories/GHSA-6gmq-8vp8-gcm6)
  afecta 0.9.0–0.9.11; 0.9.12 es la primera versión fuera del rango.

Las versiones seleccionadas fueron verificadas además contra sus manifests publicados en el
registro npm. No se requiere ningún salto de major: DOMPurify permanece en 3.x, Vite en 6.x y
Capacitor en 8.x.

## 4. Compatibilidad y estrategia de lockfile

Los rangos declarados por los padres admiten todos los parches seleccionados:

- `@capacitor/cli@8.3.4` declara `tar ^7.5.3`;
- `vite@6.4.3` declara `postcss ^8.5.3`;
- `postcss@8.5.26` declara `nanoid ^3.3.17`;
- `jsdom@29.1.1` declara `undici ^7.25.0`;
- `minimatch@10.2.5` declara `brace-expansion ^5.0.5`;
- `plist@3.1.1` declara `@xmldom/xmldom ^0.9.10`.

El único cambio de plataforma observable es que `brace-expansion@5.0.9` declara Node.js 20 o
22 en adelante. Es compatible con el entorno local Node 22 y el CI Node 22; sigue siendo una
dependencia exclusiva del toolchain.

`npm audit fix --dry-run` propone los ocho parches, pero también intenta agregar 56 paquetes
opcionales de plataforma de Rollup/esbuild que ya están representados en el lockfile. No se usará
esa operación amplia. Una simulación aislada con instalación dirigida y actualización explícita
de las seis transitivas produjo solamente 28 inserciones y 28 eliminaciones en `package-lock.json`,
sin variar sus 356 nodos. La implementación seguirá ese camino y rechazará cualquier diff más
amplio sin una causa nueva comprobable.

No se agregarán transitivas como dependencias directas y no se introducirán `overrides`.

## 5. Alcanzabilidad en MarkdownService

`src/services/MarkdownService.ts` pasa un string generado por Marked a `DOMPurify.sanitize()` y
recibe un string limpio. No usa:

- `IN_PLACE`;
- `setConfig()` ni `clearConfig()`;
- `CUSTOM_ELEMENT_HANDLING`;
- `SAFE_FOR_TEMPLATES`;
- modos de salida DOM o Trusted Types;
- mutación de `data.allowedTags` o `data.allowedAttributes` desde hooks.

El único hook persistente es `afterSanitizeAttributes`; elimina atributos o URLs no permitidos y
agrega `rel`/`target` seguros, pero no elimina nodos ni modifica allow-lists. Por lo tanto, las rutas
más específicas de los advisories de DOMPurify no son alcanzables con la configuración actual.
Eso reduce la explotabilidad inmediata, pero no justifica conservar una dependencia productiva
vulnerable.

La suite existente ya cubre Markdown válido, headings, listas, checkboxes, callouts, eliminación
de `script` y handlers `on*`, protocolos peligrosos, política de imágenes locales/remotas, tablas y
los efectos esperados del hook. Solo se agregarán casos si el upgrade revela una regresión o una
ruta relevante sin cobertura.

## 6. Plan de implementación y pruebas

1. Elevar los pisos directos a `dompurify ^3.4.14` y `vite ^6.4.3`.
2. Actualizar en el lockfile únicamente `tar`, `postcss`, `nanoid`, `undici`,
   `brace-expansion` y `@xmldom/xmldom` a los parches indicados.
3. Confirmar que no cambien la versión de la aplicación ni las versiones Android y que no aparezcan
   dependencias directas u overrides nuevos.
4. Ejecutar `npm ci`, ambas auditorías, `npm ls --all`, la suite focalizada de Markdown y todos los
   gates solicitados (`test`, `lint`, `typecheck`, `build`, tamaño, diálogos nativos, a11y,
   documentación, trazabilidad y `verify`).
5. Preparar e instalar el build Android conservando datos y completar el gate manual antes del
   cierre documental.

## 7. Criterios de cierre

AUD-004 solo podrá marcarse como cerrado cuando:

- `npm audit --omit=dev` informe 0 vulnerabilidades;
- `npm audit` informe 0 vulnerabilidades o exista una excepción aceptada explícitamente;
- la instalación reproducible, tests, lint, typecheck, build y gates auxiliares pasen sin relajarse;
- el diff del lockfile quede limitado y explicado;
- el build Android preserve `0.4.8`/`408`, datos SQLite y comportamiento de sanitización;
- el usuario apruebe explícitamente la checklist Android.

