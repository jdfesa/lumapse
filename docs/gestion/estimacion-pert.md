# Estimación PERT — Módulos de Mayor Riesgo

> **Proyecto:** Lumapse  
> **Técnica:** Estimación de 3 puntos — PERT (Program Evaluation and Review Technique)  
> **Referencia:** Gómez, J. (2014), Sección 3. Guía de Estudio PP3 (Ing. Mauricio Parada, 2026).  
> **Fecha:** 2026-05-15  
> **Estimador:** José David Sandoval (proyecto individual)

---

## 1. Fundamento

La Estimación de 3 puntos (PERT) se aplica cuando existe **alta incertidumbre** sobre la
duración de una tarea, especialmente cuando el equipo no tiene experiencia previa con la
tecnología involucrada (Gómez, 2014, §3.1). En lugar de dar un único número —que
inevitablemente será incorrecto—, PERT obliga a pensar en tres escenarios:

| Escenario | Significado |
|---|---|
| **O** — Optimista | Todo sale bien: la documentación es clara, no hay errores inesperados. |
| **ML** — Más probable | Caso realista: hay que debuggear, releer docs, iterar sobre la configuración. |
| **P** — Pesimista | Peor caso: problemas de compatibilidad, errores crípticos, necesidad de replantear. |

### Fórmula PERT

```
E  = (O + 4 × ML + P) / 6      → estimación ponderada
σ  = (P - O) / 6                → desviación estándar (incertidumbre)
Rango 68% = [E - σ,  E + σ]    → intervalo de confianza
```

> La fórmula pondera el caso más probable con **4 veces más peso** que los extremos,
> produciendo estimaciones más realistas que el promedio simple.

---

## 2. Selección de módulos a estimar

Se aplica PERT a los módulos con **mayor incertidumbre técnica**, no a todo el proyecto.
Los módulos del Hito 02 (CRUD, auto-guardado, listado) ya fueron completados y su duración
real es conocida; no tiene sentido estimarlos retroactivamente con PERT.

| Módulo | Hito | Incertidumbre | ¿Aplica PERT? |
|---|---|---|---|
| Integración de Capacitor + generación Android | 03 | **Alta** — tecnología nunca usada | ✅ Sí |
| Migración de IndexedDB → SQLite | 03 | **Alta** — cambio de motor de persistencia | ✅ Sí |
| Organización por carpetas (materias) | 04 | Media — lógica de negocio nueva pero tecnología conocida | ⚠️ Opcional |
| Generación del APK firmado | 05 | Media — proceso de signing desconocido | ⚠️ Opcional |

Se desarrolla la estimación completa para los **dos módulos críticos del Hito 03**.

---

## 3. Estimación PERT: Integración de Capacitor

### Descripción

Integrar Capacitor al proyecto Vite existente, generar el proyecto Android (`android/`),
configurar el bridge entre la web app y el contenedor nativo, y lograr que la aplicación
se ejecute correctamente en un emulador Android.

### Escenarios

| Escenario | Duración | Supuesto que lo justifica |
|---|---|---|
| **O** (Optimista) | 3 días | La documentación de Capacitor es clara, `npx cap init` + `npx cap add android` funcionan sin errores, el emulador arranca a la primera. |
| **ML** (Más probable) | 7 días | Hay que resolver conflictos de versión entre Vite y Capacitor, configurar el `capacitor.config.ts` manualmente, el emulador requiere ajustes de Android SDK, y se necesitan 2-3 iteraciones de build para que funcione. |
| **P** (Pesimista) | 14 días | Incompatibilidades graves entre Vite 6 y Capacitor, problemas con Gradle/Android SDK, necesidad de cambiar la configuración del proyecto, instalación de Android Studio desde cero con errores de entorno. |

### Cálculo

```
E = (3 + 4×7 + 14) / 6
E = (3 + 28 + 14) / 6
E = 45 / 6
E = 7.5 días

σ = (14 - 3) / 6
σ = 11 / 6
σ = 1.83 días

Rango de confianza (68%): [5.7 días — 9.3 días]
```

### Resultado

> **Estimación: 7.5 días (rango: 6–9 días)**  
> Se registra en el cronograma como **8 días** (redondeado al entero superior).

### Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Vite 6 y Capacitor no se integran limpiamente | Alto | Consultar issues en GitHub de Capacitor; preparar rollback a Vite 5 si es necesario |
| Android SDK no disponible o con errores | Medio | Instalar Android Studio completo antes de iniciar la integración |
| El emulador es demasiado lento en la máquina | Bajo | Usar dispositivo Android físico (S7 Edge disponible) |

---

## 4. Estimación PERT: Migración IndexedDB → SQLite

### Descripción

Reemplazar la capa de persistencia actual (`NoteService.js` basada en la librería `idb`
para IndexedDB) por SQLite usando `@capacitor-community/sqlite`. Implica: instalar
el plugin, crear el esquema SQL, reescribir las operaciones CRUD, y verificar que los
datos se persisten correctamente en el dispositivo Android.

### Escenarios

| Escenario | Duración | Supuesto que lo justifica |
|---|---|---|
| **O** (Optimista) | 2 días | El plugin `@capacitor-community/sqlite` funciona con la configuración por defecto, el esquema es simple (una tabla `notes`), la API es intuitiva. |
| **ML** (Más probable) | 5 días | El plugin requiere configuración específica para Android, hay diferencias de API entre la documentación y la versión real, la migración de datos existentes requiere un script de traspaso, y los tests manuales toman tiempo. |
| **P** (Pesimista) | 10 días | El plugin tiene bugs conocidos con la versión de Capacitor usada, la migración de datos desde IndexedDB falla parcialmente, hay que implementar una estrategia de fallback, y los tipos de datos no mapean directamente. |

### Cálculo

```
E = (2 + 4×5 + 10) / 6
E = (2 + 20 + 10) / 6
E = 32 / 6
E = 5.33 días

σ = (10 - 2) / 6
σ = 8 / 6
σ = 1.33 días

Rango de confianza (68%): [4.0 días — 6.7 días]
```

### Resultado

> **Estimación: 5.3 días (rango: 4–7 días)**  
> Se registra en el cronograma como **6 días** (redondeado al entero superior).

### Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Pérdida de datos de notas existentes durante la migración | Crítico | Implementar export a `.zip` ANTES de migrar (ya disponible en Hito 03) |
| API del plugin de SQLite cambia entre versiones | Alto | Fijar versión exacta en `package.json` y documentar |
| Esquema SQL necesita evolucionar (agregar campos a futuro) | Medio | Diseñar el esquema con columnas opcionales desde el inicio |

---

## 5. Resumen consolidado — Hito 03

| Módulo | E (días) | σ (días) | Rango 68% | Cronograma |
|---|---|---|---|---|
| Integración Capacitor | 7.5 | 1.83 | 6–9 días | **8 días** |
| Migración IndexedDB → SQLite | 5.3 | 1.33 | 4–7 días | **6 días** |
| **Total estimado (ambos módulos)** | **12.8** | — | — | **14 días** |

> **Nota:** Los módulos no son estrictamente secuenciales — la integración de Capacitor
> debe completarse antes de la migración a SQLite. El total de 14 días (~2 semanas)
> es coherente con el período del Hito 03 (Julio 2026, un mes calendario con margen).

### Factor de ajuste (Regla 9, Gómez 2014)

La guía del profesor indica que la codificación pura representa ~60% del esfuerzo total.
Para los 14 días de desarrollo estimados:

```
Esfuerzo total = 14 / 0.60 = 23.3 días ≈ 24 días (~5 semanas)
```

| Actividad | Proporción | Días estimados |
|---|---|---|
| Desarrollo puro (codificación + integración) | 60% | 14 |
| Documentación (ADRs, hitos, informe) | 15% | 4 |
| Testing y corrección (manual + verificación) | 15% | 4 |
| Gestión y coordinación (seguimiento docente) | 10% | 2 |
| **Total** | **100%** | **24 días** |

> El período del Hito 03 (julio completo = ~22 días hábiles) es **ajustado pero viable**,
> con margen mínimo. Si el escenario pesimista se materializa en ambos módulos,
> podría ser necesario extender 1 semana hacia agosto.

---

## 6. Nota metodológica

Esta estimación fue realizada por un **único desarrollador** (proyecto individual), lo cual
elimina la divergencia de opiniones propia de las técnicas grupales (Planning Poker, Delphi).
Para compensar el sesgo inherente a la auto-estimación, se aplicaron dos medidas:

1. **Anclar el escenario pesimista en el doble del más probable**, para evitar el optimismo
   inconsciente documentado por Gómez (2014, §3.1).
2. **Documentar los supuestos explícitamente** para cada escenario, permitiendo que el
   docente o un revisor externo evalúe la razonabilidad de las estimaciones.

> **Referencia:** Gómez, J. (2014). *Guía Práctica de Estimación y Medición de Proyectos
> Software*, Sección 3: Estimación de 3 puntos y método PERT.
