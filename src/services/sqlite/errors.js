// =============================================================
// sqlite/errors — Errores tipados de persistencia
// Hito 04: Organización y UX
//
// Responsabilidad: Exponer errores específicos de SQLite para que
// las capas superiores puedan distinguir fallos de persistencia.
// =============================================================

export class DatabaseError extends Error {
  constructor(operation, originalError) {
    const detail = originalError?.message || 'Error desconocido'
    super(`Error en operación "${operation}": ${detail}`)
    this.name = 'DatabaseError'
    this.operation = operation
    this.originalError = originalError
  }
}
