# ADR-005: Pivote de PWA a Aplicación Móvil Nativa (APK)

**Fecha:** 2026-05-14  
**Estado:** Aceptado  
**Autor:** Jose David Sandoval  
**Supersede:** ADR-002 (Persistencia IndexedDB → migrar a SQLite)

---

## Contexto

Lumapse fue concebida originalmente como una PWA (Progressive Web App) con persistencia en IndexedDB. Esta decisión se documentó en [ADR-001](ADR-001-stack-tecnologico.md) y [ADR-002](ADR-002-persistencia-indexeddb.md) basándose en supuestos razonables de diseño inicial.

Sin embargo, al completar la fase de **Empatizar** del Design Thinking, se realizó un relevamiento de datos formal con **120 respuestas válidas** de estudiantes del IES 6023 "Dr. Alfredo Loutaif" ([informe completo](../producto/resultados-relevamiento.md)). Los resultados revelaron una realidad del usuario que no se había contemplado con la profundidad necesaria al inicio del proyecto.

**Esta decisión no es caprichosa.** Es una respuesta directa a la evidencia empírica recolectada de usuarios reales. A continuación se detalla la evidencia, las opciones evaluadas y la justificación del pivote.

## Evidencia empírica

Los siguientes hallazgos del relevamiento fundamentan esta decisión:

| Hallazgo | Dato | Fuente |
|---|---|---|
| El celular es el dispositivo dominante | **72.5%** usaría la app desde el celular | P9, n=120 |
| La conectividad es deficiente | **81.7%** percibe conectividad deficiente en el instituto | P6, n=120 |
| Offline es la feature más pedida | **74.2%** prioriza "funcione sin internet" | P8, n=120 |
| La adopción potencial es altísima | **99.2%** probaría un prototipo | P10, n=120 |
| El competidor es el cuaderno, no otra app | **88.3%** toma notas en papel | P4, n=120 |
| Todas las carreras prefieren celular | El celular domina incluso en Sistemas (70%) | Cruce P2×P9 |

**Referencia completa:** [`docs/producto/resultados-relevamiento.md`](../producto/resultados-relevamiento.md)

## Problema identificado con la arquitectura PWA

### Riesgo de pérdida de datos (IndexedDB)

IndexedDB, la capa de persistencia elegida en ADR-002, presenta un riesgo crítico para la propuesta de valor de Lumapse:

- **Purga de almacenamiento:** En Android, Chrome puede eliminar datos de IndexedDB bajo presión de almacenamiento sin notificar al usuario. Para una app cuyo valor central es "no perder notas", esto es inaceptable.
- **Cuota variable:** La cuota disponible depende del navegador, el dispositivo y el espacio libre. No hay garantía de persistencia a largo plazo.
- **Storage Persistence API:** Existe `navigator.storage.persist()` para solicitar almacenamiento persistente, pero los navegadores pueden ignorar esta solicitud.

### Fricción de instalación (PWA)

El relevamiento reveló que el **88.3% de los estudiantes usa cuaderno/papel** — no son usuarios técnicos. El concepto de "instalar una web" desde el navegador es ajeno para la mayoría:

- **Un estudiante de Ed. Especial o Ed. Primaria** no tiene por qué saber qué es una PWA.
- **Un archivo `.apk` instalable** es un flujo familiar: descargar → instalar → usar. Es la misma experiencia que cualquier otra app.
- La evidencia cualitativa (P12) lo refuerza: los estudiantes piden una "app", no una "página web que funcione offline".

## Opciones evaluadas

### Opción A: Mantener PWA pura (statu quo)

| Aspecto | Evaluación |
|---|---|
| Multiplataforma | ✅ Funciona en cualquier navegador |
| Persistencia | ⚠️ IndexedDB puede ser purgada |
| Distribución | ⚠️ Requiere que el usuario "instale" desde el navegador |
| Acceso a hardware | ❌ Limitado (sin cámara nativa, sin filesystem real) |
| Experiencia en celular | ⚠️ Funcional pero no nativa |
| Familiaridad para el usuario | ❌ Concepto poco intuitivo para no-técnicos |

### Opción B: App nativa con Capacitor (elegida)

| Aspecto | Evaluación |
|---|---|
| Multiplataforma | ✅ El código web se reutiliza; se puede generar APK para Android |
| Persistencia | ✅ SQLite — datos almacenados como archivo del sistema operativo |
| Distribución | ✅ APK descargable (ej: desde el repositorio GitHub) |
| Acceso a hardware | ✅ Cámara (fotos de pizarrón), micrófono (audio de clase) |
| Experiencia en celular | ✅ Se siente como app nativa instalada |
| Familiaridad para el usuario | ✅ Instalar un `.apk` es un flujo conocido |

### Opción C: App nativa completa (Kotlin / React Native)

| Aspecto | Evaluación |
|---|---|
| Rendimiento | ✅ Óptimo |
| Costo de migración | ❌ Reescritura completa del codebase |
| Curva de aprendizaje | ❌ Nuevo lenguaje/framework |
| Timeline del proyecto | ❌ Inviable dentro del plazo académico |

## Decisión

**Migrar de PWA pura a aplicación móvil nativa empaquetada con [Capacitor](https://capacitorjs.com/)**, reemplazando IndexedDB por **SQLite** como capa de persistencia.

### Justificación

1. **Reutilización del código existente:** Capacitor empaqueta la web app existente (HTML/CSS/JS) dentro de un contenedor Android nativo. No se reescribe el codebase, se envuelve.
2. **SQLite > IndexedDB:** Los datos se almacenan como archivos del sistema operativo, sin riesgo de purga por el navegador. Es la misma tecnología que usan WhatsApp, Telegram y cualquier app que almacene datos localmente.
3. **Distribución sin fricción:** El `.apk` se puede alojar en el mismo repositorio de GitHub (sección Releases). Los estudiantes de Sistemas pueden descargarlo y compartirlo. No se requiere cuenta de desarrollador ni tienda de apps.
4. **Capacidades nativas futuras:** Acceso a cámara (fotos de pizarrón — pedido en P12 por profesorados), micrófono (grabación de clase — pedido por Lengua y Lit.), y notificaciones.
5. **Decisión basada en datos:** La evidencia empírica de 120 estudiantes reales muestra una preferencia inequívoca por celular (72.5%) y una necesidad crítica de offline robusto (81.7%).

## Estrategia de distribución

| Canal | Cuándo | Costo |
|---|---|---|
| **APK en GitHub Releases** | Inmediato (MVP) | $0 — El repositorio es público y de código abierto |
| **APK por WhatsApp** | Beta testing con estudiantes | $0 — Distribución directa |
| **Google Play Store** | Futuro (post-entrega académica) | $25 USD (única vez) — Evaluable cuando haya versión estable |

> **Nota sobre la tienda:** La publicación en Google Play no es prioritaria ni necesaria para el alcance académico del proyecto. El código fuente siempre será abierto (repositorio público). La tienda se evaluará como canal de distribución complementario solo si el proyecto trasciende el contexto académico.

## Consecuencias

**Positivas:**
- Persistencia robusta con SQLite (sin riesgo de purga)
- Experiencia nativa en celular (el dispositivo elegido por el 72.5%)
- Distribución familiar para usuarios no técnicos
- Acceso a hardware nativo (cámara, micrófono) para features pedidas en P12
- El código web existente se reutiliza (no se descarta trabajo previo)

**Negativas:**
- Se agrega complejidad al build (Android SDK, Gradle)
- Se pierde la universalidad "funciona en cualquier navegador" de la PWA pura
- Se requiere aprender el tooling de Capacitor y sus plugins
- El testing requiere un emulador Android o dispositivo físico

**Mitigación de negativas:**
- La versión web (PWA) puede mantenerse como canal secundario para usuarios de escritorio, si el tiempo lo permite
- Capacitor tiene documentación extensa y comunidad activa
- El emulador de Android Studio es gratuito y funcional

## Impacto en ADRs anteriores

| ADR | Impacto |
|---|---|
| ADR-001 (Stack Tecnológico) | Se mantiene Vite + JS. Se agrega Capacitor como capa de empaquetado |
| **ADR-002 (IndexedDB)** | **Superseded.** IndexedDB se reemplaza por SQLite vía `@capacitor-community/sqlite` |
| ADR-003 (Kanban) | Sin impacto |
| ADR-004 (Estructura) | Se agrega carpeta `android/` generada por Capacitor |

## Revisión

Este ADR se revisará al inicio de la implementación de Capacitor para verificar que el tooling funciona correctamente con el codebase existente y que la migración de IndexedDB a SQLite es viable dentro del timeline del proyecto.

---

*Decisión fundamentada en el [Relevamiento de Datos](../producto/resultados-relevamiento.md) realizado sobre 120 estudiantes del IES 6023 "Dr. Alfredo Loutaif" (Mayo 2026). Script de análisis reproducible en [`analisis-relevamiento/scripts/`](../../analisis-relevamiento/scripts/).*
