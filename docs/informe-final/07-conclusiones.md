# Capítulo 7: Conclusiones

## 7.1. Cumplimiento de Objetivos

## 7.2. Lecciones Aprendidas

A lo largo del desarrollo de Lumapse, se produjeron situaciones no planificadas que
obligaron a tomar decisiones técnicas y metodológicas que, en retrospectiva, resultaron
ser las experiencias de aprendizaje más valiosas del proyecto. A continuación se
documentan las más significativas.

### 7.2.1. Gestión de riesgos técnicos: la estimación PERT como herramienta de decisión

La migración de la aplicación web (PWA) a una app nativa con Capacitor fue una decisión
de alto riesgo técnico. No se trataba de agregar una funcionalidad nueva, sino de cambiar
la base sobre la cual el sistema entero se ejecutaba. Para gestionar este riesgo se
aplicó la técnica de estimación PERT (Program Evaluation and Review Technique), asignando
tres escenarios —optimista, más probable y pesimista— exclusivamente a los módulos
críticos: la integración de Capacitor y la migración de IndexedDB a SQLite.

**Lección:** La estimación formal no es solo un requisito académico; es una herramienta
que obliga a pensar en los escenarios de fracaso antes de escribir la primera línea de
código. Gracias a la estimación PERT, se identificó que la integración de Capacitor
podía extenderse hasta 14 días en el peor caso, lo que permitió planificar el hito
con holgura suficiente. Sin esta estimación, el desvío habría sido una sorpresa.

> **Referencia:** [`docs/gestion/estimacion-pert.md`](../gestion/estimacion-pert.md)

### 7.2.2. Adaptación del entorno de pruebas: hardware limitado como oportunidad

El dispositivo principal de desarrollo (Samsung Galaxy S7 Edge) tenía el módulo de
pantalla dañado: no mostraba imagen alguna. En lugar de descartarlo, se configuró un
flujo de trabajo alternativo utilizando **scrcpy**, una herramienta open source que
proyecta la pantalla del dispositivo Android en la computadora de desarrollo a través
de USB.

El comando utilizado (`scrcpy --turn-screen-off -K`) permitía:

- Ver la pantalla del celular en una ventana de macOS.
- Enviar toques y texto desde el teclado de la computadora.
- Apagar la pantalla física del dispositivo para ahorrar batería.

**Lección:** Los recursos limitados no son un impedimento si se buscan soluciones
creativas. Un dispositivo con la pantalla rota se convirtió en una estación de
debugging dedicada, aislada de datos personales, que podía ser formateada y
reinstalada sin riesgo. Esta restricción forzó a documentar exhaustivamente el
flujo de trabajo de compilación y despliegue
([`docs/flujo-desarrollo-android.md`](../flujo-desarrollo-android.md)),
lo cual terminó beneficiando la reproducibilidad del proyecto.

### 7.2.3. Estimación retroactiva vs. prospectiva: el sesgo de confirmación

Durante los Hitos 02 y 03, la estimación de Story Points se realizó de forma
**retroactiva**: primero se desarrollaron las funcionalidades y luego se les asignó
un valor en puntos. Este enfoque, si bien es pragmático para proyectos en marcha,
introduce un sesgo de confirmación: se tiende a asignar valores que confirman la
velocidad deseada, en lugar de reflejar la complejidad real.

A partir del Hito 04, se adoptó la práctica de estimar **antes** del inicio del
desarrollo, lo que permite contrastar la estimación con la realidad y generar datos
de velocidad realmente útiles para la planificación futura.

**Lección:** La estimación que no puede equivocarse no sirve. El valor de estimar
no está en acertar, sino en poder medir cuánto nos desviamos y por qué. La honestidad
en la documentación de los desvíos es más valiosa que un reporte "perfecto" que no
refleje la realidad.

> **Referencia:** [`docs/gestion/seguimiento-velocidad.md`](../gestion/seguimiento-velocidad.md)

### 7.2.4. Documentación viva vs. documentación muerta

Una de las decisiones más importantes del proyecto fue mantener toda la documentación
en formato Markdown dentro del repositorio Git, en lugar de escribirla en documentos
Word o PDF separados. Esto tuvo consecuencias profundas:

- **Versionamiento:** Cada cambio en la documentación tiene un commit asociado con
  fecha, autor y motivo. Es posible ver cómo evolucionó cualquier decisión en el tiempo.
- **Trazabilidad:** Los documentos se referencian entre sí mediante enlaces relativos
  (`[ver ADR-005](../adr/ADR-005-pivote-app-nativa.md)`), lo que permite navegar la
  documentación como un sistema interconectado.
- **Mantenimiento:** Al vivir junto al código, la documentación se actualiza en el
  mismo flujo de trabajo. No existe la desincronización entre "lo que dice el documento"
  y "lo que hace el código".

**Lección:** La documentación más completa del mundo es inútil si nadie la mantiene.
Al integrar la documentación en el flujo de Git (commit → push → review), se elimina
la fricción de mantenerla actualizada. El costo de documentar se reduce porque se hace
incrementalmente, no como un esfuerzo monolítico al final del proyecto.

## 7.3. Trabajo Futuro y Posibles Mejoras

## 7.4. Cierre
