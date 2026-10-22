import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { rgba, over, contrastRatio, measureText, hoverFixtureRules } from './fixtures/rnf-021-contrast.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const declarations = block => Object.fromEntries([...block.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]))
const tokens = read('src/styles/tokens.css')
const dark = declarations(tokens.match(/:root\s*\{([^}]+)\}/)[1])
const light = {...dark, ...declarations(tokens.match(/\[data-theme="light"\]\s*\{([^}]+)\}/)[1])}
const themes = { dark, light }
const value = (v, t) => v.replace(/var\((--[\w-]+)\)/g, (_, key) => {
  assert.ok(t[key], `Token requerido: ${key}`)
  return t[key]
})
function rule(file, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = read(file).match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))
  assert.ok(match, `${file}: ${selector}`)
  return declarations(match[1])
}
function minimum(foreground, background, label) {
  const bg = rgba(background)
  const ratio = contrastRatio(over(rgba(foreground), bg), bg)
  assert.ok(ratio >= 4.5, `${label}: ${ratio}:1 < 4.5:1`)
}

test('contraste sRGB usa pares de referencia y compone alfa antes del ratio', () => {
  assert.equal(contrastRatio(rgba('#ffffff'), rgba('#000000')), 21)
  assert.equal(contrastRatio(rgba('#ffffff'), rgba('#ffffff')), 1)
  assert.ok(Math.abs(contrastRatio(rgba('#0000ff'), rgba('#ffffff')) - 8.5924713584) < 1e-9)
  assert.deepEqual(over(rgba('rgba(255,255,255,0.5)'), rgba('#000000')), [127.5,127.5,127.5,1])
  assert.deepEqual(rgba('color(srgb 1 0.5 0 / 0.2)'), [255,127.5,0,0.2])
  assert.throws(() => rgba('color(display-p3 1 0 0)'), /no soportado/)
  assert.throws(() => contrastRatio(rgba('transparent'), rgba('#000000')), /opacos/)
  const nearLimit = rgba('#777777')
  assert.ok(contrastRatio(nearLimit, rgba('#ffffff')) < 4.5)
})

test('el helper WebView compone opacidad de grupo y rechaza fondos sin resolver', () => {
  const body = {className:'body',parentElement:null}
  const group = {className:'group',parentElement:body}
  const leaf = {className:'leaf',parentElement:group}
  const base = {color:'rgba(255,255,255,0.45)',backgroundColor:'transparent',backgroundImage:'none',filter:'none',opacity:'1'}
  const styles = new Map([
    [body,{...base,backgroundColor:'#191919'}],
    [group,{...base,backgroundColor:'#202020',opacity:'0.7'}],
    [leaf,{...base}],
  ])
  const previous = globalThis.getComputedStyle
  globalThis.getComputedStyle = node => styles.get(node)
  try {
    const result = measureText(leaf)
    const bg = over([32,32,32,0.7],rgba('#191919'))
    const inner = over(rgba(base.color),rgba('#202020'))
    const fg = over([...inner.slice(0,3),0.7],rgba('#191919'))
    assert.deepEqual(result.background,bg)
    assert.deepEqual(result.foreground,fg)
    assert.equal(result.ratio,contrastRatio(fg,bg))
    styles.get(leaf).backgroundImage='linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))'
    assert.throws(() => measureText(leaf), /no uniforme/)
    styles.get(leaf).backgroundImage='none'
    styles.get(body).backgroundColor='transparent'
    styles.get(group).backgroundColor='transparent'
    assert.throws(() => measureText(leaf), /no opaco/)
  } finally {
    if (previous) globalThis.getComputedStyle=previous
    else delete globalThis.getComputedStyle
  }
})

test('el fixture de estado lee selectores aunque CSSStyleRule tenga cssRules vacío', () => {
  assert.deepEqual(hoverFixtureRules([
    {selectorText:'.button:hover:not(:disabled)',style:{cssText:'opacity: 0.9;'},cssRules:[]},
    {cssRules:[{selectorText:'.danger:hover',style:{cssText:'color: black;'},cssRules:[]}]},
    {selectorText:'.static',style:{cssText:'color: white;'},cssRules:[]},
  ]), ['.button[data-hover]:not(:disabled){opacity: 0.9;}','.danger[data-hover]{color: black;}'])
})

test('RNF-021 mantiene texto secundario y acentos sobre superficies de ambos temas', () => {
  for (const [name, t] of Object.entries(themes)) {
    for (const bg of ['--color-bg','--color-surface','--color-surface-hover']) {
      for (const fg of ['--color-text','--color-text-muted','--color-accent','--color-danger']) minimum(t[fg],t[bg],`${name} ${fg}/${bg}`)
    }
    for (const fg of ['--color-accent','--color-danger']) {
      const bg = over(rgba(t[fg+'-dim']),rgba(t['--color-surface']))
      assert.ok(contrastRatio(over(rgba(t[fg]),bg),bg) >= 4.5, `${name} ${fg} sobre tinte`)
    }
  }
})

test('RNF-021 conserva contraste de texto sobre botones rellenos, también con hover', () => {
  for (const [name,t] of Object.entries(themes)) {
    for (const type of ['accent','danger']) {
      const color = rgba(value(`var(--color-on-${type})`, t))
      const fill = rgba(t[`--color-${type}`])
      for (const opacity of [1,0.9,0.85]) {
        const surface = rgba(t['--color-surface'])
        const front = over([...color.slice(0,3),opacity],surface)
        const bg = over([...fill.slice(0,3),opacity],surface)
        assert.ok(contrastRatio(front,bg) >= 4.5,`${name} on-${type} opacidad ${opacity}`)
      }
    }
  }
})

test('RNF-021 conecta los botones rellenos con su texto de contraste específico', () => {
  for (const [file,selector,type] of [
    ['src/components/note-editor/NoteEditor.css','.composer__save-btn','accent'],
    ['src/styles/drawer-subjects.css','.drawer__subject-form-btn--primary','accent'],
    ['src/styles/drawer-subjects.css','.drawer__subject-form-btn--primary:hover','accent'],
    ['src/components/backup/BackupView.css','.backup-view__button','accent'],
    ['src/components/common/ConfirmDialog.css','.dialog__btn--confirm:hover','accent'],
    ['src/components/common/ConfirmDialog.css','.dialog__btn--danger:hover','danger'],
    ['src/components/academic-events/AcademicEventDialog.css','.academic-event-dialog__btn--save:hover:not(:disabled)','accent'],
    ['src/components/academic-events/Heatmap.css','.heatmap-add-event:hover','accent'],
    ['src/components/note-editor/NoteEditor.css','.composer__discard-btn:hover','danger'],
    ['src/components/note-editor/NoteEditor.css','.composer__discard-btn:focus-visible','danger'],
    ['src/components/feed/TrashView.css','.trash-header__count','danger'],
    ['src/components/feed/TrashView.css','.trash-header__empty:hover','danger'],
    ['src/styles/drawer-trash.css','.drawer__trash-count','danger'],
    ['src/styles/drawer-trash.css','.trash-toast__action','danger'],
  ]) assert.equal(rule(file,selector).color,`var(--color-on-${type})`,selector)
})

for (const [name, tokens] of Object.entries(themes)) {
  test(`Agregar fecha conserva contraste al quedar en hover tras cerrar el diálogo (${name})`, () => {
    const hover = rule('src/components/academic-events/Heatmap.css', '.heatmap-add-event:hover')
    minimum(value(hover.color, tokens), value(hover.background, tokens), `Agregar fecha ${name}`)
  })
}

test('RNF-021 evita una segunda reducción de opacidad en metadatos legibles', () => {
  for (const [file,selectors] of [
    ['src/styles/drawer-subjects.css',['.drawer__subject-count','.drawer__subject-btn--archived','.drawer__subject-btn--archive-context']],
    ['src/components/feed/TrashView.css',['.trash-item__date']],
    ['src/components/academic-events/Heatmap.css',['.academic-event-item__subject--archived']],
    ['src/components/academic-events/UpcomingAcademicEvents.css',['.upcoming-academic-events .academic-event-item__subject--archived']],
    ['src/components/academic-events/AcademicEventDialog.css',['.academic-event-dialog__char-counter','.academic-event-dialog__char-counter--near-limit']],
  ]) for (const selector of selectors) assert.equal(Number(rule(file,selector).opacity ?? 1),1,selector)
})

test('RNF-021 independiza texto de materias y tipos del color decorativo elegido', () => {
  for (const [file,selector] of [
    ['src/components/feed/NoteCard.css','.note-card__subject-badge'],
    ['src/components/academic-events/Heatmap.css','.academic-event-item__type'],
    ['src/components/academic-events/UpcomingAcademicEvents.css','.upcoming-academic-events .academic-event-item__type'],
  ]) assert.equal(rule(file,selector).color,'var(--color-text)',selector)
  for (const [name,t] of Object.entries(themes)) for (const color of ['#000000','#ffffff','#818cf8','#f59e0b','#22c55e','#ef4444']) {
    const tint = rgba(color);tint[3]=0.15
    const bg = over(tint,rgba(t['--color-bg']))
    assert.ok(contrastRatio(over(rgba(t['--color-text']),bg),bg)>=4.5,`${name}: materia ${color}`)
  }
})

test('RNF-021 mantiene títulos de callout legibles sin quitar color a sus indicadores', () => {
  assert.equal(rule('src/components/markdown/callout.css','.md-callout__title').color,'var(--color-text-bright)')
  assert.equal(rule('src/components/markdown/callout.css','.md-callout__icon').color,'var(--callout-color)')
})

test('RNF-021 evita el azul por defecto del navegador en enlaces Markdown', () => {
  assert.equal(rule('src/components/markdown/markdown-elements.css',':is(.md-preview__content, .note-card__content) a').color,'var(--color-accent)')
})

test('RNF-021 adapta los mensajes de éxito y error al tema', () => {
  const file = 'src/components/backup/BackupView.css'
  assert.equal(rule(file,'.backup-view__result--success').color,'var(--color-success)')
  assert.equal(rule(file,'.backup-view__result--error').color,'var(--color-danger)')
  assert.equal(rule('src/styles/drawer-subjects.css','.drawer__ctx-item--danger').color,'var(--color-danger)')
  for (const [name,t] of Object.entries(themes)) {
    for (const type of ['success','error']) {
      const r = rule(file,`.backup-view__result--${type}`)
      const bg = over(rgba(value(r['background-color'],t)),rgba(t['--color-bg']))
      assert.ok(contrastRatio(over(rgba(value(r.color,t)),bg),bg)>=4.5,`${name}: resultado ${type}`)
    }
  }
})
