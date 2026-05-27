# Lumapse -- Diagnostico del Toolchain y Doctores

Este documento registra la decision de agregar herramientas de diagnostico al
toolchain de Lumapse. Vive en `scripts/docs/` porque describe automatizacion de
desarrollo, no funcionalidad visible del producto.

---

## Contexto

Lumapse ya contaba con un conjunto amplio de scripts: calidad, trazabilidad,
schema, documentacion, Android, releases, metricas e informes. La necesidad no
era sumar scripts por volumen, sino reducir incertidumbre al iniciar una sesion
o al preparar una entrega.

El riesgo detectado era operativo:

- un entorno local puede estar incompleto aunque el codigo este bien;
- `quality.sh` podia tratar igual un binario Rust incompatible y un hallazgo
  real del auditor;
- no habia una auditoria del propio toolchain que verificara documentacion,
  entrypoints npm y politica de artefactos generados;
- el schema SQLite tenia checks de sincronizacion documental, pero faltaba una
  prueba minima que ejecutara el DDL real en SQLite.

---

## Decision

Se agregaron cuatro piezas nuevas:

| Script | Rol | Bloquea? |
|---|---|---|
| `dev-doctor.py` | Diagnostico general del entorno local | Solo si falta algo requerido |
| `android-doctor.sh` | Diagnostico Android/Capacitor/ADB | Solo si falta algo critico |
| `check-toolchain.py` | Auditoria del propio sistema de scripts | Si hay fallas de consistencia |
| `db-smoke-test.py` | Prueba minima del schema SQLite real | Si el DDL o las relaciones fallan |

La decision mantiene la separacion de responsabilidades:

- Python para diagnostico, parsing y validaciones reproducibles.
- Bash para integracion con herramientas del sistema Android.
- Rust para el camino rapido de auditoria repetida.

No se migra a Go porque no hay una presion tecnica suficiente que justifique
agregar otro runtime, otro estilo de build y otra superficie de mantenimiento.

---

## Politica de no borrado

Esta evolucion respeta la politica historica del repositorio: los scripts que
cumplieron una funcion en un momento concreto no se eliminan solo porque exista
una version nueva o mas rapida.

La razon es doble:

- preservan evidencia del proceso incremental del proyecto;
- permiten a una persona o a otra IA entender por que una herramienta existe,
  que problema resolvia y como fue reemplazada o complementada.

Cuando un script queda superado, debe marcarse como `Superseded` o explicarse en
la documentacion. Si se agrega un wrapper de compatibilidad, el script original
se conserva con un nombre historico claro, como ocurre con
`check-traceability.py.replaced`.

---

## Integracion operativa

Los nuevos entrypoints npm son:

```bash
npm run doctor
npm run doctor:android
npm run check:toolchain
npm run check:db-smoke
```

`npm run verify` incorpora `check:toolchain` y `check:db-smoke` porque ambas
validaciones son reproducibles y no dependen de hardware externo. Los doctores
quedan fuera de `verify` porque inspeccionan caracteristicas del entorno local,
como ADB o variables de Android, y pueden generar advertencias validas en una
maquina que no este preparando un build movil.

`dev-doctor.py` tambien avisa si `scripts/lumapse-audit-bin` existe pero el
codigo Rust es mas nuevo que el binario. Esto importa porque el binario es un
artefacto generado e ignorado por Git: cada maquina puede tener uno distinto.

---

## Ajuste de `quality.sh`

Antes, `quality.sh` intentaba ejecutar `lumapse-audit-bin --all` y, si el
comando terminaba con error, caia automaticamente al modo Python/Shell.

Ese comportamiento era ambiguo: un fallo podia significar "el binario no corre
en este OS" o "el auditor Rust encontro un problema real". Ahora se separan los
casos:

- si el binario no existe o no responde a `--help`, se usa fallback;
- si el binario corre y `--all` falla, el quality gate marca fallo real;
- el fallback Python/Shell cubre tambien `check-offline.sh` y `check-docs.sh`
  para aproximarse mejor a `lumapse-audit --code`.

---

## Criterio futuro

Antes de crear un nuevo script, conviene responder:

1. Que paso manual repetitivo elimina?
2. Que riesgo reduce?
3. Debe bloquear CI/verify o solo orientar al desarrollador?
4. Debe vivir en Python, Bash, Rust o Node segun su dominio?
5. Como se documenta su razon de existir?

Si la respuesta no es clara, el script probablemente todavia no merece existir.
