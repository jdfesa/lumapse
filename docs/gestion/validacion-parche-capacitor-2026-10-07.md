# Validación del parche de dependencias — 2026-10-07

**Base:** `main`/`origin/main` en `f86afd3`.

**Rama:** `fix/dependency-security-capacitor`.

**Parche:** `8c25c78` (`fix(deps): patch Capacitor security advisory`).

**Entorno:** Node **22.20.0**, npm **10.9.3**, sin `NODE_OPTIONS`.

**Estado:** remediación local verificada; no se generó ni instaló una APK, no se
publicó una release y no se ejecutó todavía la captura de tráfico Android.

## Motivo y alcance

La auditoría actual del checkout detectó un advisory crítico en la dependencia
productiva `@capacitor/android@8.3.4` y un advisory alto en `source-map-js@1.2.1`.
La remediación se limitó a los nodos afectados y a la versión de `@capacitor/core`
requerida por el peer de Android. No se actualizaron otros plugins de Capacitor,
no se agregaron overrides y no se ejecutó `npm audit fix`.

| Paquete | Antes → después | Alcance |
|---|---|---|
| `@capacitor/android` | `8.3.4` → **`8.5.2`** | Dependencia productiva directa; corrige [GHSA-rvm3-566m-v7fv](https://github.com/advisories/GHSA-rvm3-566m-v7fv), CVSS 9.3, crítico. |
| `@capacitor/core` | `8.3.4` → **`8.5.2`** | Dependencia productiva directa; satisface el peer `^8.5.0` requerido por Android 8.5.2. |
| `source-map-js` | `1.2.1` → **`1.2.2`** | Dependencia transitiva de tooling; corrige [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), CVSS 7.5, alto. |

El `npm audit fix --dry-run` propuso además 56 paquetes opcionales de plataforma.
Esa ampliación no se aplicó: el cambio final modifica únicamente los tres nodos
anteriores y sus referencias de versión/integridad.

## Auditoría inicial y resolución

| Auditoría | Antes del parche | Después del parche |
|---|---:|---:|
| `npm audit --json` | 1 crítico + 1 alto | **0 vulnerabilidades** |
| `npm audit --omit=dev --json` | 1 crítico productivo | **0 vulnerabilidades** |

La consulta inicial sin red falló por `ENOTFOUND registry.npmjs.org`; se repitió con
acceso de red autorizado y se conservaron los resultados JSON fuera del repositorio.
La resolución dirigida se hizo con `npm install --package-lock-only` para Capacitor
y `npm update source-map-js --package-lock-only`; luego `npm ci` validó el lockfile,
los lifecycle hooks y el runtime canónico.

## Controles ejecutados

| Control | Resultado |
|---|---|
| `npm run check:runtime` | PASS — Node 22.20.0/npm 10.9.3 |
| `npm ci` | PASS — instalación desde lockfile; 0 advisories reportados |
| `npm ls @capacitor/android @capacitor/core source-map-js --all` | PASS — grafo válido; 8.5.2/8.5.2/1.2.2 |
| `npm audit --json` | PASS — 0 vulnerabilidades |
| `npm audit --omit=dev --json` | PASS — 0 vulnerabilidades productivas |
| `npm run verify` | PASS — gate completo; conserva tres warnings de lint y avisos de tamaño preexistentes |
| `npm run check:offline` | PASS — no hay URLs externas bloqueantes en código/assets |
| `git diff --check` | PASS |

## Límites y estado RNF

Este parche resuelve el bloqueo conocido de dependencias, pero no completa por sí
solo `RNF-012` ni `RNF-013`:

- `RNF-012` continúa con evidencia parcial hasta registrar tráfico real durante los
  flujos Android completos.
- `RNF-013` conserva evidencia parcial: la auditoría estática y de dependencias no
  encontró advisories ni referencias externas bloqueantes, pero falta el reporte de
  ejecución/runtime y la captura de tráfico correspondiente.
- No se validó Android sobre una APK nueva. La evidencia de `v0.5.0`, `RNF-009` y
  `RNF-010` no se transfiere automáticamente a un candidato posterior.

La captura de tráfico y la revisión final de trackers quedan como unidad separada;
este commit no autoriza release, bump de versión, instalación ni merge.
