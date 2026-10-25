// Toda interacción pertenece al manual local. No accede al teléfono ni a notas reales.
(() => {
  const scenes = window.MANUAL_FIGURE.scenes
  const follow = window.MANUAL_FIGURE.follow
  const targetFor = window.MANUAL_FIGURE.targetFor
  const gestureAt = window.MANUAL_FIGURE.gestureAt
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const themeMedia = matchMedia('(prefers-color-scheme: dark)')
  const root = document.documentElement
  const themeButton = document.querySelector('[data-theme-toggle]')
  const forcedTheme = root.dataset.initialTheme
  let explicitTheme = Boolean(forcedTheme)
  function setTheme(theme) {
    root.dataset.theme = theme
    document.querySelectorAll('.iso').forEach(el => el.dataset.theme = theme)
    themeButton.setAttribute('aria-label', theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro')
    themeButton.textContent = theme === 'light' ? '☾' : '☀'
  }
  setTheme(forcedTheme || (themeMedia.matches ? 'dark' : 'light'))
  themeButton.addEventListener('click', () => { explicitTheme = true; setTheme(root.dataset.theme === 'light' ? 'dark' : 'light') })
  themeMedia.addEventListener('change', event => { if (!explicitTheme) setTheme(event.matches ? 'dark' : 'light') })

  const figure = document.querySelector('[data-figure]')
  const partsRoot = figure.querySelector('[data-parts]')
  const parts = [...partsRoot.children].map(node => ({ node, key: +node.dataset.key, lift: +node.dataset.lift, dx: +node.dataset.dx, dy: +node.dataset.dy, piece: node.dataset.piece }))
  const buttons = [...document.querySelectorAll('[data-scene]')]
  const readout = document.querySelector('[data-readout]')
  const sceneTitle = document.querySelector('[data-scene-title]')
  const sceneCopy = document.querySelector('[data-scene-copy]')
  const tourButton = document.querySelector('[data-tour]')
  const inkClip = figure.querySelector('[data-ink-clip]')
  const dateRing = figure.querySelector('[data-date-ring]')
  let scene = 0, frame = 0, last = 0, age = 0, visible = false, timer = 0, touring = !motion.matches, paused = false
  const values = { organizar: 0, copias: 0, trazo: 0 }
  let order = parts.map(p => p.node.dataset.name).join('|')
  function draw() {
    const gesture = gestureAt(scene, age, motion.matches)
    values.trazo = gesture.writing
    inkClip.setAttribute('width', window.MANUAL_FIGURE.writeTravel * gesture.writing)
    dateRing.setAttribute('stroke-dashoffset', 1 - gesture.date)
    dateRing.style.opacity = scene === 2 ? 1 : .2
    figure.dataset.writing = gesture.writing.toFixed(3)
    figure.dataset.dateMark = gesture.date.toFixed(3)
    readout.textContent = gesture.active ? (scene === 0 ? 'Escribiendo una idea…' : 'Señalá un día en el calendario…') : scenes[scene].readout
    for (const part of parts) {
      const share = values[part.piece] || 0
      part.node.setAttribute('transform', `translate(${part.dx * share} ${part.dy * share})`)
    }
    const sorted = parts.toSorted((a, b) => a.key + a.lift * (values[a.piece] || 0) - b.key - b.lift * (values[b.piece] || 0))
    const nextOrder = sorted.map(p => p.node.dataset.name).join('|')
    if (nextOrder !== order) { const fragment = document.createDocumentFragment(); sorted.forEach(p => fragment.append(p.node)); partsRoot.append(fragment); order = nextOrder }
    figure.dataset.scene = scenes[scene].id
    figure.dataset.motion = frame ? 'running' : 'settled'
  }
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60
    last = now
    age += dt
    const targets = targetFor(scene)
    let moving = false
    for (const key of Object.keys(targets)) { values[key] = follow(values[key], targets[key], dt, motion.matches); moving ||= values[key] !== targets[key] }
    moving ||= gestureAt(scene, age, motion.matches).active
    draw()
    frame = moving && visible && !document.hidden && !paused ? requestAnimationFrame(tick) : 0
    if (!frame) figure.dataset.motion = 'settled'
  }
  function run() { if (!frame && visible && !document.hidden && !paused) { last = 0; figure.dataset.motion = 'running'; frame = requestAnimationFrame(tick) } }
  function tourText() {
    tourButton.disabled = motion.matches
    tourButton.textContent = motion.matches ? 'Sin movimiento' : touring ? 'Ⅱ Pausar recorrido' : '▷ Ver recorrido'
    tourButton.setAttribute('aria-pressed', String(touring))
  }
  function schedule() {
    clearTimeout(timer)
    if (touring && visible && !document.hidden && !motion.matches) timer = setTimeout(() => { select((scene + 1) % scenes.length, false); schedule() }, window.MANUAL_FIGURE.tourMilliseconds)
  }
  function select(index, manual = true) {
    scene = Math.max(0, Math.min(3, index))
    age = 0
    paused = false
    if (manual) { touring = false; clearTimeout(timer); tourText() }
    const selected = scenes[scene]
    figure.dataset.scene = selected.id
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === scene)))
    readout.textContent = selected.readout
    sceneTitle.textContent = selected.title
    sceneCopy.textContent = selected.body
    parts.forEach(({ node }) => node.querySelector('.iso-solid')?.toggleAttribute('data-lit', node.dataset.name === selected.highlight))
    draw()
    run()
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i))
    button.addEventListener('keydown', event => {
      const key = event.key
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return
      event.preventDefault()
      const next = key === 'Home' ? 0 : key === 'End' ? 3 : (i + (key === 'ArrowRight' ? 1 : 3)) % 4
      select(next); buttons[next].focus()
    })
  })
  tourButton.addEventListener('click', () => {
    touring = !touring; paused = !touring
    if (paused) { cancelAnimationFrame(frame); frame = 0; figure.dataset.motion = 'paused-user' }
    else run()
    tourText(); schedule()
  })
  new IntersectionObserver(entries => {
    visible = entries.at(-1).isIntersecting
    if (visible) { run(); schedule() } else { cancelAnimationFrame(frame); frame = 0; clearTimeout(timer); figure.dataset.motion = 'paused-offscreen' }
  }, { rootMargin: '30px 0px' }).observe(figure)
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; clearTimeout(timer) } else { run(); schedule() } })
  motion.addEventListener('change', () => { if (motion.matches) { touring = false; clearTimeout(timer); Object.assign(values, targetFor(scene)); draw() } tourText(); run() })
  select(0, false); tourText(); draw()

  const galleries = [...document.querySelectorAll('[data-gallery]')]
  galleries.forEach(gallery => {
    const shots = [...gallery.querySelectorAll('.shot')]
    const tabs = [...gallery.querySelectorAll('[data-shot]')]
    tabs.forEach((tab, i) => tab.addEventListener('click', () => { shots.forEach((shot, j) => shot.classList.toggle('is-current', i === j)); tabs.forEach((t, j) => t.setAttribute('aria-pressed', String(i === j))) }))
  })
  const dialog = document.querySelector('[data-image-dialog]')
  const dialogImage = dialog.querySelector('img')
  let returnTo = null
  document.querySelectorAll('.shot a').forEach(link => link.addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function') return
    event.preventDefault(); returnTo = link
    const image = link.querySelector('img')
    dialogImage.src = image.src; dialogImage.alt = image.alt
    dialog.querySelector('[data-dialog-title]').textContent = link.closest('figure').querySelector('figcaption').textContent
    dialog.querySelector('.original').href = image.src
    dialog.showModal()
  }))
  dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => returnTo?.focus({ preventScroll: true }))
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close() } })

  const input = document.querySelector('[data-search]')
  const clear = document.querySelector('[data-search-clear]')
  const chapters = [...document.querySelectorAll('.chapter')]
  const noResults = document.querySelector('[data-no-results]')
  const status = document.querySelector('[data-search-status]')
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  function filter() {
    const query = normalize(input.value)
    let count = 0
    chapters.forEach(chapter => { const show = !query || normalize(chapter.textContent).includes(query); chapter.hidden = !show; if (show) count++ })
    noResults.hidden = count > 0
    clear.hidden = !query
    status.hidden = !query
    status.textContent = query ? `${count} ${count === 1 ? 'apartado coincide' : 'apartados coinciden'} con tu búsqueda.` : ''
  }
  input.addEventListener('input', filter)
  clear.addEventListener('click', () => { input.value = ''; filter(); input.focus() })
  input.addEventListener('keydown', event => { if (event.key === 'Escape') { input.value = ''; filter() } })
  document.querySelectorAll('[data-reset-search]').forEach(button => button.addEventListener('click', () => { input.value = ''; filter(); input.focus() }))
  document.querySelectorAll('a[href^="#paso-"]').forEach(link => link.addEventListener('click', () => { input.value = ''; filter() }))
  const links = [...document.querySelectorAll('.side-nav a[href^="#paso-"]')]
  const progress = document.querySelector('[data-progress]')
  const progressLabel = document.querySelector('[data-progress-label]')
  function updateReading() {
    let current = chapters.findIndex(chapter => !chapter.hidden && chapter.getBoundingClientRect().bottom > 150)
    if (current < 0) current = 3
    links.forEach((link, i) => { if (i === current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current') })
    const percent = Math.max(0, Math.min(100, (scrollY - document.querySelector('#guia').offsetTop) / Math.max(1, document.documentElement.scrollHeight - innerHeight - document.querySelector('#guia').offsetTop) * 100))
    progress.style.width = `${percent}%`
    progressLabel.textContent = `Apartado ${current + 1} de 4`
  }
  let readingFrame = 0
  addEventListener('scroll', () => { if (!readingFrame) readingFrame = requestAnimationFrame(() => { readingFrame = 0; updateReading() }) }, { passive: true })
  addEventListener('resize', updateReading)
  updateReading()
  document.documentElement.classList.add('js')
})()
