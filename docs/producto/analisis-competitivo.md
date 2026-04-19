# Análisis Competitivo — Lumapse

**Fase Design Thinking:** Definir / Idear  
**Última actualización:** Abril 2026  
**Autor:** José David Sandoval

---

## Objetivo del análisis

Evaluar las herramientas de notas existentes contra los criterios que importan al público objetivo de Lumapse (estudiantes terciarios/universitarios argentinos) para demostrar que el espacio del problema no está resuelto por las alternativas actuales.

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
| **Lumapse** | ✅ | ✅ | **< 2 MB** | ✅ | ✅ | ✅ (PWA) | ✅ **Instantánea** |

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

**Lumapse ocupa el cuadrante inferior-derecho:** baja complejidad + no requiere conexión. Este es el cuadrante desatendido por el mercado actual.

---

## Diferenciadores clave de Lumapse

| Diferenciador | Detalle |
|---|---|
| **Zero-account** | No hay registro, login, ni recuperación de contraseña. Abrís la app y escribís. |
| **True offline** | No es "offline con sync pendiente". Es offline por diseño. Los datos nunca salen del dispositivo. |
| **Peso pluma** | Bundle < 2 MB. Una PWA que se instala en segundos, incluso con conexión 3G. |
| **Arranque instantáneo** | Sin splash screens, sin carga de workspace, sin sincronización inicial. |
| **Markdown nativo** | No es un add-on o extensión. Es el formato base de todas las notas. |
| **Sin vendor lock-in** | Export/Import en Markdown puro. Tus notas son archivos `.md` estándar. |

---

## Conclusión del análisis

El mercado de aplicaciones de notas es amplio pero está polarizado:

- **Herramientas simples** (Google Keep, Apple Notes) que requieren cuenta y no soportan Markdown.
- **Herramientas potentes** (Notion, Obsidian, Joplin) que son pesadas, complejas, o requieren pago para funcionalidad completa.

**No existe una herramienta que combine:** offline real + sin cuenta + Markdown + ligera + gratuita + cross-platform. Ese es el espacio que Lumapse ocupa.

---

*Documento de la fase Definir / Idear · Design Thinking · Lumapse · PP3 · 2026*
