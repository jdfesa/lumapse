# Plan por fases: backup `.zip` y Google Drive

> **Fecha:** 2026-06-02  
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
- No prometer sincronizacion real multi-dispositivo hasta tener backup/restauracion validados.

---

## 2. Alcance conceptual

El nombre del archivo debe seguir este formato:

```txt
lumapse-YYYY-MM-DD-HH-mm.zip
```

Ejemplo:

```txt
lumapse-2026-06-02-06-45.zip
```

Contenido propuesto:

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
├── attachments/
│   └── ...
└── README.txt
```

El backup debe tener dos objetivos:

1. **Restaurable por Lumapse:** `manifest.json` + JSON estructurado.
2. **Legible por el estudiante:** archivos Markdown/texto organizados por materia.

Si mas adelante se puede incluir una copia o dump confiable de SQLite, puede agregarse como
`database/lumapse.sqlite` o `database/export.json`, pero la primera version no debe depender de eso
para ser util.

---

## 3. Fases de implementacion

### Fase 0 - Especificacion y contrato del backup

**Objetivo:** definir el formato antes de tocar UI.

Tareas:

- Definir `backupFormatVersion`.
- Definir estructura de `manifest.json`.
- Definir reglas de nombres seguros para carpetas y archivos.
- Definir que datos son obligatorios y cuales son opcionales.
- Definir limite inicial de tamano y comportamiento si existen adjuntos.

Criterio de cierre:

- Formato documentado.
- Test unitario del generador de nombres y `manifest.json`.
- Fixture de ejemplo en tests.

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

Criterio de cierre:

- `generateBackupZip()` produce un `.zip` valido.
- El `.zip` se puede inspeccionar manualmente.
- El flujo funciona offline.

Complejidad: media.

---

### Fase 2 - Guardar el `.zip` en el telefono

**Objetivo:** que el estudiante pueda conservar el backup fuera de la memoria interna privada de la app.

Opciones:

- Guardar temporalmente en cache/app storage y abrir share sheet nativo.
- Usar Storage Access Framework (`ACTION_CREATE_DOCUMENT`) para que el usuario elija destino.
- Permitir destinos locales como `Downloads`/`Documents` si Android y permisos lo permiten.

Recomendacion:

- Priorizar selector del sistema / SAF porque permite que el usuario elija proveedor y destino.
- No pedir permisos amplios de almacenamiento.
- No asumir acceso libre a carpetas publicas por scoped storage.

Criterio de cierre:

- El usuario puede guardar `lumapse-fecha-hora.zip`.
- El archivo queda accesible fuera de Lumapse.
- El flujo se prueba en Android real.

Complejidad: media.

---

### Fase 3 - Guardar en Google Drive sin Drive API directa

**Objetivo:** permitir backup en Google Drive sin implementar OAuth todavia.

Idea:

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

Criterio de cierre:

- En Android real, Drive aparece como destino o se documenta el fallback local.
- El backup queda visible para el estudiante.

Complejidad: media.

---

### Fase 4 - Indicador online/offline orientado a backup

**Objetivo:** mostrar estado de conexion solo cuando aporta valor.

Regla de producto:

- Offline: Lumapse funciona normal; no se bloquea ninguna funcion central.
- Online: se habilita o destaca la posibilidad de crear backup externo.

UI sugerida:

- Ubicacion: pantalla `Acerca de`, `Ajustes` o futura seccion `Backup`.
- Texto no invasivo:
  - Offline: "Sin conexion. Tus notas siguen disponibles. El backup en nube requiere conexion."
  - Online: "Con conexion. Podés crear un backup externo."

No mostrar un indicador permanente si sugiere sincronizacion automatica inexistente.

Criterio de cierre:

- Estado de red probado en Android real.
- El mensaje no promete sync.
- El backup local sigue disponible sin red.

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

## 4. Orden recomendado

1. Especificar formato.
2. Generar `.zip` local.
3. Guardar/compartir el `.zip` fuera de la app.
4. Probar destino Google Drive por selector/share sheet.
5. Agregar indicador online/offline solo ligado a backup.
6. Implementar restauracion.
7. Evaluar Drive API directa.
8. Evaluar sincronizacion real.

---

## 5. Riesgos y mitigaciones

| Riesgo | Mitigacion |
|---|---|
| El usuario cree que hay sync automatica | Usar lenguaje de "backup manual", no "sincronizacion" |
| Drive no aparece como destino | Ofrecer fallback local y documentar prueba Android real |
| Backup demasiado pesado por imagenes | Optimizar adjuntos y usar subidas resumables en Drive API futura |
| SQLite se siente cerrado | Exportar Markdown + JSON estructurado |
| Restauracion pisa datos existentes | Primera importacion en carpeta `Restaurado`, sin merge destructivo |
| Scoped storage complica archivos publicos | Usar SAF/share sheet y evitar permisos amplios |

---

## 6. Fuentes tecnicas consultadas

- Android Storage Access Framework: https://developer.android.com/guide/topics/providers/document-provider
- Google Drive API uploads: https://developers.google.com/drive/api/v3/manage-uploads
- Google Drive app data folder: https://developers.google.com/workspace/drive/api/guides/appdata

---

## 7. Conclusion

Esta feature es critica para que Lumapse no secuestre las notas del estudiante. El camino profesional
no es abandonar SQLite ni prometer sync prematura, sino agregar una capa de backup/export robusta:

> offline-first para escribir siempre, backup externo para no perder nunca.
