# Guía de Contribución — Lumapse

Lumapse es un proyecto académico mantenido con prácticas de ingeniería verificables. Una contribución debe preservar el alcance offline-first, la privacidad local, la trazabilidad y la documentación que se utilizará en la defensa.

## 1. Antes de cambiar el proyecto

- Una funcionalidad debe responder a un requisito funcional o una historia de usuario de [`docs/producto/`](./docs/producto/).
- Una decisión que cambie arquitectura, persistencia, plataforma o tooling requiere un ADR en [`docs/adr/`](./docs/adr/).
- Los defectos y refactors deben identificar el riesgo que corrigen, sin ampliar silenciosamente el alcance.
- La documentación actual distingue estado vigente e historia. No se debe presentar PWA/IndexedDB como arquitectura actual ni reescribir los hitos que explican su evolución.

La arquitectura vigente se resume en [ADR-008](./docs/adr/ADR-008-arquitectura-modular-y-patrones.md): monolito modular cliente, Android/Capacitor, SQLite, módulos ES y TypeScript gradual.

## 2. Flujo de trabajo

1. Partir de `main` actualizado.
2. Crear una rama acotada y descriptiva, por ejemplo `feat/...`, `fix/...`, `docs/...`, `refactor/...` o `test/...`.
3. Mantener un solo objetivo por cambio.
4. Actualizar requisitos, ADR, backlog o changelog solo cuando el cambio realmente los afecte.
5. Ejecutar la verificación proporcional al riesgo antes de solicitar revisión.

No deben incluirse credenciales, keystores, contraseñas, bases de datos personales, artefactos temporales ni dependencias instaladas.

## 3. Commits

Se utiliza Conventional Commits con el formato:

```text
<tipo>: <descripción breve en minúsculas>
```

Tipos habituales:

- `feat`: funcionalidad visible nueva;
- `fix`: corrección de comportamiento;
- `docs`: cambio exclusivamente documental;
- `refactor`: cambio interno sin alterar funcionalidad;
- `test`: pruebas nuevas o corregidas;
- `style`: formato sin cambio lógico;
- `chore`: mantenimiento de tooling o dependencias.

El mensaje debe explicar el cambio concreto. La motivación y las consecuencias relevantes pertenecen al cuerpo del commit, al PR o al ADR.

## 4. Reglas técnicas

- La UI no usa un framework: se implementa con módulos ES, JavaScript y TypeScript gradual sobre Vite.
- Una conversión a TypeScript debe reducir un riesgo real y conservar comportamiento; no se migra un módulo solo para aumentar una métrica.
- Los componentes se agrupan por feature según [ADR-007](./docs/adr/ADR-007-organizacion-componentes-por-feature.md).
- La presentación no ejecuta SQL. Persistencia y migraciones permanecen en `src/services/sqlite/`.
- Las funcionalidades principales deben operar sin red. Ningún dato se transmite automáticamente; el usuario puede iniciar de forma explícita la exportación y compartición de un backup.
- Las APIs nativas se aíslan mediante servicios/adaptadores y deben ofrecer dependencias reemplazables cuando el flujo requiera pruebas deterministas.
- No se agrega una dependencia sin justificar costo, seguridad, mantenimiento y comportamiento offline.

## 5. Verificación

Para un cambio completo, ejecutar:

```bash
npm run verify
```

Para documentación pura, como mínimo:

```bash
npm run check:docs
npm run check:traceability
```

Los cambios Android o de persistencia requieren además pruebas en el entorno correspondiente y evidencia en los checklists de gestión. Un test web no sustituye una validación nativa cuando intervienen SQLite, Filesystem, Network o Share.

## 6. Pull Request

Antes de abrir o fusionar un PR, comprobar:

- [ ] El alcance está trazado a RF, HU, ADR o deuda documentada cuando corresponde.
- [ ] Los cambios de comportamiento tienen pruebas o una justificación explícita de la evidencia manual.
- [ ] `npm run verify` pasa, o el PR registra con precisión cualquier limitación del entorno.
- [ ] La documentación y el changelog reflejan únicamente cambios reales.
- [ ] No se incorporaron datos personales, secretos ni artefactos generados por accidente.
- [ ] El título sigue Conventional Commits.

---

*Lumapse: Tus notas. En tu equipo. Sin cuenta. Sin internet.*
