export const IMPORT_STATE = Object.freeze({
  IDLE: 'idle',
  READING: 'reading',
  PREVIEW: 'preview',
  IMPORTING: 'importing',
  SUCCESS: 'success',
  ERROR: 'error',
})

export function createInitialImportState() {
  return {
    importStatus: IMPORT_STATE.IDLE,
    importPlan: null,
    importResult: null,
    importFilename: '',
    importErrorMessage: '',
  }
}

function escapeHtml(value) {
  const div = document.createElement('div')
  div.textContent = String(value ?? '')
  return div.innerHTML
}

export function backupItemSummary(counts) {
  if (!counts) return '0 nota(s), 0 materia(s), 0 fecha(s)'

  return `${counts.notes} nota(s), ${counts.subjects} materia(s), ${counts.academicEvents} fecha(s)`
}

export function planImportSummary(plan) {
  if (!plan?.counts) return ''

  return `${plan.counts.notes.importable} nota(s), ${plan.counts.subjects.importable} materia(s), ${plan.counts.academicEvents.importable} fecha(s)`
}

function planSkippedSummary(plan) {
  if (!plan?.counts) return ''

  return `${plan.counts.notes.skipped} nota(s), ${plan.counts.subjects.skipped} materia(s), ${plan.counts.academicEvents.skipped} fecha(s)`
}

function renderImportPreview(state) {
  if (state.importStatus !== IMPORT_STATE.PREVIEW || !state.importPlan) return ''

  const plan = state.importPlan
  const skippedTotal = plan.counts.notes.skipped + plan.counts.subjects.skipped + plan.counts.academicEvents.skipped
  const adjustmentTotal = plan.counts.renamedSubjects + plan.counts.relationshipRepairs

  return `
    <div class="backup-view__import-preview" role="status">
      <p class="backup-view__status-title">Preview listo</p>
      <p class="backup-view__message">${escapeHtml(state.importFilename || 'backup.zip')}</p>
      <p class="backup-view__meta">Importará: ${planImportSummary(plan)}</p>
      ${skippedTotal > 0 ? `<p class="backup-view__meta">Omitirá duplicados: ${planSkippedSummary(plan)}</p>` : ''}
      ${adjustmentTotal > 0 ? `<p class="backup-view__meta">Ajustes: ${plan.counts.renamedSubjects} nombre(s), ${plan.counts.relationshipRepairs} relación(es)</p>` : ''}
      ${plan.warnings.length > 0 ? `<p class="backup-view__meta">Avisos: ${plan.warnings.length}</p>` : ''}
    </div>
  `
}

function renderImportResult(state) {
  if (state.importStatus === IMPORT_STATE.SUCCESS && state.importResult) {
    return `
      <p class="backup-view__result backup-view__result--success">
        Importación completada: ${backupItemSummary(state.importResult.imported)}.
      </p>
    `
  }

  if (state.importStatus === IMPORT_STATE.ERROR) {
    return `
      <p class="backup-view__result backup-view__result--error">
        ${escapeHtml(state.importErrorMessage || 'No se pudo importar el ZIP.')}
      </p>
    `
  }

  return ''
}

function renderImportIcon() {
  return `
    <svg class="backup-view__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3v12"></path>
      <path d="m7 10 5 5 5-5"></path>
      <path d="M5 21h14"></path>
    </svg>
  `
}

export function renderImportPanel(state) {
  const reading = state.importStatus === IMPORT_STATE.READING
  const importing = state.importStatus === IMPORT_STATE.IMPORTING
  const busy = reading || importing
  const hasPreview = state.importStatus === IMPORT_STATE.PREVIEW && state.importPlan

  return `
    <section class="backup-view__panel backup-view__panel--import">
      <div class="backup-view__header">
        ${renderImportIcon()}
        <div class="backup-view__heading">
          <p class="backup-view__eyebrow">ZIP Lumapse</p>
          <h2 class="backup-view__title">Importar ZIP</h2>
        </div>
      </div>
      <div class="backup-view__import">
        <input class="js-backup-import-input" type="file" accept=".zip,application/zip,application/x-zip-compressed" hidden>
        <div class="backup-view__import-copy">
          <p class="backup-view__status-title">Importar ZIP</p>
          <p class="backup-view__message">Seleccioná un ZIP compatible generado por Lumapse.</p>
        </div>
        ${renderImportPreview(state)}
        <div class="backup-view__actions">
          <button class="backup-view__button backup-view__button--secondary js-btn-select-import" type="button" aria-label="Seleccionar ZIP" title="Seleccionar ZIP" ${busy ? 'disabled' : ''}>
            ${reading ? 'Leyendo ZIP...' : 'Seleccionar ZIP'}
          </button>
          ${hasPreview ? `
            <button class="backup-view__button js-btn-confirm-import" type="button" aria-label="Importar ZIP" title="Importar ZIP" ${busy ? 'disabled' : ''}>
              ${importing ? 'Importando ZIP...' : 'Importar ZIP'}
            </button>
            <button class="backup-view__button backup-view__button--secondary js-btn-cancel-import" type="button" aria-label="Cancelar importación" title="Cancelar importación" ${busy ? 'disabled' : ''}>
              Cancelar
            </button>
          ` : ''}
        </div>
        ${renderImportResult(state)}
      </div>
    </section>
  `
}
