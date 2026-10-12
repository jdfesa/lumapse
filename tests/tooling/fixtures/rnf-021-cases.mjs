export const cases = []
const add = (id, cls, container='', attributes='') => cases.push({id,html:`<div class="${container}"><span data-contrast-case="${id}" class="${cls}" ${attributes}>Texto de prueba</span></div>`})
for (const cls of ['composer__draft-status','composer__title-input','composer__textarea']) add(cls,cls,'composer')
add('format-button','composer__tool-btn composer__format-btn','composer')
add('save','composer__save-btn','composer')
add('save-hover','composer__save-btn','composer','data-hover')
add('discard','composer__discard-btn','composer')
add('discard-hover','composer__discard-btn','composer','data-hover')
for (const cls of ['drawer__subject-form-btn','drawer__subject-form-btn--primary','drawer__subject-btn--archived','drawer__subject-btn--archive-context','drawer__ctx-item--danger']) {
 const base=cls.startsWith('drawer__subject-form')?'drawer__subject-form-btn':cls.startsWith('drawer__subject-btn')?'drawer__subject-btn':'drawer__ctx-item'
 add(cls,`${base} ${cls}`,'drawer')
}
add('create-hover','drawer__subject-form-btn drawer__subject-form-btn--primary','drawer','data-hover')
for (const cls of ['dialog__btn--cancel','dialog__btn--confirm','dialog__btn--danger']) {add(cls,`dialog__btn ${cls}`,'dialog');add(cls+'-hover',`dialog__btn ${cls}`,'dialog','data-hover')}
for (const cls of ['academic-event-dialog__char-counter','academic-event-dialog__char-counter--near-limit','academic-event-dialog__helper','academic-event-dialog__label','academic-event-dialog__error','academic-event-dialog__btn--save']) {
 add(cls,`${cls.includes('counter')?'academic-event-dialog__char-counter':cls.includes('btn')?'academic-event-dialog__btn':''} ${cls}`,'academic-event-dialog')
}
add('event-save-hover','academic-event-dialog__btn academic-event-dialog__btn--save','academic-event-dialog','data-hover')
for(const parent of ['heatmap-events-card','upcoming-academic-events']) {
 for(const color of ['#b45309','#dc2626','#2563eb','#15803d']) add(`${parent}-type-${color}`,'academic-event-item__type',parent,`style="--academic-event-color:${color}"`)
 add(parent+'-archived','academic-event-item__subject academic-event-item__subject--archived',parent)
}
for(const cls of ['trash-header__count','trash-header__empty','trash-item__date','trash-item__meta','trash-item__btn']) add(cls,cls,'trash-item')
add('trash-empty-hover','trash-header__empty','trash-item','data-hover')
for(const cls of ['drawer__trash-count','trash-toast__action']) {add(cls,cls,'trash-toast');add(cls+'-hover',cls,'trash-toast','data-hover')}
for(const cls of ['backup-view__button','backup-view__button--secondary','backup-view__result--success','backup-view__result--error','backup-view__message']) {
 add(cls,`${cls.includes('button')?'backup-view__button':cls.includes('result')?'backup-view__result':''} ${cls}`,'backup-view')
}
add('backup-button-hover','backup-view__button','backup-view','data-hover')
for (const color of ['#000000','#ffffff','#818cf8','#f59e0b','#22c55e','#ef4444']) add('subject-'+color,'note-card__subject-badge','note-card',`style="--subject-color:${color}"`)
add('archived-badge','note-card__archived-badge','note-card')
for(const type of ['note','info','todo','important','question','warning','example','quote','tip','success','failure','danger','bug']) {
 cases.push({id:'callout-'+type,html:`<div class="note-card"><div class="note-card__content"><div class="md-callout md-callout--${type}"><div data-contrast-case="callout-${type}" class="md-callout__title">Título</div><p data-contrast-case="callout-${type}-body">Contenido</p></div></div></div>`})
}
for (const cls of ['editor-popup__group','editor-popup__label','editor-popup__hint-key','editor-popup__hint','editor-popup__empty']) add(cls,cls,'editor-popup is-visible')
for (const cls of ['about-view__tagline','about-view__copy','about-view__note']) add(cls,cls,'about-view')
add('filter-hint','feed-filters__hint','feed-filters')
add('empty-copy','feed__empty-copy','feed__empty')
add('calendar-weekday','heatmap-day-header','heatmap-container')
cases.push({id:'quote-code',html:'<div class="note-card"><div class="note-card__content"><blockquote data-contrast-case="blockquote">Cita</blockquote><code data-contrast-case="inline-code">Código</code><a href="#contrast-stage" data-contrast-case="markdown-link">Enlace</a><table><tr><th data-contrast-case="table-heading">Tabla</th><td data-contrast-case="table-cell">Celda</td></tr></table></div></div>'})
for(const kind of ['toast','toast toast--pending-refresh']) add(kind,kind)
