# Lean Canvas — Lumapse

**Fase Design Thinking:** Idear  
**Última actualización:** Abril 2026  
**Autor:** José David Sandoval

---

## ¿Qué es un Lean Canvas?

El Lean Canvas es una adaptación del Business Model Canvas (Osterwalder) orientada a productos digitales y startups. Permite documentar en una sola vista la lógica de negocio de un producto, respondiendo a la pregunta: **"Si tuviera que llevar este producto al mercado, ¿cómo lo haría?"**

> **Nota importante:** Este canvas se elabora como ejercicio de diseño de producto, no como plan de negocio vinculante. Su propósito es demostrar que el autor pensó más allá del código y consideró la viabilidad, distribución y sostenibilidad del producto.

---

## Canvas

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│    PROBLEMA      │    SOLUCIÓN     │  PROPUESTA DE   │ VENTAJA INJUSTA │   SEGMENTO DE   │
│                  │                 │  VALOR ÚNICA    │                 │    CLIENTES      │
│ 1. Las apps de   │ PWA offline-    │                 │ El autor ES     │                  │
│    notas requie- │ first con       │ "Tus notas.     │ parte del       │ Estudiantes de   │
│    ren conexión  │ Markdown,       │  En tu equipo.  │ público         │ nivel terciario  │
│    permanente    │ almacenamiento  │  Sin cuenta.    │ objetivo:       │ y universitario  │
│                  │ 100% local      │  Sin internet.  │ entiende el     │ hispanohablantes │
│ 2. Requieren     │ (IndexedDB),    │  Sin excusas."  │ problema        │ (18-30 años)     │
│    cuenta obli-  │ instalable      │                 │ de primera      │                  │
│    gatoria       │ como app        │                 │ mano.           │ Early adopters:  │
│                  │ nativa          │                 │                 │ compañeros de    │
│ 3. Son pesadas   │                 │                 │ Costo de        │ IES 6023 y       │
│    (+80 MB) y    │                 │                 │ desarrollo      │ UNSa (Salta)     │
│    lentas en     │                 │                 │ = $0 (proyecto  │                  │
│    dispositivos  │                 │                 │ académico)      │                  │
│    económicos    │                 │                 │                 │                  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
┌─────────────────────────────────────┬───────────────────────────────────────────────────────┐
│          MÉTRICAS CLAVE             │                    CANALES                            │
│                                     │                                                       │
│ • Notas creadas (engagement)        │ • GitHub Pages (demo web accesible)                   │
│ • Retención a 7 días (stickiness)   │ • Google Play Store via TWA ($25 registro único)      │
│ • Tiempo promedio de sesión         │ • Boca a boca en el entorno académico                 │
│ • Cantidad de notas por usuario     │ • Presentación en la defensa de PP3 como demo         │
│                                     │                                                       │
└─────────────────────────────────────┴───────────────────────────────────────────────────────┘
┌─────────────────────────────────────┬───────────────────────────────────────────────────────┐
│        ESTRUCTURA DE COSTOS         │                  FLUJO DE INGRESOS                    │
│                                     │                                                       │
│ • Hosting: $0 (GitHub Pages)        │ Modelo: Freemium / Pago único                        │
│ • Dominio (opcional): ~$12/año      │                                                       │
│ • Cuenta Google Play: $25 (único)   │ • Web (PWA): gratuita, sin restricciones              │
│ • Desarrollo: $0 (proyecto acad.)   │ • Play Store (APK via TWA): $1-2 USD                 │
│ • Infraestructura backend: $0       │   — Precio deliberadamente bajo para                 │
│   (no hay backend)                  │     eliminar incentivo de piratería                   │
│                                     │ • Sin suscripciones, sin in-app purchases             │
│ Total estimado primer año: ~$37     │ • Sin publicidad                                      │
│                                     │                                                       │
└─────────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## Desglose del Canvas

### 1. Problema

Los tres problemas principales identificados a partir del análisis de [personas](./personas.md) y del [análisis competitivo](./analisis-competitivo.md):

1. **Dependencia de conexión:** La mayoría de apps de notas requieren acceso a internet para funcionar correctamente, algo que no está garantizado en el contexto del público objetivo.
2. **Fricción de registro:** Crear una cuenta es una barrera de entrada. Para un estudiante que solo quiere tomar apuntes en clase, tener que registrarse con email, verificar, y recordar una contraseña más, es innecesario.
3. **Peso y rendimiento:** Las apps mainstream (Notion, OneNote, Evernote) consumen entre 80-150 MB y son lentas en dispositivos de gama media. En un celular con 32 GB totales, cada MB cuenta.

### 2. Solución

Lumapse resuelve los tres problemas con un enfoque técnico específico:

- **Offline-first** mediante Service Workers y almacenamiento en IndexedDB.
- **Zero-account** porque no hay backend: los datos viven en el dispositivo del usuario.
- **Peso pluma** gracias a Vanilla JS sin framework: bundle estimado < 500 KB, instalado como PWA < 2 MB.

### 3. Propuesta de Valor Única (UVP)

> **"Tus notas. En tu equipo. Sin cuenta. Sin internet. Sin excusas."**

La UVP comunica en una línea los tres diferenciadores clave: propiedad de los datos, funcionamiento offline, y cero fricción.

### 4. Ventaja Injusta

- **El autor es el usuario.** Como estudiante del IES 6023, el creador de Lumapse vive las mismas restricciones que el público objetivo. Esto no se puede replicar fácilmente.
- **Costos de operación cercanos a $0.** Sin backend, sin base de datos en la nube, sin infraestructura. GitHub Pages es gratuito. Esto permite ofrecer el producto gratuitamente o a un precio mínimo sin modelo de suscripción.

### 5. Segmento de Clientes

El segmento de clientes se define en círculos concéntricos, desde la validación local hacia el alcance global:

| Círculo | Segmento | Rol |
|---|---|---|
| **Primario (validación)** | Compañeros del IES 6023 y UNSa, Salta, Argentina | Early adopters con acceso directo para feedback |
| **Secundario (alcanzable)** | Estudiantes terciarios y universitarios hispanohablantes con conectividad limitada y recursos acotados | Mercado natural si se publica en Play Store |
| **Terciario (aspiracional)** | Cualquier estudiante a nivel global | Alcanzable con internacionalización (i18n) futura |

Las restricciones que definen al público (conectividad limitada, dispositivos modestos, sin presupuesto para herramientas premium) son comunes en toda Latinoamérica y otras regiones hispanohablantes, no son exclusivas de Argentina.

### 6. Canales de distribución

| Canal | Tipo | Costo | Alcance |
|---|---|---|---|
| **GitHub Pages** | Web directa | $0 | Cualquiera con link |
| **Google Play Store** | Marketplace móvil | $25 (único) | Usuarios Android globales |
| **Boca a boca académico** | Orgánico | $0 | Compañeros e instituciones locales |
| **Defensa de PP3** | Demo en vivo | $0 | Profesores y evaluadores |

**Sobre la distribución móvil (Play Store):**

La PWA puede empaquetarse como APK mediante **TWA (Trusted Web Activity)** utilizando herramientas como [Bubblewrap](https://github.com/niceferrari/niceferrari.github.io) de Google. Este proceso:
- No requiere reescribir la app en Java/Kotlin.
- El APK resultante es una capa nativa mínima que abre la PWA.
- El tamaño del APK resultante es < 5 MB.
- Permite cobrar en la Play Store como cualquier app nativa.

Esto valida la decisión técnica de construir una PWA en lugar de una app nativa: **una sola base de código cubre web + móvil + desktop.**

### 7. Métricas clave

En un escenario de producto real, las métricas se medirían con analytics respetuosos (sin tracking de terceros). En el contexto académico, se propone validar:

| Métrica | Cómo se mediría | Meta |
|---|---|---|
| Notas creadas en primera sesión | Feedback de usuarios de prueba | ≥ 3 notas |
| Retención a 7 días | ¿El usuario volvió a usar la app? | ≥ 50% |
| Tiempo a primera nota | Medición manual en test de usabilidad | ≤ 10 segundos |
| Satisfacción general | Encuesta simple (1-5) | ≥ 4/5 |

### 8. Estructura de costos

| Concepto | Costo | Frecuencia |
|---|---|---|
| Hosting (GitHub Pages) | $0 | — |
| Dominio personalizado (opcional) | ~$12 USD | Anual |
| Cuenta Google Play Developer | $25 USD | Único |
| Desarrollo | $0 | Proyecto académico |
| Backend / infraestructura | $0 | No aplica (no hay backend) |
| **Total primer año** | **~$37 USD** | |

### 9. Flujo de ingresos

**Modelo híbrido: Gratuito en web + Pago mínimo en Store.**

| Versión | Precio | Justificación |
|---|---|---|
| PWA (web) | Gratuita | Sin restricciones. Es el producto completo. |
| Play Store (APK) | $1 - $2 USD | Pago único. Sin suscripción, sin ads, sin in-app. |

**¿Por qué $1-2 USD?**

- Es un precio lo suficientemente bajo como para que **no valga la pena buscar una versión pirata**.
- Cubre con creces el costo del registro de desarrollador ($25) con ~15-25 ventas.
- No crea expectativas de "producto premium" que el scope del proyecto no puede cumplir.
- Demuestra al evaluador que el alumno pensó en un modelo de monetización real y sostenible.

---

## Relación con las decisiones técnicas

Este canvas valida retroactivamente varias decisiones técnicas ya tomadas:

| Decisión técnica | Validación desde el canvas |
|---|---|
| PWA en vez de app nativa | ✅ Una base de código → web + móvil (via TWA) |
| Vanilla JS sin framework | ✅ Bundle mínimo → descarga rápida en 3G |
| IndexedDB local | ✅ No necesita backend → costos de operación = $0 |
| No requiere cuenta | ✅ Elimina fricción → conversión más alta |
| Markdown como formato | ✅ Sin vendor lock-in → portabilidad total |

---

*Documento de la fase Idear · Design Thinking · Lumapse · PP3 · 2026*
