# Análisis Competitivo — Lumapse

**Fase Design Thinking:** Definir / Idear
**Última actualización:** 2026-07-15
**Versión:** 1.1 — Actualizado post-relevamiento
**Autor:** José David Sandoval

> **Nota de lectura temporal:** La fila de Lumapse se revisó para reflejar el pivote a Capacitor + SQLite ([ADR-005](../adr/ADR-005-pivote-app-nativa.md), [ADR-006](../adr/ADR-006-arquitectura-de-persistencia-y-tooling-sqlite-para-desarrollo-web-y-native.md)). Las cifras y apreciaciones sobre terceros corresponden al relevamiento competitivo original y no fueron revalidadas en julio de 2026.

---

## Objetivo del análisis

Comparar un conjunto de herramientas de notas contra criterios relevantes para el público objetivo inicial de Lumapse —estudiantes terciarios y universitarios del contexto local, con conectividad irregular y recursos acotados— para identificar oportunidades y riesgos de posicionamiento. El análisis no pretende demostrar que ninguna alternativa resuelva el problema ni sustituye una revalidación actual de los productos comparados.

---

## Criterios de evaluación

Los criterios se derivan directamente de las necesidades identificadas en las [personas de usuario](./personas.md):

| Criterio | ¿Por qué importa? |
|---|---|
| **Offline real** | Datos móviles limitados, WiFi institucional inestable |
| **Sin cuenta obligatoria** | Fricción de registro, privacidad, dependencia de un proveedor |
| **Tamaño de app** | Dispositivos con almacenamiento limitado |
| **Markdown** | Formato portable y universal, preferido por estudiantes técnicos |
| **Gratuita** | Sin presupuesto para suscripciones mensuales |
| **Cross-platform** | Debe funcionar en Android + escritorio (Linux/Windows) |
| **Velocidad de arranque** | En el aula, cada segundo cuenta |

---

## Matriz comparativa

| Herramienta | Offline real | Sin cuenta | Tamaño | Markdown | Gratuita | Cross-platform | Velocidad |
|---|---|---|---|---|---|---|---|
| **Google Keep** | ⚠️ Parcial | ❌ Google | ~25 MB | ❌ | ✅ | ✅ | ✅ Rápida |
| **Notion** | ⚠️ Parcial | ❌ Email | ~80 MB | ⚠️ Limitado | ⚠️ Freemium | ✅ | ❌ Lenta |
| **Obsidian** | ✅ | ✅ | ~60 MB | ✅ | ✅ Base | ⚠️ Móvil lento | ⚠️ Media |
| **OneNote** | ⚠️ Parcial | ❌ Microsoft | ~120 MB | ❌ | ✅ | ✅ | ❌ Lenta |
| **Apple Notes** | ✅ | ❌ Apple ID | Sistema | ❌ | ✅ | ❌ Solo Apple | ✅ Rápida |
| **Simplenote** | ⚠️ Parcial | ❌ Email | ~15 MB | ⚠️ Básico | ✅ | ✅ | ✅ Rápida |
| **Evernote** | ⚠️ Parcial | ❌ Email | ~150 MB | ❌ | ❌ Freemium | ✅ | ❌ Lenta |
| **Standard Notes** | ✅ | ❌ Email | ~30 MB | ✅ Ext. paga | ⚠️ Freemium | ✅ | ✅ Rápida |
| **Joplin** | ✅ | ✅ | ~80 MB | ✅ | ✅ | ✅ | ⚠️ Media |
| **Lumapse** | ⚠️ Evidencia parcial | ✅ | Presupuesto de bundle verificado | ✅ | ✅ | ⚠️ Android actual | ⚠️ Pendiente medir en dispositivo |

> **Leyenda:** ✅ Cumple · ⚠️ Cumple parcialmente · ❌ No cumple

---

## Análisis detallado por competidor

### Google Keep

- **Fortaleza:** Ubicuidad, integración con el ecosistema Google.
- **Debilidad para nuestro público:** No funciona offline de forma confiable si la app nunca se abrió con conexión. Requiere cuenta Google. No soporta Markdown. No permite exportar notas individuales fácilmente.
- **Conclusión:** Es la opción "por defecto" de muchos estudiantes, pero no por elección sino por inercia.

### Notion

- **Fortaleza:** Potencia y flexibilidad para equipos y gestión de proyectos.
- **Debilidad para nuestro público:** Extremadamente pesada. El modo offline es inconsistente y requiere plan de pago para funcionalidad completa. La curva de aprendizaje es alta para quien solo quiere tomar notas. El arranque en frío puede tardar 5-10 segundos en dispositivos modestos.
- **Conclusión:** Notion resuelve un problema diferente (gestión de conocimiento empresarial). Es over-engineering para tomar apuntes en clase.

### Obsidian

- **Fortaleza:** El competidor más cercano filosóficamente. Local-first, Markdown nativo, extensible.
- **Debilidad para nuestro público:** La app móvil es notoriamente lenta (reportes frecuentes en el foro oficial). El sync entre dispositivos requiere Obsidian Sync ($8 USD/mes) o configuraciones técnicas complejas (Git, Syncthing). La interfaz puede ser abrumadora para usuarios no técnicos.
- **Conclusión:** Obsidian valida que existe demanda para herramientas local-first Markdown, pero su modelo de negocio y complejidad lo alejan del público estudiantil de recursos limitados.

### Simplenote

- **Fortaleza:** Minimalista, rápida, gratuita sin restricciones evidentes.
- **Debilidad para nuestro público:** El soporte Markdown es básico (preview pero no edición enriquecida). Requiere cuenta obligatoria. El modo offline depende de haber sincronizado previamente. Sin soporte de etiquetas avanzadas ni organización por carpetas.
- **Conclusión:** Es el competidor más directo en filosofía, pero Lumapse se diferencia por no requerir cuenta y por su capacidad offline nativa.

### Joplin

- **Fortaleza:** Open source, Markdown completo, sincronización con múltiples backends.
- **Debilidad para nuestro público:** La app es pesada (~80 MB), la interfaz de usuario es funcional pero no moderna, y la configuración de sincronización requiere conocimiento técnico. No tiene versión web ligera.
- **Conclusión:** Excelente herramienta para power users, pero demasiado pesada y técnica para el usuario promedio del público objetivo.

---

## Posicionamiento de Lumapse

```
         COMPLEJIDAD ALTA
              │
    Notion ●  │
              │  ● Obsidian
              │
    OneNote ● │        ● Joplin
              │
──────────────┼────────────────────
  REQUIERE    │          NO REQUIERE
  CONEXIÓN    │          CONEXIÓN
              │
  Google   ●  │
  Keep        │    ● Simplenote
              │
  Evernote ●  │
              │        ★ LUMAPSE
              │
         COMPLEJIDAD BAJA
```

**Hipótesis de posicionamiento original:** Lumapse busca el cuadrante inferior-derecho —baja complejidad y núcleo sin conexión—. El gráfico sintetiza una lectura cualitativa del corte competitivo original; no demuestra por sí solo que el cuadrante esté desatendido en el mercado vigente.

---

## Diferenciadores clave de Lumapse

| Diferenciador | Detalle |
|---|---|
| **Zero-account** | No hay registro, login, ni recuperación de contraseña. Abrís la app y escribís. |
| **Arquitectura offline-first** | El núcleo no depende de sincronización ni backend. No hay transmisión automática; los datos solo salen por una exportación o acción de compartir iniciada explícitamente por la persona usuaria. La verificación integral de todos los flujos sin red permanece registrada como evidencia parcial en `RNF-009`. |
| **Peso pluma** | Vanilla JS sin framework y presupuesto automatizado del bundle web. El tamaño final del APK no se da por validado sin medir el artefacto publicado. |
| **Inicio sin sincronización** | No carga un workspace remoto ni ejecuta sincronización inicial. El tiempo de arranque en dispositivo queda pendiente de medición formal. |
| **Markdown nativo** | No es un add-on o extensión. Es el formato base de todas las notas. |
| **Sin vendor lock-in** | Portabilidad local sobre Markdown: el backup manual `.zip` permite exportar e importar el conjunto de notas. Compartir una nota individual sigue separado de ese flujo de respaldo. |

---

## Conclusión del análisis

El mercado de aplicaciones de notas es amplio pero está polarizado:

- **Herramientas simples** (Google Keep, Apple Notes) que requieren cuenta y no soportan Markdown.
- **Herramientas potentes** (Notion, Obsidian, Joplin) que son pesadas, complejas, o requieren pago para funcionalidad completa.

El análisis original identificó una oportunidad en la combinación de offline real + sin cuenta + Markdown + ligereza + gratuidad. Lumapse cubre hoy ese núcleo en Android; el alcance cross-platform continúa como dirección futura y no se presenta como capacidad terminada.

---

*Documento de la fase Definir / Idear · Design Thinking · Lumapse · PP3 · 2026*
