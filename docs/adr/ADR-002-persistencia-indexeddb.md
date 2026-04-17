# ADR-002: Estrategia de Persistencia Offline (IndexedDB)

**Fecha:** 2026-05-01  
**Estado:** Aceptado  
**Autores:** Jose David Sandoval

---

## Contexto

Lumapse es una aplicación offline-first: el usuario debe poder crear y acceder a sus notas sin conexión a internet en todo momento. Era necesario decidir dónde y cómo persistir los datos en el cliente.

## Opciones consideradas

| Mecanismo | Capacidad | Tipo | Transaccional | API |
|---|---|---|---|---|
| `localStorage` | ~5 MB | Síncrono | No | Simple |
| `sessionStorage` | ~5 MB | Síncrono | No | Simple |
| **IndexedDB** | Cientos de MB | Asíncrono | Sí | Compleja (se simplifica con `idb`) |
| Cache API | Variable | Asíncrono | No | Para assets/responses |
| OPFS | Variable | Asíncrono | No | Experimental |

## Decisión

**IndexedDB** con la librería [`idb`](https://github.com/jakearchibald/idb) (wrapper Promise-based de la API nativa).

IndexedDB es el único mecanismo de almacenamiento en el browser que ofrece: alta capacidad de datos, operaciones transaccionales, queries sobre índices, y persistencia garantizada. Es el estándar recomendado para aplicaciones offline-first.

La librería `idb` simplifica la API sin agregar abstracción innecesaria.

## Consecuencias

**Positivas:**
- Capacidad de almacenamiento muy superior a localStorage
- Soporte para múltiples object stores (notas, etiquetas, configuración)
- API transaccional previene corrupción de datos
- Permite consultas por índice (búsqueda por título, fecha, etiqueta)
- Estándar respaldado por todos los navegadores modernos

**Negativas:**
- API asíncrona requiere manejo de Promises/async-await
- Debugging menos inmediato que localStorage (se usa Chrome DevTools → Application)
- Requiere definir schema de base de datos y manejar migraciones (versionado)

## Schema inicial

```
Database: lumapse-db (version 1)
  ├── notes (object store)
  │   ├── id: string (uuid, keyPath)
  │   ├── title: string
  │   ├── content: string (Markdown raw)
  │   ├── createdAt: Date
  │   ├── updatedAt: Date
  │   └── tags: string[]
  └── settings (object store)
      └── key/value pairs de configuración de usuario
```

## Revisión

Este ADR se revisa al inicio del Hito 02 cuando se implemente el servicio de notas.
