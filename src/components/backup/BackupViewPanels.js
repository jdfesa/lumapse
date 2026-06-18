export const BACKUP_PANEL = Object.freeze({
  EXPORT: 'export',
  IMPORT: 'import',
})

export function normalizeBackupPanel(panel) {
  return panel === BACKUP_PANEL.IMPORT ? BACKUP_PANEL.IMPORT : BACKUP_PANEL.EXPORT
}

export function renderBackupPanelTabs(activePanel) {
  const panel = normalizeBackupPanel(activePanel)

  return `
    <div class="backup-view__tabs" role="tablist" aria-label="Flujo ZIP de respaldo">
      <button class="backup-view__tab js-backup-panel-tab${panel === BACKUP_PANEL.EXPORT ? ' backup-view__tab--active' : ''}" type="button" role="tab" aria-selected="${panel === BACKUP_PANEL.EXPORT}" data-panel="${BACKUP_PANEL.EXPORT}">
        Exportar ZIP
      </button>
      <button class="backup-view__tab js-backup-panel-tab${panel === BACKUP_PANEL.IMPORT ? ' backup-view__tab--active' : ''}" type="button" role="tab" aria-selected="${panel === BACKUP_PANEL.IMPORT}" data-panel="${BACKUP_PANEL.IMPORT}">
        Importar ZIP
      </button>
    </div>
  `
}
