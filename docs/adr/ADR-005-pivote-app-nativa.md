# ADR-005: Pivote de PWA a Aplicación Android Híbrida (APK)

**Fecha:** 2026-05-14  
**Estado:** Aceptado — pivote técnico validado en `0.4.8`; instalabilidad por el público objetivo pendiente de validación específica
**Autor:** Jose David Sandoval  
**Reemplaza:** ADR-002 (persistencia IndexedDB → SQLite)

---

## Contexto

Lumapse fue concebida originalmente como una PWA (Progressive Web App) con persistencia en IndexedDB. Esta decisión se documentó en [ADR-001](ADR-001-stack-tecnologico.md) y [ADR-002](ADR-002-persistencia-indexeddb.md) basándose en supuestos razonables de diseño inicial.

Sin embargo, al completar la fase de **Empatizar** del Design Thinking, se realizó un relevamiento de datos formal con **120 respuestas válidas** de estudiantes del IES 6023 "Dr. Alfredo Loutaif" ([informe completo](../producto/resultados-relevamiento.md)). Los resultados revelaron una realidad del usuario que no se había contemplado con la profundidad necesaria al inicio del proyecto.

La encuesta estableció dos restricciones de producto: prioridad móvil y funcionamiento offline. No preguntó por PWA, APK, canales de instalación ni motores de persistencia. La decisión de adoptar Capacitor y SQLite combina esa evidencia de uso con un análisis técnico de persistencia, reutilización del código, plazo académico y capacidades de plataforma.

## Evidencia empírica

Los siguientes hallazgos del relevamiento fundamentan esta decisión:

| Hallazgo | Dato | Fuente |
|---|---|---|
| El celular es el dispositivo dominante | **72.5%** usaría la app desde el celular | P9, n=120 |
| La conectividad no es suficiente en todo momento | **81.7%** respondió una categoría distinta de “siempre” al consultar disponibilidad de internet | P6, n=120 |
| Offline es la opción de P8 más seleccionada | **74.2%** marca "funcione sin internet"; el máximo declarado de tres opciones no se aplicó en 37 respuestas | P8, n=120 |
| La intención declarada de prueba es alta | **100%** respondió "Sí" o "Tal vez" ante una posible prueba; no garantiza participación efectiva | P10, n=120 |
| El papel es el hábito predominante en la muestra | **88.3%** toma notas en papel | P4, n=120 |
| El celular lidera en las seis carreras observadas | Alcanza 59.1% en Sistemas (13 de 22); Física no quedó representada | Cruce P2×P9 |

**Referencia completa:** [`docs/producto/resultados-relevamiento.md`](../producto/resultados-relevamiento.md)

## Problema identificado con la arquitectura PWA

### Riesgo de pérdida de datos (IndexedDB)

IndexedDB, la capa de persistencia elegida en ADR-002, presenta un riesgo crítico para la propuesta de valor de Lumapse:

- **Purga de almacenamiento:** En Android, Chrome puede eliminar datos de IndexedDB bajo presión de almacenamiento sin notificar al usuario. Para una app cuyo valor central es "no perder notas", esto es inaceptable.
- **Cuota variable:** La cuota disponible depende del navegador, el dispositivo y el espacio libre. No hay garantía de persistencia a largo plazo.
- **Storage Persistence API:** Existe `navigator.storage.persist()` para solicitar almacenamiento persistente, pero los navegadores pueden ignorar esta solicitud.

### Instalabilidad: hipótesis no medida por la encuesta

El relevamiento mostró que el **88.3% de la muestra usa cuaderno/papel**, pero ese dato no mide alfabetización técnica ni familiaridad con mecanismos de instalación. Tampoco se preguntó por PWA, tienda de aplicaciones, descarga directa o APK. El uso coloquial de la palabra "app" en respuestas abiertas no permite distinguir entre esos canales.

Una PWA puede requerir que el usuario descubra la acción de instalación del navegador. Una descarga directa de APK puede exigir permisos de fuentes externas y mostrar advertencias de seguridad. Por lo tanto, la familiaridad o menor fricción de una alternativa no se adopta como evidencia del relevamiento: queda como hipótesis que requiere una prueba específica con estudiantes.

## Opciones evaluadas

### Opción A: Mantener PWA pura (statu quo)

| Aspecto | Evaluación |
|---|---|
| Multiplataforma | ✅ Funciona en cualquier navegador |
| Persistencia | ⚠️ IndexedDB puede ser purgada |
| Distribución | ⚠️ Disponible desde navegador; descubrimiento y aceptación no medidos |
| Acceso a hardware | ⚠️ Disponible mediante APIs web según navegador y permisos, con menor integración que los plugins nativos previstos |
| Experiencia en celular | ⚠️ Funcional pero no nativa |
| Familiaridad para el usuario | ⚪ No evaluada por la encuesta |

### Opción B: Aplicación Android híbrida con Capacitor (elegida)

| Aspecto | Evaluación |
|---|---|
| Multiplataforma | ✅ El código web se reutiliza; se puede generar APK para Android |
| Persistencia | ✅ SQLite — datos almacenados como archivo del sistema operativo |
| Distribución | ✅ APK descargable técnicamente; aceptación del *sideload* pendiente |
| Acceso a hardware | ✅ Plugins nativos disponibles, sujetos a implementación y permisos |
| Experiencia en celular | ✅ Aplicación instalada con UI web en WebView y acceso a plugins Android; la calidad de UX se valida por separado |
| Familiaridad para el usuario | ⚪ No evaluada; la instalación directa puede presentar advertencias y permisos |

### Opción C: App nativa completa (Kotlin / React Native)

| Aspecto | Evaluación |
|---|---|
| Rendimiento | ✅ Óptimo |
| Costo de migración | ❌ Reescritura completa del codebase |
| Curva de aprendizaje | ❌ Nuevo lenguaje/framework |
| Timeline del proyecto | ❌ Inviable dentro del plazo académico |

## Decisión

**Migrar de PWA pura a una aplicación Android híbrida empaquetada con [Capacitor](https://capacitorjs.com/)**, reemplazando IndexedDB por **SQLite** como capa de persistencia. La interfaz continúa siendo web y se ejecuta en una WebView; Capacitor aporta el proyecto Android, el puente y los plugins nativos.

### Justificación

1. **Reutilización del código existente:** Capacitor empaqueta la web app existente (HTML/CSS/JS) dentro de un contenedor Android nativo. No se reescribe el codebase, se envuelve.
2. **SQLite > IndexedDB para el canal Android:** Los datos se almacenan fuera del almacenamiento administrado por el navegador y, por lo tanto, no están sujetos a su política de purga. Esto no elimina otros riesgos, como desinstalación, falla del dispositivo o pérdida de archivos; por eso el respaldo continúa siendo necesario.
3. **Distribución viable dentro del alcance académico:** El `.apk` se puede alojar en GitHub Releases sin cuenta de desarrollador ni publicación inmediata en una tienda. La viabilidad técnica del canal no implica que instalarlo sea intuitivo o aceptable para el público objetivo; esa cuestión requiere validación separada.
4. **Capacidades nativas disponibles para evolución:** El contenedor permite integrar plugins del dispositivo sin reescribir la interfaz. Cámara, micrófono y notificaciones no forman parte de la beta `0.4.8` y requieren requisitos y validación propios antes de incorporarse.
5. **Decisión informada por datos y análisis técnico:** La muestra respalda priorizar celular (72.5%) y funcionamiento offline (74.2% lo eligió entre las características prioritarias); además, 81.7% no declaró disponibilidad permanente de internet. La elección concreta de APK y SQLite proviene de comparar alternativas técnicas bajo esas restricciones, no de una preferencia de formato expresada en el cuestionario.

## Estrategia de distribución

| Canal | Cuándo | Costo |
|---|---|---|
| **APK en GitHub Releases** | Inmediato (MVP) | $0 — El repositorio es público y de código abierto |
| **APK por WhatsApp** | Beta testing con estudiantes | $0 — Distribución directa |
| **Google Play Store** | Futuro (post-entrega académica) | Costo y requisitos no verificados para el cierre; consultar condiciones vigentes si se adopta el canal |

> **Nota sobre la tienda:** La publicación en Google Play no es prioritaria ni necesaria para el alcance académico del proyecto. El código fuente siempre será abierto (repositorio público). La tienda se evaluará como canal de distribución complementario solo si el proyecto trasciende el contexto académico.

## Consecuencias

**Positivas:**
- Persistencia con SQLite no sujeta a la política de purga del navegador
- Experiencia instalada en Android, sobre el tipo de dispositivo priorizado por la muestra
- Canal de distribución directa técnicamente disponible para la beta
- Acceso controlado a APIs nativas; la beta utiliza red, filesystem y compartición para el flujo de backup
- El código web existente se reutiliza (no se descarta trabajo previo)

**Negativas:**
- Se agrega complejidad al build (Android SDK, Gradle)
- Se pierde la universalidad "funciona en cualquier navegador" de la PWA pura
- Se requiere aprender el tooling de Capacitor y sus plugins
- El testing requiere un emulador Android o dispositivo físico
- La instalación fuera de una tienda puede requerir permisos y advertencias de seguridad cuya aceptación no fue medida

**Mitigación de negativas:**
- El modo web se conserva para desarrollo y pruebas rápidas con Vite y SQLite/WASM; no se presenta como una PWA soportada.
- El flujo Android y sus prerrequisitos están documentados en [`../flujo-desarrollo-android.md`](../flujo-desarrollo-android.md).
- La verificación combina tests automatizados con instalación y prueba en Android.

## Impacto en ADRs anteriores

| ADR | Impacto |
|---|---|
| ADR-001 (Stack Tecnológico) | Se mantiene Vite + JS. Se agrega Capacitor como capa de empaquetado |
| **ADR-002 (IndexedDB)** | **Superseded.** IndexedDB se reemplaza por SQLite vía `@capacitor-community/sqlite` |
| ADR-003 (Kanban) | Sin impacto |
| ADR-004 (Estructura) | Se agrega carpeta `android/` generada por Capacitor |

## Validación de la decisión — 2026-07-15

La revisión técnica prevista se completó. La versión `0.4.8` se construye y distribuye como APK, utiliza SQLite como persistencia local y dispone de un flujo nativo de backup mediante los plugins Network, Filesystem y Share. El canal de producto vigente es Android; el navegador continúa como entorno auxiliar de desarrollo. La instalación y los flujos principales se validaron inicialmente en un dispositivo Android real.

Esta evidencia confirma la viabilidad técnica del pivote para la beta, pero no demuestra todavía que estudiantes del público objetivo puedan localizar, descargar e instalar el APK sin asistencia ni que prefieran este canal frente a una tienda o una PWA. Esa instalabilidad se mantiene como validación específica del Hito 06.

---

*Decisión informada por el [Relevamiento de Datos](../producto/resultados-relevamiento.md) —120 respuestas válidas del IES 6023 "Dr. Alfredo Loutaif", mayo de 2026— y justificada mediante el análisis técnico de alternativas. Script de análisis reproducible en [`analisis-relevamiento/scripts/`](../../analisis-relevamiento/scripts/).*
