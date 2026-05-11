# Relevamiento de Datos — Lumapse

> **Fecha de diseño:** 2026-04-28  
> **Estado:** En curso — la encuesta se ejecuta en paralelo al desarrollo  
> **Instrumento:** Encuesta autoadministrada (Google Forms + código QR)

---

## 1. Objetivo del relevamiento

Validar con datos reales las necesidades, hábitos y problemas de los estudiantes del IES 6023 en relación con la toma de notas, para contrastar y ajustar los artefactos de diseño definidos en el Hito 01 (personas, problem statement, requisitos funcionales y no funcionales).

El relevamiento **no bloquea** el avance del proyecto. El desarrollo del Hito 02 continúa en paralelo. Los resultados, cuando estén disponibles, se incorporan como validación o ajuste de decisiones ya tomadas.

---

## 2. Población

| Parámetro | Valor |
|---|---|
| Unidad de análisis | Estudiante regular del IES 6023 "Dr. Alfredo Loutaif" |
| Tamaño de la población (N) | 1.239 |
| Turnos | Mañana, Tarde, Noche |
| Carreras | 5 profesorados + 2 tecnicaturas (7 carreras con matrícula activa) |
| Exclusiones | Estudiantes que asisten únicamente a rendir examen |
| Ciclo lectivo | 2026 |

### Justificación

La población coincide con el público objetivo de Lumapse: estudiantes de nivel superior que necesitan herramientas de captura y organización de notas. Al ser estudiante del IES 6023, el investigador tiene acceso directo para distribuir el instrumento.

### Composición de la oferta académica (ciclo 2026)

El IES 6023 ofrece carreras de formación docente (profesorados, 4 años) y carreras técnicas (tecnicaturas, 3 años). En el ciclo lectivo 2026 se produjo un cambio en la oferta: se abrió el Profesorado en Física y se cerró la inscripción al Profesorado en Lengua y Literatura. Ambas carreras tienen matrícula activa durante este ciclo.

| Carrera | Tipo | Duración | Años activos en 2026 | Observaciones |
|---|---|---|---|---|
| Prof. Educación Especial | Profesorado | 4 años | 1° a 4° | — |
| Prof. Educación Primaria | Profesorado | 4 años | 1° a 4° | — |
| Prof. Danzas con orientación Folklórica | Profesorado | 4 años | 1° a 4° | — |
| Prof. Física | Profesorado | 4 años | Solo 1° | Apertura 2026 |
| Prof. Lengua y Literatura | Profesorado | 4 años | 2° a 4° | Sin ingreso 2026 (carrera en cierre progresivo) |
| Tec. Análisis de Sistemas y Desarrollo de Software | Tecnicatura | 3 años | 1° a 3° | — |
| Tec. Superior en Turismo | Tecnicatura | 3 años | 1° a 3° | — |

> **Nota:** Los estudiantes del Prof. en Lengua y Literatura siguen cursando hasta completar la carrera, por lo que forman parte de la población encuestable. El Prof. en Física, al ser de reciente apertura, solo aporta alumnos de primer año, lo que puede sesgar las respuestas de esa carrera hacia un perfil de ingresante.

---

## 3. Muestra

### Fórmula utilizada (poblaciones finitas)

Se utiliza la fórmula estándar para el cálculo de muestras en **poblaciones finitas**, dado que el tamaño de la población es conocido y acotado (N = 1.239). La fundamentación completa de por qué se eligió esta fórmula, la explicación detallada de cada variable, el cálculo paso a paso y el análisis de contingencia se encuentran en [`metodologia-muestral.md`](./metodologia-muestral.md).

$$
n = \frac{N \cdot Z^2 \cdot p \cdot q}{e^2 \cdot (N - 1) + Z^2 \cdot p \cdot q}
$$

Donde:

| Variable | Significado | Valor usado |
|---|---|---|
| `n` | Tamaño de la muestra (resultado) | — |
| `N` | Tamaño de la población | 1.239 |
| `Z` | Valor crítico según nivel de confianza (distribución normal) | 1.96 (95%) o 1.645 (90%) |
| `p` | Proporción esperada (máxima variabilidad por ausencia de datos previos) | 0.5 |
| `q` | Complemento de p (q = 1 − p) | 0.5 |
| `e` | Margen de error máximo admisible | 5%, 7% o 10% |

### Escenarios

| Confianza | Z | Margen de error | n necesario |
|---|---|---|---|
| 95% | 1.96 | 5% | 293 |
| 95% | 1.96 | 7% | 166 |
| 95% | 1.96 | 10% | 90 |
| 90% | 1.645 | 7% | 125 |
| 90% | 1.645 | 10% | 68 |

### Objetivo y contingencia

- **Objetivo:** alcanzar al menos **90 respuestas** (confianza 95%, margen 10%).
- **Deseable:** 125+ respuestas (confianza 90%, margen 7%).
- **Si no se alcanza el mínimo:** los resultados se reportan como **exploratorios** (sin inferencia estadística), indicando el tamaño logrado y sus limitaciones. El proyecto no se detiene.

### Tipo de muestreo

No probabilístico por conveniencia con control de cobertura por turno. Se busca que los tres turnos estén representados, sin imponer cuotas estrictas.

---

## 4. Estrategia de distribución

| Canal | Descripción |
|---|---|
| Código QR en aulas | Impreso y pegado en las aulas de los 3 turnos |
| Preceptores | Se les solicita difundir el link en cada curso |
| Grupos de WhatsApp | Difusión en grupos estudiantiles del IES 6023 |

El formulario es anónimo, autoadministrado y no requiere cuenta de Google para responder. El tiempo estimado de respuesta es de **2-3 minutos**.

---

## 5. Instrumento — Encuesta

### Criterios de diseño

- **Máximo 13 preguntas** para minimizar abandono (una condicional, por lo que cada encuestado responde 12 como máximo).
- Preguntas cerradas (opción múltiple o casillas) para facilitar respuesta rápida y análisis cuantitativo.
- Solo 1 pregunta abierta opcional al final.
- Cada pregunta está vinculada a un artefacto del proyecto que valida.
- **Ramificación condicional** para evitar que un encuestado responda preguntas que no le aplican, previniendo datos inconsistentes.

---

### Estructura del formulario (secciones y ramificación)

El formulario se organiza en **4 secciones** con lógica de ramificación condicional en Google Forms. El objetivo es que cada encuestado solo vea las preguntas que le corresponden según sus respuestas previas, evitando contradicciones lógicas y datos inconsistentes.

> **¿Por qué 4 secciones?** Google Forms aplica la ramificación condicional **entre secciones**, no entre preguntas individuales dentro de una misma sección. Por eso P4 y P5 deben estar en secciones separadas: si estuvieran juntas, el encuestado vería P5 aun habiendo seleccionado "No tomo notas" en P4.

| Sección | Contenido | Quién la ve |
|---|---|---|
| Sección 1 | P1 a P4 — Datos demográficos y método de toma de notas | Todos los encuestados |
| Sección 2 | P5 — Percepción de dificultad | Solo quienes toman notas (P4 ≠ "No tomo notas") |
| Sección 3 | P5b — Detalle de dificultades concretas | Solo quienes respondieron P5 = "Sí" |
| Sección 4 | P6 a P12 — Conectividad, interés en la app, features, dispositivo, organización, comentarios | Todos los encuestados |

**Flujo de ramificación:**

```
  Sección 1: P1 → P2 → P3 → P4 → ¿Toma notas?
                                      │
                          ┌─────── Sí ─┴─ No ───────┐
                          │                         │
                          ▼                         │
                    Sección 2: P5                   │
                    ¿Dificultad?                    │
                      │          │                  │
                   Sí ┘          └ No               │
                   │                │               │
                   ▼                │               │
              Sección 3: P5b        │               │
                   │                │               │
                   └────────┬───────┘               │
                            │                       │
                            ▼                       ▼
                       Sección 4: P6 → P7 → … → P12
```

**Justificación de las ramificaciones:**

1. **P4 = "No tomo notas" → salta a Sección 4.** Si el encuestado declara que no toma notas, preguntarle por dificultades con una actividad que no realiza (P5) generaría confusión y datos inconsistentes. El salto directo a P6 preserva la coherencia lógica del instrumento.
2. **P5 = "No" → salta a Sección 4.** Si el encuestado toma notas pero no percibe dificultades, forzarlo a elegir problemas en P5b introduciría ruido en los datos. Solo quienes declaran tener dificultades las detallan.

---

### Preguntas

#### Sección 1 — Perfil del encuestado y método de toma de notas (P1–P4)

**P1. ¿En qué turno cursás?**  
Tipo: Opción múltiple  
Opciones: Mañana · Tarde · Noche  
*Valida: estratificación de la muestra*

**P2. ¿Qué carrera cursás?**  
Tipo: Opción múltiple  
Opciones: [Las 7 carreras del IES 6023 con matrícula activa]  
*Valida: estratificación de la muestra*

**P3. ¿En qué rango de edad te encontrás?**  
Tipo: Opción múltiple  
Opciones: 18-22 · 23-27 · 28-35 · 36-45 · 46 o más  
*Valida: perfil demográfico, contraste con supuesto de afinidad tecnológica, segmentación de `personas.md`*

**P4. ¿Cómo tomás notas principalmente en clase?**  
Tipo: Opción múltiple  
Opciones: Cuaderno/papel · Celular · Notebook/PC · Tablet · No tomo notas  
*Valida: `personas.md`, `problem-statement.md`*

> **Ramificación:** si la respuesta es **"No tomo notas"**, se salta directamente a la Sección 4 (P6). Las demás opciones continúan a P5 (Sección 2).

#### Sección 2 — Percepción de dificultad (P5)

**P5. ¿Sentís que tenés alguna dificultad con tu forma actual de tomar notas?**  
Tipo: Opción múltiple  
Opciones: Sí · No  
*Valida: `problem-statement.md` — cuantifica la proporción de estudiantes que perciben un problema real*

> **Ramificación:** si la respuesta es **"Sí"**, se muestra P5b (Sección 3). Si la respuesta es **"No"**, se salta directamente a P6 (Sección 4).

#### Sección 3 — Detalle de dificultades (condicional)

**P5b. ¿Cuáles son las principales dificultades? (elegí hasta 3)**  
Tipo: Casillas (máximo 3)  
Condición: Solo se muestra si P5 = "Sí"  
Opciones: No encuentro lo que busco · Se desorganizan rápido · No puedo acceder sin internet · Me cuesta organizar el formato (títulos, listas, tablas, fórmulas) · Pierdo notas con frecuencia · Otra  
*Valida: `problem-statement.md`, `requisitos-funcionales.md` — identifica los pain points específicos para priorizar funcionalidades*

#### Sección 4 — Conectividad, interés y preferencias (P6–P12)

**P6. ¿Tenés acceso estable a internet en el instituto?**  
Tipo: Opción múltiple  
Opciones: Siempre · Casi siempre · A veces · Raramente · Nunca  
*Valida: decisión offline-first (`ADR-002`), `requisitos-no-funcionales.md`*

**P7. ¿Qué tan útil te parecería una app web gratuita, sin cuenta, para tomar notas de estudio?**  
Tipo: Escala Likert 5  
Opciones: Nada útil · Poco útil · Algo útil · Útil · Muy útil  
*Valida: `lean-canvas.md` (propuesta de valor)*

**P8. ¿Qué características te importan más en una app de notas? (elegí hasta 3)**  
Tipo: Casillas (máximo 3)  
Opciones: Que funcione sin internet · Que sea rápida · Que no pida cuenta · Que permita organizar por materia · Que guarde automáticamente · Que funcione en celular y PC  
*Valida: priorización MoSCoW en `requisitos-funcionales.md`*

**P9. ¿Desde qué dispositivo usarías más una app de notas?**  
Tipo: Opción múltiple  
Opciones: Celular · Notebook/PC · Tablet · Cualquiera por igual  
*Valida: decisión PWA, diseño responsive*

**P10. ¿Probarías un prototipo de la app cuando esté disponible?**  
Tipo: Opción múltiple  
Opciones: Sí · Tal vez · No  
*Valida: interés real, potenciales beta testers*

**P11. ¿Cómo preferirías organizar tus notas de estudio?**  
Tipo: Opción múltiple  
Opciones: En carpetas por materia (ej: "Álgebra", "Historia") · Con etiquetas/tags (ej: #parcial, #resumen) · En una lista simple sin organización · No me importa, con tal de encontrarlas rápido  
*Valida: arquitectura de navegación (Inbox/Subjects/Archive), decisión carpetas vs tags — informa directamente el diseño del Hito 04*

**P12. ¿Algún comentario o sugerencia? (opcional)**  
Tipo: Párrafo  
Descripción: *"¿Hay algo específico de tu carrera que te complique tomar notas? (ej: fórmulas en Física, planificaciones en los Profesorados, diagramas en Sistemas). ¡Cualquier necesidad que nos cuentes nos ayuda un montón a diseñar la app!"*  
*Captura insights cualitativos no previstos, segmentados por carrera*

---

## 6. Relación con el desarrollo del proyecto

```
                            ┌─────────────────────────────┐
                            │   Hito 01 (completado)      │
                            │   Personas, requisitos,     │
                            │   problem statement, UML    │
                            └──────────────┬──────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
            ┌───────▼───────┐    ┌─────────▼─────────┐            │
            │  Relevamiento │    │  Hito 02 (dev)    │            │
            │  (encuesta)   │    │  Editor core,     │            │
            │  En paralelo  │    │  StorageService,  │            │
            │               │    │  NoteService      │            │
            └───────┬───────┘    └─────────┬─────────┘            │
                    │                      │                      │
                    └──────────┬───────────┘                      │
                               │                                  │
                    ┌──────────▼──────────┐                       │
                    │  Validación cruzada │                       │
                    │  Ajustar artefactos │◄──────────────────────┘
                    │  si los datos lo    │
                    │  requieren          │
                    └─────────────────────┘
```

### Reglas de operación

1. **El relevamiento no bloquea el desarrollo.** El Hito 02 avanza independientemente.
2. **Los resultados se incorporan cuando estén disponibles.** Si validan las decisiones actuales, se documenta la confirmación. Si las contradicen, se evalúa el ajuste.
3. **Si la muestra es insuficiente**, los datos se reportan como exploratorios y se documenta la limitación. No se descartan.
4. **El instrumento se puede reutilizar** en etapas posteriores (beta testing, validación de MVP).

---

## 7. Análisis previsto

Una vez recolectadas las respuestas:

| Análisis | Método |
|---|---|
| Distribución demográfica | Frecuencias y porcentajes por turno/carrera/edad |
| Hábitos de toma de notas | Frecuencias de P4, gráfico de barras |
| Proporción con dificultades | Distribución de P5 (Sí/No), porcentaje — **base: solo quienes toman notas** (P4 ≠ "No tomo notas") |
| Dificultades principales | Ranking de P5b (solo respondentes con P5 = "Sí"), gráfico de Pareto |
| Validación offline-first | Distribución de P6 |
| Interés en la propuesta | Media y distribución de P7 |
| Priorización de features | Ranking ponderado de P8 |
| Dispositivo principal | Distribución de P9 |
| Interés en beta testing | Distribución de P10 (Sí/Tal vez/No), porcentaje — identifica potenciales testers para el Hito 04 |
| Modelo de organización preferido | Distribución de P11 |
| Insights cualitativos | Categorización temática de respuestas abiertas de P12, segmentadas por carrera (P2) |
| Cruce turno × dificultades | Tabla cruzada P1 × P5b (filtrado por P5 = "Sí") |
| Cruce carrera × dispositivo | Tabla cruzada P2 × P9 |
| Cruce dispositivo × organización | Tabla cruzada P9 × P11 (detecta si quienes usan celular prefieren organización más simple) |
| Cruce edad × hábitos de notas | Tabla cruzada P3 × P4 (valida supuesto de afinidad tecnológica) |
| Cruce edad × features prioritarias | Tabla cruzada P3 × P8 (detecta necesidades diferenciadas por segmento etario) |

Los resultados se documentarán en `docs/producto/resultados-relevamiento.md` cuando estén disponibles.

---

## 8. Limitaciones declaradas

- **Sesgo de autoselección:** quienes responden pueden tener mayor afinidad tecnológica que el promedio.
- **Cobertura:** no se garantiza alcanzar a todos los turnos/carreras por igual.
- **Tamaño de muestra:** depende de la colaboración de preceptores y la disposición de los estudiantes.
- **Mitigación:** distribución presencial (QR en aulas), anonimato, brevedad del formulario (2-3 min), y documentación transparente de las limitaciones.

Estas limitaciones se asumen conscientemente. El relevamiento aporta datos empíricos — aun parciales — que son superiores a decisiones basadas exclusivamente en supuestos del diseñador.
