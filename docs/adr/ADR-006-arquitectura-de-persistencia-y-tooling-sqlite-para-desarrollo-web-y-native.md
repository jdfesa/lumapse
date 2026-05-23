# ADR-006: Arquitectura de Persistencia y Tooling SQLite para Desarrollo Web y Native

**Fecha:** 2026-05-20  
**Estado:** Aceptado  
**Autor:** Jose David Sandoval  

## Contexto

Tras el pivote de arquitectura de PWA a App Móvil Nativa formalizado en [ADR-005](ADR-005-pivote-app-nativa.md), es necesario migrar la persistencia desde IndexedDB a SQLite utilizando el plugin `@capacitor-community/sqlite`.

Sin embargo, el flujo de desarrollo diario de Lumapse se realiza primordialmente en navegadores web (`npm run dev`) para agilizar el diseño, depuración de CSS y tests rápidos. El plugin nativo de SQLite no corre directamente sobre el motor del navegador ordinario sin configuraciones adicionales.

Necesitamos un tooling y diseño de dependencias que:
1. Permita continuar usando el servidor de desarrollo Vite (`npm run dev`) sin cambiar el código de los componentes.
2. Soporte compilación nativa Android sin penalizaciones de tamaño excesivas ni dependencias innecesarias en el binario final.
3. Asegure la persistencia asíncrona robusta en ambos entornos.

## Decisión

Adoptar una arquitectura híbrida de persistencia y automatización de assets para desarrollo local y producción nativa:

1. **Dependencias del Proyecto:**
   - `@capacitor-community/sqlite` como interfaz unificada de persistencia.
   - `sql.js` (WebAssembly de SQLite) para soporte en navegador.
   - `jeep-sqlite` (componente web Stencil) para simular la base de datos en memoria en la web.
   
2. **Automatización de Assets WebAssembly (WASM):**
   - El componente `jeep-sqlite` requiere el motor compilado en WASM (`sql-wasm.wasm`). Para automatizar su copia sin intervención manual, se crearon scripts específicos en `package.json` (`copy-wasm`, `predev`, `prebuild`, `postinstall`) para que el build-tool copie este archivo desde `node_modules/sql.js/dist/sql-wasm.wasm` a `public/assets/sql-wasm.wasm`.
   - Se excluyó `jeep-sqlite/loader` en `vite.config.js` (`optimizeDeps.exclude`) para prevenir errores de pre-bundling en Vite.

3. **Servicio Unificado de Base de Datos (`SqliteService.js`):**
   - En plataformas nativas, consume la base de datos de manera directa y optimizada.
   - En plataforma web, inyecta dinámicamente el componente custom `<jeep-sqlite>` en el DOM, inicializa el almacén web y sincroniza de forma explícita mediante `saveToStore` después de cada operación CRUD de escritura (INSERT, UPDATE, DELETE).
   - Realiza una migración automática asíncrona y transparente desde la IndexedDB legacy (`lumapse-db`) del MVP.

4. **Remoción de Legacy Store:**
   - Desinstalación de la biblioteca `idb` y eliminación del antiguo `NoteService.js`.

## Consecuencias

- **Positivas:**
  - El servidor de desarrollo web local (`npm run dev`) funciona de manera transparente con el mismo motor relacional SQLite (simulado en WebAssembly).
  - La sincronización asíncrona a nivel de base de datos en web (`saveToStore`) evita pérdidas accidentales de datos en recargas del navegador.
  - La migración de IndexedDB a SQLite es automática y no requiere librerías adicionales (hecha con IndexedDB nativo).
  - Clean codebase: los stores y la interfaz no necesitan saber sobre las diferencias de plataforma.
- **Negativas / Riesgos:**
  - Se incrementa ligeramente el tamaño del proyecto local debido a las dependencias de simulación web (`sql.js`, `jeep-sqlite`), aunque estas son eliminadas del APK nativo compilado.
  - La simulación web requiere que las operaciones de persistencia llamen a `saveToStore`, lo que añade un pequeño delay de escritura en disco en navegador (imperceptible para el usuario).
