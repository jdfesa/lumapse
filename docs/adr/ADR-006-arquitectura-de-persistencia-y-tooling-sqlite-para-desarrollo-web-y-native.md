# ADR-006: Arquitectura de Persistencia y Tooling SQLite para Web y Android

**Fecha:** 2026-05-20  
**Estado:** Aceptado — validado el 2026-07-15
**Autor:** Jose David Sandoval

## Contexto

Tras el pivote formalizado en [ADR-005](ADR-005-pivote-app-nativa.md), la persistencia debía migrar de IndexedDB a SQLite mediante `@capacitor-community/sqlite`. Al mismo tiempo, el desarrollo cotidiano requería conservar Vite en navegador para iterar sobre UI y ejecutar pruebas sin desplegar cada cambio en Android.

La solución debía cumplir tres condiciones:

1. mantener una API asíncrona común para componentes y store;
2. usar SQLite nativo en Android como persistencia del producto;
3. ofrecer SQLite/WASM en web como soporte de desarrollo, sin convertir ese entorno en el canal principal.

## Decisión

Adoptar una arquitectura de persistencia común para desarrollo web local y ejecución Android.

### Dependencias de plataforma

- `@capacitor-community/sqlite` expone la integración SQLite de Capacitor.
- `sql.js` proporciona el motor SQLite compilado a WebAssembly.
- `jeep-sqlite` integra ese motor durante la ejecución web local.

El asset `sql-wasm.wasm` se copia automáticamente a `public/assets/` mediante scripts de `package.json`; Vite excluye el loader correspondiente del pre-bundling cuando es necesario.

### Módulos especializados

- [`src/services/sqlite/connection.js`](../../src/services/sqlite/connection.js) detecta la plataforma, abre la conexión, crea el esquema, ejecuta migraciones idempotentes y ofrece transacciones compartidas.
- `notes.js`, `subjects.js` y `academicEvents.js` encapsulan el SQL y el mapeo de filas de cada área.
- Los servicios de aplicación validan y normalizan entradas antes de delegar en esos módulos; la UI no ejecuta SQL.
- En web, `connection.js` registra `<jeep-sqlite>`, inicializa el almacén y persiste escrituras mediante `saveToStore`.
- La migración one-time desde IndexedDB legacy (`lumapse-db`) se conserva para instalaciones de desarrollo anteriores al pivote.

### Autoridad de plataforma

SQLite nativo en Android es la persistencia del producto presentado. SQLite/WASM sostiene desarrollo y pruebas de compatibilidad en navegador, pero no convierte la aplicación actual en PWA.

La dependencia `idb` y el antiguo servicio de persistencia fueron retirados; el acceso de compatibilidad a IndexedDB utiliza la API nativa solo durante la migración legacy.

## Consecuencias

**Positivas:**

- La UI y el store no necesitan conocer el mecanismo de conexión de cada plataforma.
- Desarrollo web y Android ejecutan el mismo modelo relacional.
- La división por entidad evita concentrar conexión, migraciones y todo el CRUD en una única clase.
- Las transacciones y migraciones quedan centralizadas.
- El modo web mantiene un ciclo de desarrollo rápido.

**Negativas y riesgos:**

- `sql.js` y `jeep-sqlite` aumentan las dependencias del entorno de desarrollo.
- La simulación web requiere `saveToStore` y no reproduce todas las condiciones de un dispositivo Android.
- Las migraciones residen en una lista idempotente dentro de `connection.js`; cada cambio de esquema obliga a revisar también DDL, DBML y diagramas.
- La compatibilidad con datos IndexedDB anteriores agrega una ruta histórica que debe mantenerse acotada.

## Validación

La arquitectura está operativa en `0.4.8`. El esquema ejecutable en `connection.js` es la fuente de verdad final; su correspondencia con DBML y DDL documentado se valida mediante los scripts del repositorio. La estructura por capas y la clasificación prudente de los módulos de acceso a datos se detallan en [ADR-008](ADR-008-arquitectura-modular-y-patrones.md).
