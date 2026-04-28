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
| Carreras | 4 profesorados + 2 tecnicaturas |
| Exclusiones | Estudiantes que asisten únicamente a rendir examen |
| Ciclo lectivo | 2026 |

### Justificación

La población coincide con el público objetivo de Lumapse: estudiantes de nivel superior que necesitan herramientas de captura y organización de notas. Al ser estudiante del IES 6023, el investigador tiene acceso directo para distribuir el instrumento.

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

- **Máximo 11 preguntas** para minimizar abandono.
- Preguntas cerradas (opción múltiple o casillas) para facilitar respuesta rápida y análisis cuantitativo.
- Solo 1 pregunta abierta opcional al final.
- Cada pregunta está vinculada a un artefacto del proyecto que valida.

---

### Preguntas

**P1. ¿En qué turno cursás?**  
Tipo: Opción múltiple  
Opciones: Mañana · Tarde · Noche  
*Valida: estratificación de la muestra*

**P2. ¿Qué carrera cursás?**  
Tipo: Opción múltiple  
Opciones: [Las 6 carreras del IES 6023]  
*Valida: estratificación de la muestra*

**P3. ¿En qué rango de edad te encontrás?**  
Tipo: Opción múltiple  
Opciones: 18-22 · 23-27 · 28-35 · 36-45 · 46 o más  
*Valida: perfil demográfico, contraste con supuesto de afinidad tecnológica, segmentación de `personas.md`*

**P4. ¿Cómo tomás notas habitualmente en clase?**  
Tipo: Casillas (múltiple selección)  
Opciones: Cuaderno/papel · Celular · Notebook/PC · Tablet · No tomo notas  
*Valida: `personas.md`, `problem-statement.md`*

**P5. ¿Cuáles son los principales problemas con tu forma actual de tomar notas? (elegí hasta 3)**  
Tipo: Casillas (máximo 3)  
Opciones: No encuentro lo que busco · Se desorganizan rápido · No puedo acceder sin internet · El formato es incómodo · Pierdo notas con frecuencia · No tengo problemas  
*Valida: `problem-statement.md`, `requisitos-funcionales.md`*

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

**P11. ¿Algún comentario o sugerencia? (opcional)**  
Tipo: Respuesta corta  
*Captura insights cualitativos no previstos*

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
            ┌───────▼───────┐    ┌─────────▼─────────┐           │
            │  Relevamiento │    │  Hito 02 (dev)    │           │
            │  (encuesta)   │    │  Editor core,     │           │
            │  En paralelo  │    │  StorageService,  │           │
            │               │    │  NoteService      │           │
            └───────┬───────┘    └─────────┬─────────┘           │
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
| Problemas principales | Ranking de P5, gráfico de Pareto |
| Validación offline-first | Distribución de P6 |
| Interés en la propuesta | Media y distribución de P7 |
| Priorización de features | Ranking ponderado de P8 |
| Dispositivo principal | Distribución de P9 |
| Cruce turno × problemas | Tabla cruzada P1 × P5 |
| Cruce carrera × dispositivo | Tabla cruzada P2 × P9 |
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
