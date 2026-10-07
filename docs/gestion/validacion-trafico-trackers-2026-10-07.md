# Validación de tráfico y trackers — RNF-012/RNF-013 — 2026-10-07

**Unidad:** captura runtime acotada de privacidad y trackers sobre la APK debug instalada, sin cambios de código, dependencias, versión, datos ni sistema.

**Rama:** `test/rnf-012-013-runtime-traffic`.

**Estado:** PASS para la corrida y el artefacto identificados; repetir sobre el candidato final antes de emitir la matriz de entrega.

## Alcance y entorno

- Dispositivo autorizado: Samsung SM-G965F, Android 10/API 29.
- Aplicación: `com.lumapse.app`, `versionName 0.5.0`, `versionCode 500`.
- Origen mostrado por Acerca de: `348da88c89466917b1d057a5bd53a1cd0d524642`.
- UID Android de Lumapse: `10319`.
- La APK ya estaba instalada; no se generó, instaló ni publicó otra compilación.
- La corrida se realizó el 2026-10-07. No se usaron datos personales ni se eligió un destino externo.

## Flujos observados

Se inició la actividad existente y se recorrieron controles de la interfaz real del WebView mediante el canal de inspección local, sin llamar servicios internos ni escribir SQL directamente:

1. Arranque y recuperación del editor visible.
2. Apertura/cierre del menú de materias, búsqueda de `Base de Datos` y navegación a esa materia.
3. Apertura del calendario, avance y regreso de mes.
4. Apertura de `Acerca de`, verificando versión, origen y la declaración de funcionamiento local sin sincronización automática.
5. Apertura de `Exportar ZIP`, generación del ZIP iniciada explícitamente por el usuario y apertura del selector Android. El selector se canceló sin elegir destino; no se importó, compartió ni envió el archivo.

La exportación del punto 5 no repite OFF-05: se incluyó solo para diferenciar una acción externa explícita de cualquier transmisión automática. OFF-01–05 y la importación ya están documentados en [`offline-2026-10-06.md`](../beta-core-validation/offline-2026-10-06.md).

## Método y evidencia

Antes del primer flujo se registraron los contadores de red del UID `10319` en `/proc/net/xt_qtaguid/stats`. Durante una ventana temporal de 240 segundos se ejecutó como root en el dispositivo:

```text
tcpdump -i any -nn -s 0 -w /sdcard/rnf012013-runtime.pcap
```

El PCAP global recibió 250 paquetes y se conservó únicamente fuera del repositorio. Incluye tráfico de otras interfaces/equipos y, por sí solo, no se atribuye a Lumapse. La atribución se hizo con los contadores del UID:

| Métrica agregada de las 6 filas del UID | Antes | Después | Delta |
|---|---:|---:|---:|
| Bytes recibidos | 312942 | 312942 | 0 |
| Bytes transmitidos | 107136 | 107136 | 0 |

Las seis filas (interfaces `wlan0` y `lo`, conjuntos foreground/background y tags presentes) fueron idénticas antes y después. Por lo tanto, no se observó tráfico de red atribuible al UID de Lumapse durante los flujos enumerados.

El PCAP mostró actividad ajena al UID, incluyendo descubrimiento local y conectividad del dispositivo. Esa actividad no se cuenta como request de la aplicación.

## Revisión estática de trackers y dependencias

- `npm run check:offline`: PASS; 143 archivos escaneados, 0 referencias externas bloqueantes y 2 URLs documentales permitidas por la CSP local.
- Se revisaron `src/`, `public/` e `index.html` buscando `fetch`, XHR, WebSocket, `sendBeacon`, analytics, telemetry, cookies y SDKs de tracking. No hay una integración runtime declarada. Las coincidencias restantes son sanitización de URLs Markdown y nombres de segmentos de rutas de backup, no clientes de red.
- Las dependencias directas no incluyen SDK de analytics, tracking, cookies o telemetría de terceros. La auditoría de dependencias 0/0 del parche de Capacitor permanece documentada en [`validacion-parche-capacitor-2026-10-07.md`](./validacion-parche-capacitor-2026-10-07.md).

## Resultado RNF

| Requisito | Resultado de esta corrida | Límite |
|---|---|---|
| RNF-012 | PASS: 0 bytes de red nuevos atribuibles al UID de Lumapse durante el alcance capturado; la exportación explícita no llegó a elegir destino. | Repetir sobre el APK candidato final y conservar su identidad exacta. |
| RNF-013 | PASS: sin integración estática de tracking/analytics/cookies y sin tráfico runtime atribuible al UID durante la corrida. | La corrida no constituye una auditoría de otras aplicaciones ni de futuros artefactos. |

La evidencia completa de entrega deberá repetirse sobre el APK candidato, junto con las auditorías de dependencias correspondientes. Este reporte no acredita ausencia de tráfico de otras aplicaciones ni reemplaza la matriz RNF final.

## Archivos privados y reproducibilidad

- PCAP privado: `rnf012013-runtime.pcap`, 250 paquetes, SHA-256 `b509c46a20c0e8f4044b2a9c199ea692a341715a70372a3cb35b27deb641ff2a`.
- Snapshots privados de contadores UID: `rnf012013-uid-before.txt` y `rnf012013-uid-after.txt`; su diff es vacío.
- No se versionan PCAP, snapshots, APK, ZIP, bases, capturas ni seriales del teléfono.

