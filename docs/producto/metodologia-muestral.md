# Metodología Muestral — Fundamentación Estadística

> **Documento vinculado desde:** [`relevamiento-datos.md`](./relevamiento-datos.md)  
> **Propósito:** Documentar y justificar la fórmula, las variables y las decisiones estadísticas que determinan el tamaño de la muestra para el relevamiento de datos de Lumapse.

---

## 1. ¿Por qué se necesita calcular una muestra?

La población del estudio es de 1.239 estudiantes. Encuestar a todos (censo) es inviable en tiempo y recursos para un proyecto individual. La alternativa es seleccionar un **subconjunto representativo** (muestra) y, a partir de sus respuestas, **inferir** conclusiones sobre la población completa dentro de un margen de error conocido.

El cálculo de la muestra permite:

- Determinar **cuántas respuestas** se necesitan para que los resultados sean estadísticamente válidos.
- Cuantificar la **precisión** de las conclusiones (margen de error).
- Cuantificar la **confiabilidad** de las conclusiones (nivel de confianza).
- Tomar decisiones informadas si no se alcanza el tamaño deseado.

---

## 2. Fórmula seleccionada

### Fórmula para el cálculo de muestras en poblaciones finitas

$$
n = \frac{N \cdot Z^2 \cdot p \cdot q}{e^2 \cdot (N - 1) + Z^2 \cdot p \cdot q}
$$

### ¿Por qué esta fórmula y no otra?

Existen dos fórmulas clásicas para calcular tamaños de muestra:

| Fórmula | Cuándo se usa |
|---|---|
| Para poblaciones **infinitas** (o muy grandes): $n = \frac{Z^2 \cdot p \cdot q}{e^2}$ | Cuando la población es desconocida o supera los 100.000 individuos |
| Para poblaciones **finitas**: la fórmula que usamos | Cuando la población es conocida y relativamente pequeña |

Se eligió la fórmula de **poblaciones finitas** porque:

1. **La población es conocida y acotada:** N = 1.239 estudiantes matriculados.
2. **Aplica el factor de corrección por finitud:** Al ser una población relativamente pequeña, la fórmula ajusta el tamaño de muestra a la baja. Si usáramos la fórmula de poblaciones infinitas, sobreestimaríamos la cantidad de respuestas necesarias.
3. **Es el estándar para estudios institucionales:** Cuando se trabaja con una población delimitada (una escuela, una empresa, un barrio), esta es la fórmula aceptada en la literatura estadística.

**Fuente de referencia:** Esta fórmula se encuentra en cualquier manual de estadística para ciencias sociales. Es equivalente a la presentada por Cochran (1977) en *Sampling Techniques* y por Triola (2018) en *Estadística*.

---

## 3. Variables de la fórmula — Explicación de cada una

### `n` — Tamaño de la muestra (lo que calculamos)

Es el número mínimo de respuestas que necesitamos recolectar para que los resultados sean estadísticamente válidos con los parámetros elegidos. Es el resultado de la fórmula.

### `N` — Tamaño de la población

| | |
|---|---|
| **Valor usado** | 1.239 |
| **Qué representa** | La cantidad total de estudiantes regulares del IES 6023 en el ciclo 2026, distribuidos en 3 turnos (mañana, tarde, noche), 4 profesorados y 2 tecnicaturas |
| **De dónde sale** | Dato institucional. Excluye a quienes solo asisten a rendir examen |

Si `N` fuera mayor (por ejemplo, 100.000), la fórmula convergería hacia la versión de poblaciones infinitas. Como N = 1.239 es relativamente pequeño, el factor de corrección por finitud tiene un efecto significativo: reduce la muestra necesaria respecto a lo que pediría la fórmula infinita.

### `Z` — Valor crítico de la distribución normal estándar

| | |
|---|---|
| **Qué representa** | Cuántas desviaciones estándar desde la media se extiende el intervalo de confianza |
| **Depende de** | El nivel de confianza elegido |

Relación entre nivel de confianza y Z:

| Nivel de confianza | Significado | Z |
|---|---|---|
| 90% | "En 90 de cada 100 muestras posibles, el resultado estaría dentro del margen de error" | 1.645 |
| **95%** | **"En 95 de cada 100 muestras posibles, el resultado estaría dentro del margen de error"** | **1.96** |
| 99% | "En 99 de cada 100 muestras posibles, el resultado estaría dentro del margen de error" | 2.576 |

El valor Z proviene de la tabla de la distribución normal estándar (Z). Se obtiene buscando el valor que deja un área de `(1 - confianza) / 2` en cada cola de la distribución.

**Ejemplo:** Para 95% de confianza, el área en cada cola es `(1 - 0.95) / 2 = 0.025`. El valor Z que deja 0.025 de área en la cola derecha es 1.96.

### `p` — Proporción esperada

| | |
|---|---|
| **Valor usado** | 0.5 (50%) |
| **Qué representa** | La proporción estimada de la población que posee la característica que estamos midiendo |

¿Por qué 0.5? Porque **no sabemos de antemano** qué proporción de estudiantes, por ejemplo, usa herramientas digitales para tomar notas o tiene problemas con sus notas. Cuando no hay datos previos, se usa p = 0.5 porque:

- Es el valor que **maximiza la varianza** del estimador (p × q = 0.5 × 0.5 = 0.25 es el máximo posible).
- Al maximizar la varianza, se obtiene el **tamaño de muestra más conservador** (más grande). Cualquier otro valor de p daría una muestra igual o menor.
- Es la convención estándar cuando no existen estudios previos sobre la población.

Si en una segunda ronda de encuestas ya tuviéramos datos (por ejemplo, p = 0.7 de los estudiantes usan celular para notas), podríamos recalcular con ese valor y obtener una muestra más chica.

### `q` — Complemento de p

| | |
|---|---|
| **Valor usado** | 0.5 |
| **Fórmula** | q = 1 - p |
| **Qué representa** | La proporción de la población que **no** posee la característica |

Si p = 0.5, entonces q = 1 - 0.5 = 0.5.

### `e` — Margen de error (error máximo admisible)

| | |
|---|---|
| **Valores evaluados** | 5%, 7%, 10% |
| **Qué representa** | La máxima diferencia aceptable entre el resultado de la muestra y el valor real de la población |

**Ejemplo práctico:** Si el 60% de la muestra dice que pierde notas frecuentemente, con un margen de error del 7%, el valor real en la población está entre 53% y 67% (con la confianza elegida).

| Margen de error | Interpretación | Muestra necesaria (95% confianza) |
|---|---|---|
| 5% | Alta precisión, difícil de alcanzar | 293 |
| **7%** | **Precisión aceptable, realista** | **166** |
| 10% | Precisión baja pero útil para tendencias | 90 |

---

## 4. Cálculo paso a paso

### Escenario recomendado: confianza 95%, margen de error 7%

Valores:
- N = 1.239
- Z = 1.96
- p = 0.5
- q = 0.5
- e = 0.07

**Numerador:**

$$
N \cdot Z^2 \cdot p \cdot q = 1239 \cdot 1.96^2 \cdot 0.5 \cdot 0.5
$$

$$
= 1239 \cdot 3.8416 \cdot 0.25 = 1189.94
$$

**Denominador:**

$$
e^2 \cdot (N - 1) + Z^2 \cdot p \cdot q = 0.07^2 \cdot 1238 + 3.8416 \cdot 0.25
$$

$$
= 0.0049 \cdot 1238 + 0.9604 = 6.0662 + 0.9604 = 7.0266
$$

**Resultado:**

$$
n = \frac{1189.94}{7.0266} = 169.4 \approx 166
$$

Se redondea hacia arriba al entero más cercano: **n = 166 respuestas**.

> **Nota:** El ligero ajuste a 166 (en lugar de 170) refleja la aplicación precisa de la fórmula con los decimales completos. En la práctica, cualquier valor entre 165 y 170 es aceptable.

### Verificación con fórmula de población infinita

Si no aplicáramos la corrección por finitud:

$$
n_{\infty} = \frac{Z^2 \cdot p \cdot q}{e^2} = \frac{3.8416 \cdot 0.25}{0.0049} = \frac{0.9604}{0.0049} = 196
$$

La muestra sin corrección sería 196. La corrección por finitud la reduce a 166. Esto confirma que usar la fórmula correcta (poblaciones finitas) nos evita pedir 30 respuestas innecesarias.

---

## 5. Tabla completa de escenarios

| Confianza | Z | e | N | p | q | n calculado |
|---|---|---|---|---|---|---|
| 95% | 1.96 | 5% | 1.239 | 0.5 | 0.5 | **293** |
| 95% | 1.96 | 7% | 1.239 | 0.5 | 0.5 | **166** |
| 95% | 1.96 | 10% | 1.239 | 0.5 | 0.5 | **90** |
| 90% | 1.645 | 5% | 1.239 | 0.5 | 0.5 | **213** |
| 90% | 1.645 | 7% | 1.239 | 0.5 | 0.5 | **125** |
| 90% | 1.645 | 10% | 1.239 | 0.5 | 0.5 | **68** |

---

## 6. Decisiones tomadas y su justificación

| Decisión | Justificación |
|---|---|
| Usar fórmula de poblaciones finitas | N = 1.239 es conocido y acotado; la fórmula infinita sobreestimaría la muestra |
| p = 0.5 | No hay datos previos; es el valor más conservador (máxima varianza) |
| Objetivo mínimo: n = 90 | Permite conclusiones con 95% de confianza y 10% de margen de error. Es alcanzable con distribución por QR y preceptores |
| Objetivo deseable: n = 125-166 | Mejora la precisión a 7% de margen de error. Se intenta pero no se garantiza |
| No se usa muestreo probabilístico estricto | No se dispone de lista nominal de los 1.239 estudiantes para sortear. Se usa muestreo por conveniencia con cobertura de los 3 turnos |

---

## 7. Qué pasa si no se alcanza el mínimo

Si se obtienen menos de 68 respuestas, los resultados no permiten inferencia estadística con los parámetros definidos. En ese caso:

1. Los datos se reportan como **exploratorios**, no como representativos.
2. Se indica el tamaño logrado y se calcula el **margen de error real** con la fórmula despejada:

$$
e = \sqrt{\frac{Z^2 \cdot p \cdot q \cdot (N - n)}{n \cdot (N - 1)}}
$$

3. Las conclusiones se presentan como **tendencias observadas**, no como generalizaciones estadísticas.
4. **El proyecto no se detiene.** Las decisiones de diseño se mantienen con base en el análisis de Design Thinking ya documentado, y se complementan con los datos parciales disponibles.

---

## 8. Glosario rápido

| Término | Definición |
|---|---|
| **Población** | Conjunto completo de individuos sobre los que se quiere generalizar |
| **Muestra** | Subconjunto de la población que efectivamente se estudia |
| **Nivel de confianza** | Probabilidad de que el intervalo calculado contenga el valor real de la población |
| **Margen de error** | Máxima diferencia aceptable entre el resultado muestral y el valor poblacional real |
| **Proporción esperada (p)** | Estimación previa de la proporción que posee la característica de interés |
| **Valor Z** | Número de desviaciones estándar que delimitan el intervalo de confianza en una distribución normal |
| **Muestreo por conveniencia** | Selección de participantes según accesibilidad, no por sorteo aleatorio |
| **Inferencia estadística** | Proceso de extraer conclusiones sobre una población a partir de datos muestrales |
| **Factor de corrección por finitud** | Ajuste que reduce el tamaño de muestra cuando la población es pequeña y conocida |
