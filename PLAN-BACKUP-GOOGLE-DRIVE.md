# Plan por fases: backup `.zip` y Google Drive

> **Fecha:** 2026-06-02  
> **Revision de alcance:** 2026-06-03
> **Rama de trabajo:** `codex/backup-google-drive`
> **Estado:** feature post-release prioritaria  
> **Motivo:** Lumapse es offline-first, pero el estudiante debe poder recuperar sus notas si pierde,
> rompe o cambia el telefono. La propiedad del dato es parte del valor del producto.

---

## 1. Decision de producto

SQLite sigue siendo una buena base para Lumapse porque el producto no es solo un editor de archivos:
tambien modela materias, secciones, notas, papelera, fechas academicas y futuras relaciones. El riesgo
no es SQLite; el riesgo seria no ofrecer una salida clara al usuario.

Por eso la decision es:

- Mantener SQLite como fuente de verdad local.
- Implementar backup/export como feature prioritaria post-release.
- Generar archivos `.zip` legibles y restaurables.
- Permitir guardar el backup fuera de la app, idealmente en Google Drive o en almacenamiento elegido
  por el usuario.
- Habilitar el backup externo cuando el dispositivo detecte conexion a internet.
- Tratar WiFi como el estado recomendado para enviar el backup a Google Drive.
- Mantener el backup local disponible sin depender de internet.
- No prometer sincronizacion real multi-dispositivo hasta tener backup/restauracion validados.
- No subir backups automaticamente en la primera version; usar un recordatorio si el usuario lleva
  mucho tiempo sin respaldar sus notas.

---

## 2. Alcance funcional de esta rama

Esta rama debe convertir el plan general en una feature concreta y verificable. El alcance inicial no
es sincronizacion ni subida automatica a Drive API; es un backup manual, generado por Lumapse, que el
usuario puede enviar a Google Drive mediante el selector nativo cuando hay conexion a internet.

### 2.1 Flujo principal

1. El usuario abre una futura seccion `Backup` dentro de `Acerca de`, `Ajustes` o una pantalla
   equivalente de mantenimiento.
2. Lumapse consulta el estado de red del dispositivo.
3. Si la conexion esta activa, la accion `Crear backup externo` queda habilitada.
   - Con WiFi, se muestra como estado recomendado.
   - Con datos moviles, se permite continuar con aviso porque puede consumir datos.
4. Al tocar la accion, Lumapse genera un `.zip` con datos estructurados y notas Markdown legibles.
5. Lumapse guarda temporalmente el `.zip` en cache/app storage.
6. Lumapse abre el selector nativo de compartir/guardar archivo.
7. Si Google Drive esta instalado y configurado, el usuario puede elegirlo como destino.
8. Lumapse informa que el backup fue entregado al selector del sistema y recomienda verificarlo en
   Drive o en el destino elegido.

### 2.2 Estados de conectividad

| Estado detectado | Comportamiento |
|---|---|
| `connected=true`, `connectionType=wifi` | Habilitar `Crear backup externo`; mostrar WiFi como estado recomendado |
| `connected=true`, `connectionType=cellular` | Habilitar `Crear backup externo` con aviso: "Puede usar datos moviles." |
| `connected=true`, `connectionType=unknown` | Habilitar con mensaje conservador: "Hay conexion, pero no se pudo identificar el tipo de red." |
| `connected=false`, `connectionType=none` | Mantener Lumapse funcional y permitir preparar backup local; indicar que Drive requiere conexion |

La regla de producto es deliberadamente simple: la conexion habilita backup externo manual; WiFi es
el estado recomendado; sin conexion se conserva el modo offline-first y se evita sugerir una subida a
nube que podria fallar.

### 2.3 Recordatorio de backup

Lumapse no debe iniciar una subida automatica a Google Drive en esta etapa. Si se detecta que el
usuario lleva mucho tiempo sin hacer backup, el comportamiento recomendado es un recordatorio local.

Regla inicial:

- Guardar `lastBackupCreatedAt` cuando se genera un backup.
- Si pasaron 30 dias o mas desde el ultimo backup, mostrar un recordatorio no invasivo.
- Si hay conexion, el recordatorio puede ofrecer `Crear backup ahora`.
- Si no hay conexion, el recordatorio debe explicar que las notas siguen disponibles y que el backup
  externo requiere internet.
- El usuario puede cerrar el recordatorio; se puede guardar `lastBackupReminderDismissedAt` para no
  repetirlo de forma molesta durante la misma sesion o el mismo dia.

Motivo:

- Una subida automatica exige autenticacion, permisos, manejo de tokens, estado de red, trabajo en
  segundo plano y politica clara de errores.
- El selector/share sheet de Android requiere accion del usuario; no sirve para subidas automaticas.
- Un recordatorio mantiene control del usuario y evita prometer sincronizacion.

### 2.4 Dentro y fuera de alcance

Dentro de alcance para esta rama:

- Contrato del formato `.zip`.
- Generador de backup local probado por tests.
- Deteccion de conectividad en Android.
- Escritura temporal del archivo para compartirlo.
- Share sheet/selector nativo para que Drive aparezca como destino cuando el dispositivo lo soporte.
- Recordatorio local si pasaron 30 dias sin backup.
- Mensajes de UI que digan "backup manual", nunca "sincronizacion".
- Prueba manual en Android real con conexion y Google Drive.

Fuera de alcance para esta rama:

- OAuth de Google.
- Subida directa con Google Drive API.
- Backups automaticos o programados.
- Trabajo en segundo plano para generar o subir backups sin intervencion del usuario.
- Sincronizacion multi-dispositivo.
- Merge entre backups y datos existentes.
- Restauracion destructiva que reemplace datos sin confirmacion.
- Permisos amplios de almacenamiento externo.

---

## 3. Contrato del backup `.zip`

El nombre del archivo debe seguir este formato:

```txt
lumapse-YYYY-MM-DD-HH-mm.zip
```

Ejemplo:

```txt
lumapse-2026-06-02-06-45.zip
```

Contenido definido para `backupFormatVersion = 1`:

```txt
lumapse-2026-06-02-06-45.zip
├── manifest.json
├── data/
│   ├── subjects.json
│   ├── notes.json
│   └── academic-events.json
├── notes/
│   ├── matematica/
│   │   └── parcial-1.md
│   └── historia/
│       └── clase-edad-media.md
└── README.txt
```

El backup debe tener dos objetivos:

1. **Restaurable por Lumapse:** `manifest.json` + JSON estructurado.
2. **Legible por el estudiante:** archivos Markdown/texto organizados por materia.

Si mas adelante se puede incluir una copia o dump confiable de SQLite, puede agregarse como
`database/lumapse.sqlite` o `database/export.json`, pero la primera version no debe depender de eso
para ser util.

### 3.1 `manifest.json`

Campos minimos:

```json
{
  "app": "Lumapse",
  "backupFormatVersion": 1,
  "createdAt": "2026-06-03T12:30:00.000Z",
  "filename": "lumapse-2026-06-03-12-30.zip",
  "exportMode": "manual",
  "dataPolicy": {
    "includesDeletedItems": false,
    "includesArchivedItems": true,
    "includesAttachments": false
  },
  "counts": {
    "subjects": 3,
    "notes": 12,
    "academicEvents": 4,
    "attachments": 0
  },
  "files": [
    "data/subjects.json",
    "data/notes.json",
    "data/academic-events.json",
    "README.txt"
  ]
}
```

Reglas:

- `backupFormatVersion` empieza en `1` y solo cambia si se modifica el contrato de restauracion.
- `includesDeletedItems` es `false` en la primera version para no restaurar papelera por accidente.
- `includesArchivedItems` es `true`: archivar no significa borrar, por lo tanto se respalda.
- `includesAttachments` queda `false` hasta implementar adjuntos reales.
- `files` debe listar todas las entradas criticas para facilitar auditoria y tests.

### 3.2 Datos estructurados

`data/subjects.json` debe incluir materias y secciones no eliminadas:

- `id`
- `name`
- `parentSubjectId`
- `archived`
- `color`
- `createdAt`

`data/notes.json` debe incluir notas no eliminadas, incluyendo archivadas:

- `id`
- `title`
- `content`
- `pinned`
- `archived`
- `statusEmoji`
- `subjectId`
- `createdAt`
- `updatedAt`

`data/academic-events.json` debe incluir fechas academicas:

- `id`
- `type`
- `title`
- `date`
- `subjectId`
- `createdAt`
- `updatedAt`

### 3.3 Markdown legible

Cada nota debe exportarse tambien como Markdown. El path se calcula asi:

- Nota sin materia: `notes/entrada/<titulo-seguro>.md`
- Nota en materia: `notes/<materia>/<titulo-seguro>.md`
- Nota en seccion: `notes/<materia>/<seccion>/<titulo-seguro>.md`
- Materia/seccion faltante por inconsistencia: `notes/entrada/<titulo-seguro>.md`

Cada archivo Markdown debe incluir front matter simple:

```md
---
id: note-123
title: Parcial 1
subjectId: subj-matematica
createdAt: 2026-06-01T10:00:00.000Z
updatedAt: 2026-06-02T09:00:00.000Z
---

# Parcial 1

Contenido de la nota...
```

### 3.4 Nombres seguros

Reglas para carpetas y archivos:

- Convertir a minusculas.
- Normalizar tildes y caracteres especiales cuando sea posible.
- Reemplazar espacios por guiones.
- Eliminar caracteres no seguros para ZIP/rutas: `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`.
- Colapsar guiones repetidos.
- Limitar el slug base a 80 caracteres.
- Usar `sin-titulo` cuando no haya texto util.
- Resolver colisiones con sufijos `-2`, `-3`, etc.

---

## 4. Diseno tecnico propuesto

### 4.1 Estado de partida de la rama

- `jszip` ya esta instalado.
- `src/services/ExportService.js` existe, pero hoy dispara una descarga web de notas Markdown.
- No estan instalados `@capacitor/network`, `@capacitor/share` ni `@capacitor/filesystem`.
- La UI actual no expone exportacion, backup ni restauracion.

### 4.2 Dependencias nativas a incorporar

Para Android/Capacitor:

```bash
npm install @capacitor/network @capacitor/share @capacitor/filesystem
npx cap sync
```

Uso esperado:

- `@capacitor/network`: consultar `Network.getStatus()` y escuchar `networkStatusChange`.
- `@capacitor/filesystem`: escribir el ZIP temporal en `Directory.Cache`.
- `@capacitor/share`: abrir el selector nativo con el archivo ZIP.

Segun la documentacion oficial de Capacitor v8, `@capacitor/network` reporta `connected` y
`connectionType` con valores `wifi`, `cellular`, `none` o `unknown`. `@capacitor/share` permite
compartir archivos en iOS/Android mediante `files`, y en Android comparte por defecto archivos desde
cache. Android SAF permite que proveedores como Google Drive aparezcan dentro del ecosistema de
documentos/seleccion de destino.

### 4.3 Modulos sugeridos

| Modulo | Responsabilidad |
|---|---|
| `src/services/backup/BackupFormat.js` | Constantes, version, nombres seguros, paths, manifest |
| `src/services/backup/BackupDataSource.js` | Leer notas, materias/secciones y fechas academicas desde SQLite |
| `src/services/backup/BackupZipService.js` | Construir ZIP con JSZip y devolver `Blob`/`ArrayBuffer` |
| `src/services/backup/BackupNetworkService.js` | Traducir estado de red a `wifi`, `cellular`, `offline`, `unknown` |
| `src/services/backup/BackupShareService.js` | Guardar ZIP en cache y abrir share sheet |
| `src/services/backup/BackupReminderService.js` | Calcular si corresponde recordar backup por antiguedad |
| `src/services/ExportService.js` | Mantener fachada publica o delegar al nuevo servicio de backup |

### 4.4 Secuencia tecnica

```txt
UI Backup
  -> BackupNetworkService.getBackupNetworkState()
  -> si state.externalBackupAllowed === true
      -> si state.connectionType === 'cellular', mostrar aviso antes de continuar
      -> BackupDataSource.collectBackupData()
      -> BackupZipService.generateBackupZip(data)
      -> BackupShareService.writeZipToCache(zip, filename)
      -> BackupShareService.shareBackupFile(fileUri)
      -> guardar lastBackupCreatedAt
  -> si state.externalBackupAllowed === false
      -> mantener backup local / mostrar razon
```

### 4.5 Manejo de errores

| Error | Respuesta de producto |
|---|---|
| No hay datos para respaldar | Mostrar "Todavia no hay notas, materias ni fechas para respaldar." |
| JSZip falla | Mostrar error local y no abrir selector |
| Filesystem falla | Mostrar "No se pudo preparar el archivo temporal." |
| Share no disponible | Ofrecer fallback web/local si corresponde |
| Drive no aparece | Indicar que se puede guardar en otro destino o revisar instalacion/configuracion de Drive |
| Usuario cancela selector | No tratar como error critico |
| Se pierde conexion durante el flujo | No borrar el ZIP temporal; permitir reintentar cuando vuelva la conexion |

---

## 5. Fases de implementacion

### Fase 0 - Especificacion y contrato del backup

**Objetivo:** definir el formato antes de tocar UI.

Tareas:

- Definir `backupFormatVersion`.
- Definir estructura de `manifest.json`.
- Definir reglas de nombres seguros para carpetas y archivos.
- Definir que datos son obligatorios y cuales son opcionales.
- Definir limite inicial de tamano y comportamiento si existen adjuntos.
- Definir estados de conectividad que habilitan, advierten o bloquean backup externo.
- Definir regla de recordatorio por 30 dias sin backup.

Criterio de cierre:

- Formato documentado.
- Test unitario del generador de nombres y `manifest.json`.
- Fixture de ejemplo en tests.
- Tabla de comportamiento por WiFi/celular/offline documentada.
- Regla de recordatorio documentada.

Complejidad: baja/media.

---

### Fase 1 - Backup `.zip` local desde datos actuales

**Objetivo:** generar un `.zip` desde Lumapse sin depender de internet.

Estado actual del repo:

- `jszip` ya esta instalado.
- `src/services/ExportService.js` ya tiene una base tecnica web.
- La UI actual no expone exportacion/backup.

Tareas:

- Reescribir `ExportService` para devolver un `Blob` o `ArrayBuffer`, no disparar descarga web.
- Incluir notas, materias/secciones y fechas academicas.
- Generar Markdown por materia/seccion.
- Agregar `manifest.json`.
- Agregar tests unitarios.
- Permitir generar backup aunque no haya notas, si existen materias o fechas academicas.

Criterio de cierre:

- `generateBackupZip()` produce un `.zip` valido.
- El `.zip` se puede inspeccionar manualmente.
- El flujo funciona offline.
- Tests verifican manifest, JSON y Markdown.

Complejidad: media.

---

### Fase 2 - Guardar el `.zip` en el telefono

**Objetivo:** que el estudiante pueda conservar el backup fuera de la memoria interna privada de la app.

Opciones:

- Guardar temporalmente en cache/app storage y abrir share sheet nativo.
- Usar Storage Access Framework (`ACTION_CREATE_DOCUMENT`) para que el usuario elija destino.
- Permitir destinos locales como `Downloads`/`Documents` si Android y permisos lo permiten.

Recomendacion:

- Priorizar cache + share sheet nativo para el primer corte, porque permite compartir el ZIP sin
  permisos amplios y Google Drive puede aparecer como destino si esta disponible.
- Evaluar SAF (`ACTION_CREATE_DOCUMENT`) como mejora si se necesita "guardar como" con destino mas
  explicito.
- No pedir permisos amplios de almacenamiento.
- No asumir acceso libre a carpetas publicas por scoped storage.

Criterio de cierre:

- El usuario puede guardar `lumapse-fecha-hora.zip`.
- El archivo queda accesible fuera de Lumapse.
- El flujo se prueba en Android real.

Complejidad: media.

---

### Fase 3 - Deteccion de conexion y Google Drive sin Drive API directa

**Objetivo:** permitir backup en Google Drive sin implementar OAuth todavia, habilitando la accion
externa cuando el dispositivo detecte conexion a internet.

Idea:

- Consultar `Network.getStatus()` al abrir la seccion Backup.
- Escuchar cambios con `networkStatusChange` mientras la pantalla esta montada.
- Habilitar `Crear backup externo` con `connected=true`.
- Mostrar WiFi como estado recomendado.
- Mostrar aviso antes de continuar si `connectionType=cellular`.
- Generar el `.zip`.
- Abrir un selector/intent del sistema para guardar o compartir.
- Si Google Drive esta disponible como proveedor o destino, el usuario puede elegirlo.

Ventajas:

- Menos complejidad que Drive API.
- No requiere login propio de Lumapse.
- No requiere manejar tokens OAuth.
- Respeta el control del usuario.

Limitaciones:

- No es automatico.
- Depende de que Google Drive este instalado/configurado.
- No garantiza una carpeta fija sin decision del usuario.
- El resultado de `Share.share()` no garantiza que Drive haya terminado de subir el archivo.
- La deteccion de conectividad debe validarse en Android real.

Criterio de cierre:

- Con internet, el boton de backup externo queda habilitado.
- Con datos moviles, aparece aviso de consumo antes de continuar.
- Sin conexion, el boton externo queda deshabilitado o degradado con mensaje claro.
- En Android real, Drive aparece como destino o se documenta el fallback local.
- El backup queda visible para el estudiante.
- El texto de UI no usa "sync", "sincronizado" ni "automatico".

Complejidad: media.

---

### Fase 4 - Indicador online/offline orientado a backup

**Objetivo:** mostrar estado de conexion solo cuando aporta valor.

Regla de producto:

- Offline: Lumapse funciona normal; no se bloquea ninguna funcion central.
- Online por si solo no alcanza para destacar backup externo; se distingue WiFi/celular.
- WiFi: se habilita el backup externo recomendado.
- Celular: se habilita el backup externo con aviso de posible consumo de datos.

UI sugerida:

- Ubicacion inicial: acceso `Backup` en el drawer para llegar rapido durante la validacion de esta
  rama. Mas adelante puede moverse a `Acerca de` o `Ajustes` si esa navegacion existe.
- Texto no invasivo:
  - Offline: "Sin conexion. Tus notas siguen disponibles. El backup en nube requiere conexion."
  - Celular: "Con datos moviles. Podés crear backup, pero puede consumir datos."
  - WiFi: "Con WiFi. Podés crear un backup externo."

No mostrar un indicador permanente si sugiere sincronizacion automatica inexistente.

Criterio de cierre:

- Estado de red probado en Android real.
- El mensaje no promete sync.
- El backup local sigue disponible sin red.

Complejidad: baja/media.

---

### Fase 4.5 - Recordatorio de backup pendiente

**Objetivo:** recordar al usuario que conviene respaldar sus notas sin iniciar una sincronizacion
automatica.

Tareas:

- Persistir `lastBackupCreatedAt`.
- Calcular si pasaron 30 dias o mas desde el ultimo backup.
- Mostrar recordatorio no invasivo en la seccion Backup o al abrir la app.
- Permitir cerrar el recordatorio.
- Evitar repetirlo de forma molesta dentro del mismo dia.

Criterio de cierre:

- Si no existe backup previo, se muestra sugerencia inicial cuando hay datos para respaldar.
- Si pasaron 30 dias desde el ultimo backup, aparece recordatorio.
- El recordatorio no abre Drive ni genera ZIP sin accion explicita del usuario.

Complejidad: baja/media.

---

### Fase 5 - Restaurar desde `.zip`

**Objetivo:** que el backup sea util ante cambio o perdida de telefono.

Tareas:

- Seleccionar `.zip` desde el dispositivo o proveedor de documentos.
- Validar `manifest.json`.
- Mostrar resumen antes de importar.
- Primera version: restaurar en una materia/carpeta `Restaurado YYYY-MM-DD` para evitar merge complejo.
- Version posterior: permitir reemplazar workspace o merge controlado.

Criterio de cierre:

- Un backup creado por Lumapse puede importarse en una instalacion limpia.
- El usuario ve conteo de notas/materias antes de confirmar.
- No se pisan datos existentes sin confirmacion explicita.

Complejidad: media/alta.

---

### Fase 6 - Google Drive API directa

**Objetivo:** subir backups automaticamente o con un boton directo a Drive.

Esta fase es posterior porque requiere:

- Google Cloud project.
- OAuth y consentimiento del usuario.
- Scopes de Google Drive.
- Manejo seguro de tokens.
- Subida simple/multipart para archivos chicos.
- Subida resumable para backups grandes, especialmente si hay imagenes.
- Politica de carpeta visible vs `appDataFolder`.
- Pruebas de errores de red, reintentos y cancelacion.

Decisiones pendientes:

- ¿El backup debe ser visible en Drive para el usuario?
- ¿Se usa una carpeta `Lumapse Backups`?
- ¿Se usa `appDataFolder` oculto solo para restauracion desde Lumapse?
- ¿La subida es manual o programada?

Criterio de cierre:

- Subida a Drive validada con cuenta real.
- Permisos documentados.
- Fallback local si falla OAuth o conexion.

Complejidad: alta.

---

### Fase 7 - Sincronizacion real multi-dispositivo

**Objetivo:** no confundir backup con sincronizacion.

Sincronizar implica:

- Identidades de dispositivo.
- Conflictos.
- Merge de notas editadas en dos lugares.
- Borrados remotos/locales.
- Versionado.
- Recuperacion ante errores.

Esto queda fuera del primer ciclo de backup. Solo debe abrirse si hay adopcion real y feedback fuerte.

Complejidad: muy alta.

---

## 6. Criterios de aceptacion de la primera entrega

- `backupFormatVersion = 1` documentado y testeado.
- El ZIP contiene `manifest.json`, `README.txt`, JSON estructurado y Markdown legible.
- El ZIP no incluye items en papelera.
- El ZIP incluye items archivados.
- El nombre cumple `lumapse-YYYY-MM-DD-HH-mm.zip`.
- La generacion funciona sin internet.
- En Android con WiFi, la accion externa se habilita.
- En Android con datos moviles, la accion externa se habilita con aviso.
- En Android sin conexion, la accion externa se deshabilita o muestra una razon clara.
- En Android con Drive instalado/configurado, el selector permite enviar/guardar el ZIP en Drive o
  documenta el fallback disponible.
- Si pasaron 30 dias sin backup, Lumapse muestra recordatorio local sin iniciar subida automatica.
- La UI y la documentacion hablan de backup manual, no de sincronizacion.

---

## 7. Plan de pruebas

### 7.1 Unitarias

- `slugifyBackupPath()` elimina caracteres inseguros y resuelve nombres vacios.
- `createUniqueFilename()` evita colisiones.
- `buildManifest()` registra version, fecha, conteos y politica de datos.
- `generateBackupZip()` crea todas las entradas requeridas.
- `generateBackupZip()` conserva archivadas y excluye eliminadas.
- `BackupNetworkService` traduce `wifi`, `cellular`, `none` y `unknown` al estado de UI correcto.
- `BackupReminderService` detecta backup vencido a los 30 dias.

### 7.2 Integracion local

- Generar ZIP con fixtures de materias, secciones, notas y fechas academicas.
- Abrir el ZIP con JSZip en test y validar rutas.
- Verificar que el README explica como inspeccionar/restaurar manualmente.

### 7.3 Manual Android real

- WiFi encendido + Drive instalado: crear backup y elegir Drive como destino.
- WiFi apagado + datos moviles encendidos: verificar aviso de consumo antes de continuar.
- Modo avion: verificar que la app sigue funcionando y muestra mensaje offline.
- Drive no instalado o sin cuenta: verificar fallback hacia almacenamiento/otro destino.
- Interrumpir el selector: confirmar que no se muestra como fallo grave.
- Generar backup con notas archivadas y verificar que aparecen en el ZIP.
- Simular ultimo backup mayor a 30 dias: verificar recordatorio.

---

## 8. Orden recomendado

1. Especificar formato.
2. Generar `.zip` local.
3. Agregar deteccion de conexion orientada a backup.
4. Guardar/compartir el `.zip` fuera de la app.
5. Probar destino Google Drive por selector/share sheet.
6. Agregar indicador online/offline solo ligado a backup.
7. Agregar recordatorio local por 30 dias sin backup.
8. Implementar restauracion.
9. Evaluar Drive API directa.
10. Evaluar sincronizacion real.

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigacion |
|---|---|
| El usuario cree que hay sync automatica | Usar lenguaje de "backup manual", no "sincronizacion" |
| Drive no aparece como destino | Ofrecer fallback local y documentar prueba Android real |
| Backup con datos moviles consume internet del usuario | Mostrar aviso antes de continuar |
| `connectionType=unknown` en Android real | Habilitar con mensaje conservador y documentar dispositivo |
| El recordatorio molesta | Permitir cerrar y no repetir durante el mismo dia |
| El usuario espera backup automatico | Explicar que la primera version es manual por seguridad y permisos |
| Backup demasiado pesado por imagenes | Optimizar adjuntos y usar subidas resumables en Drive API futura |
| SQLite se siente cerrado | Exportar Markdown + JSON estructurado |
| Restauracion pisa datos existentes | Primera importacion en carpeta `Restaurado`, sin merge destructivo |
| Scoped storage complica archivos publicos | Usar SAF/share sheet y evitar permisos amplios |
| Share sheet no confirma subida final | Mostrar "archivo enviado al selector" y pedir verificacion en Drive |

---

## 10. Avance de esta rama (2026-06-03)

Completado hasta ahora:

- [x] Rama de trabajo `codex/backup-google-drive`.
- [x] Contrato `backupFormatVersion = 1` con nombre canonico, `manifest.json`, politica de datos y
  helpers de nombres seguros.
- [x] Generador ZIP local con `manifest.json`, `README.txt`, JSON estructurado y Markdown legible.
- [x] Data source desde SQLite para materias/secciones, notas y fechas academicas actuales.
- [x] Servicio de backup actual (`BackupService`) que arma el ZIP desde los datos reales.
- [x] Servicio de conectividad de producto para WiFi, datos moviles, red desconocida y offline.
- [x] Servicio nativo de conectividad con `@capacitor/network`.
- [x] Instalacion y sync de `@capacitor/network`, `@capacitor/filesystem` y `@capacitor/share`.
- [x] Servicio de share/cache para escribir el ZIP temporal y abrir el selector nativo.
- [x] Orquestador del flujo manual: red -> ZIP -> cache -> share sheet.
- [x] Servicio de decision para recordatorio de backup vencido a los 30 dias.
- [x] Vista `Backup` accesible desde el drawer, con estados WiFi, advertencia, offline, exito, error y
  refresco de red.
- [x] Ocultar el composer en la vista `Backup` y evitar que `Entrada` quede marcada como activa.
- [x] Tests unitarios focales de servicios, store y UI de backup.
- [x] Suite completa de tests, lint y build ejecutados en esta rama.

Pendiente antes de merge:

- [ ] Validar manualmente en Android real con WiFi, datos moviles y modo avion.
- [ ] Confirmar que Google Drive aparece como destino del selector o documentar fallback disponible.
- [ ] Verificar manualmente el ZIP generado: rutas, Markdown, JSON y `manifest.json`.
- [ ] Integrar persistencia de `lastBackupCreatedAt` y `lastBackupReminderDismissedAt`.
- [ ] Mostrar recordatorio de 30 dias en UI sin iniciar backup automatico.
- [ ] Decidir si `ExportService.js` debe delegar al nuevo servicio de backup o mantenerse separado.
- [ ] Definir si el acceso `Backup` queda en el drawer o se mueve a una futura pantalla de ajustes.

---

## 11. Fuentes tecnicas consultadas

- Capacitor Network API: https://capacitorjs.com/docs/apis/network
- Capacitor Share API: https://capacitorjs.com/docs/apis/share
- Capacitor Filesystem API: https://capacitorjs.com/docs/apis/filesystem
- Android Storage Access Framework: https://developer.android.com/guide/topics/providers/document-provider
- Google Drive API uploads: https://developers.google.com/drive/api/v3/manage-uploads
- Google Drive app data folder: https://developers.google.com/workspace/drive/api/guides/appdata

---

## 12. Conclusion

Esta feature es critica para que Lumapse no secuestre las notas del estudiante. El camino profesional
no es abandonar SQLite ni prometer sync prematura, sino agregar una capa de backup/export robusta:

> offline-first para escribir siempre, backup externo para no perder nunca.
