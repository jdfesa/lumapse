// =============================================================
// ShareNoteService — Portabilidad local de nota individual
// Hito 05: Testing, calidad y distribucion
//
// Responsabilidad: preparar y compartir una nota individual como
// Markdown sin introducir sincronizacion ni backup completo.
// =============================================================

function sanitizeFileName(value) {
  const normalized = (value || 'nota-lumapse')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'nota-lumapse'
}

export function getShareTitle(note) {
  return note?.title && note.title !== 'Sin título'
    ? note.title
    : 'Nota Lumapse'
}

export function getShareFileName(note) {
  return `${sanitizeFileName(getShareTitle(note))}.md`
}

export function getShareContent(note) {
  return note?.content || ''
}

export async function shareNoteAsMarkdown(note, navigatorApi = globalThis.navigator) {
  const title = getShareTitle(note)
  const content = getShareContent(note)
  const filename = getShareFileName(note)

  if (!content.trim()) {
    throw new Error('La nota no tiene contenido para compartir.')
  }

  if (typeof globalThis.File !== 'undefined' && navigatorApi?.share) {
    const file = new globalThis.File([content], filename, { type: 'text/markdown' })
    if (!navigatorApi.canShare || navigatorApi.canShare({ files: [file] })) {
      await navigatorApi.share({
        title,
        text: title,
        files: [file],
      })
      return 'shared'
    }
  }

  if (navigatorApi?.share) {
    await navigatorApi.share({
      title,
      text: content,
    })
    return 'shared'
  }

  if (navigatorApi?.clipboard?.writeText) {
    await navigatorApi.clipboard.writeText(content)
    return 'copied'
  }

  throw new Error('No hay un mecanismo disponible para compartir esta nota.')
}
