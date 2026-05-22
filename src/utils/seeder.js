import { createSubject, createNote, loadSubjects, loadNotes } from '../store/NoteStore.data.js'

/**
 * Carga los datos de ejemplo exactamente como se definieron para el guion de TikTok.
 */
export async function seedTiktokData() {
  console.log('Iniciando carga de datos para TikTok...')
  
  // 1. Programación I
  const progSubject = await createSubject('💻 Programación I', '#818cf8', null)
  const progSection = await createSubject('Unidad 1 — Fundamentos', null, progSubject.id)
  
  await createNote('Variables y tipos de datos', `En JavaScript existen tres formas de declarar variables:

- \`var\` → alcance global o de función (**evitar**)
- \`let\` → alcance de bloque, se puede reasignar
- \`const\` → alcance de bloque, **no** se puede reasignar

## Ejemplo

\`\`\`js
const nombre = "Lucía";
let edad = 22;

if (edad >= 18) {
  let mensaje = "Es mayor de edad";
  console.log(mensaje);
}
\`\`\`

> **Importante:** siempre preferir \`const\` salvo que necesites reasignar.`, progSection.id)

  await createNote('Estructuras de control', `## Condicionales

\`\`\`js
const nota = 7;

if (nota >= 6) {
  console.log("Aprobado");
} else {
  console.log("Desaprobado");
}
\`\`\`

## Bucles

El \`for\` clásico recorre una cantidad fija de veces:

\`\`\`js
for (let i = 0; i < 5; i++) {
  console.log("Iteración:", i);
}
\`\`\`

**Tip de parcial:** el \`while\` se usa cuando no sabemos cuántas veces iterar.`, progSection.id)

  // 2. Derecho Constitucional
  const derechoSubject = await createSubject('⚖️ Derecho Const.', '#f87171', null)
  const derechoSection = await createSubject('Unidad 3 — Derechos y Garantías', null, derechoSubject.id)

  await createNote('Art. 14 — Derechos civiles', `Todos los habitantes de la Nación gozan de los siguientes derechos conforme a las leyes que reglamenten su ejercicio:

- Trabajar y ejercer toda industria lícita
- Navegar y comerciar
- Peticionar ante las autoridades
- Entrar, permanecer, transitar y salir del territorio
- Publicar ideas por la prensa sin censura previa
- Usar y disponer de su propiedad
- Asociarse con fines útiles
- Profesar libremente su culto
- Enseñar y aprender

## Notas de clase

> El profesor remarcó que estos derechos **no son absolutos**: están sujetos a reglamentación razonable.

**Diferencia clave:**
- *Art. 14* → derechos para **todos los habitantes**
- *Art. 14 bis* → derechos específicos del **trabajador**`, derechoSection.id)

  // 3. Matemática II
  const matSubject = await createSubject('📐 Matemática II', '#fbbf24', null)
  const matSection = await createSubject('Unidad 2 — Derivadas', null, matSubject.id)

  await createNote('Reglas básicas de derivación', `## Regla de la potencia

Si f(x) = x^n, entonces **f'(x) = n · x^(n-1)**

Ejemplos:
- f(x) = x^3 → f'(x) = 3x^2
- f(x) = x^5 → f'(x) = 5x^4
- f(x) = x → f'(x) = 1

## Regla de la suma

La derivada de una suma es la suma de las derivadas:

**[f(x) + g(x)]' = f'(x) + g'(x)**

## Ejemplo resuelto

Derivar f(x) = 3x^4 + 2x^2 - 7x + 5

1. Derivamos cada término por separado
2. f'(x) = 12x^3 + 4x - 7

> El **+5** desaparece porque la derivada de una constante es 0.`, matSection.id)

  await createNote('Aplicaciones de la derivada', `## ¿Para qué sirve derivar?

- **Velocidad:** si la posición es s(t), la velocidad es s'(t)
- **Máximos y mínimos:** donde f'(x) = 0, hay un punto crítico
- **Crecimiento:** si f'(x) > 0 la función crece, si f'(x) < 0 decrece

## Pasos para encontrar máximos y mínimos

1. Calcular f'(x)
2. Igualar a cero: f'(x) = 0
3. Resolver la ecuación
4. Evaluar f''(x) en esos puntos:
   - Si f''(x) > 0 → **mínimo**
   - Si f''(x) < 0 → **máximo**`, matSection.id)

  // 4. Inglés Técnico
  const inglesSubject = await createSubject('🌍 Inglés Técnico', '#34d399', null)
  const inglesSection = await createSubject('Vocabulario IT', null, inglesSubject.id)

  await createNote('Términos esenciales', `## Hardware vs Software

| Término | Significado | Ejemplo |
|---------|------------|---------|
| CPU | Unidad central de proceso | Intel i7 |
| RAM | Memoria de acceso aleatorio | 16 GB DDR5 |
| SSD | Disco de estado sólido | 512 GB NVMe |
| OS | Sistema operativo | Linux, Windows |
| GUI | Interfaz gráfica de usuario | El escritorio |

## Verbos frecuentes en documentación

- **Deploy** → desplegar (subir a producción)
- **Fetch** → obtener (traer datos)
- **Parse** → analizar (interpretar un texto)
- **Render** → renderizar (dibujar en pantalla)
- **Debug** → depurar (buscar errores)

> **Tip:** en entrevistas técnicas en inglés, se usa mucho *"Can you walk me through..."* para pedir que expliques un proceso paso a paso.`, inglesSection.id)

  await loadSubjects()
  await loadNotes()
  alert('¡Datos de TikTok cargados con éxito!')
}

/**
 * Carga de datos masiva para pruebas de estrés.
 * Crea N notas aleatorias.
 */
export async function seedStressTest(count = 100) {
  if (!window.confirm("¿Seguro que deseas generar " + count + " notas de prueba? Esto puede tomar un momento.")) return
  
  console.log("Iniciando stress test con " + count + " notas...")
  
  const testSubject = await createSubject('🔥 Prueba de Estrés', '#f472b6', null)
  const testSection = await createSubject("Set de " + count, null, testSubject.id)

  for (let i = 1; i <= count; i++) {
    await createNote("Nota de prueba " + i, "Este es el contenido generado automáticamente para la nota de prueba número " + i + ".\n\n- Rendimiento de SQLite\n- Velocidad de renderizado de Markdown\n- Test " + Math.random().toString(36).substring(7), testSection.id)
  }
  
  await loadSubjects()
  await loadNotes()
  alert("¡Prueba de estrés completada! (" + count + " notas)")
}
