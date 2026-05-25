// =============================================================
// VirtualFeed — Renderizado windowed del feed
// Hito 04: Organización y UX
//
// Responsabilidad: Mantener en el DOM solo las tarjetas visibles
// del feed, preservando el scroll con spacers.
// =============================================================

const BUFFER_ITEMS = 5
const ESTIMATED_ITEM_HEIGHT = 120

export class VirtualFeed {
  constructor(container, renderCard) {
    this.container = container
    this.renderCard = renderCard
    this.notes = []
    this.heightCache = new Map()
    this.prefixHeights = [0]
    this.frameId = null
    this.lastRange = null
    this.forceRender = false
    this.handleScroll = this.handleScroll.bind(this)

    this.container.classList.add('feed--virtual')
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    window.addEventListener('resize', this.handleScroll)
  }

  setNotes(notes) {
    this.notes = notes
    this.pruneHeightCache()
    this.rebuildPrefixHeights()
    this.forceRender = true
    this.renderWindow()
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleScroll)
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId)
    }
    this.container.classList.remove('feed--virtual')
  }

  handleScroll() {
    if (this.frameId) return
    this.frameId = window.requestAnimationFrame(() => {
      this.frameId = null
      this.renderWindow()
    })
  }

  renderWindow() {
    if (this.notes.length === 0) {
      this.container.innerHTML = ''
      return
    }

    const range = this.getRenderRange()
    if (!this.forceRender && this.isSameRange(range)) return

    const visibleNotes = this.notes.slice(range.start, range.end + 1)
    const cards = visibleNotes.map(note => this.renderCard(note)).join('')
    this.container.innerHTML = `
      <div class="feed__spacer" data-spacer="top" style="height: ${range.topHeight}px"></div>
      <div class="feed__window">${cards}</div>
      <div class="feed__spacer" data-spacer="bottom" style="height: ${range.bottomHeight}px"></div>
    `
    this.lastRange = range
    this.forceRender = false
    this.measureRenderedCards(range.start)
  }

  getRenderRange() {
    const containerTop = this.container.getBoundingClientRect().top + window.scrollY
    const viewportTop = Math.max(0, window.scrollY - containerTop)
    const viewportBottom = viewportTop + window.innerHeight
    const firstVisible = this.findIndexAt(viewportTop)
    const lastVisible = this.findIndexAt(viewportBottom)
    const start = Math.max(0, firstVisible - BUFFER_ITEMS)
    const end = Math.min(this.notes.length - 1, lastVisible + BUFFER_ITEMS)

    return {
      start,
      end,
      topHeight: this.prefixHeights[start],
      bottomHeight: this.prefixHeights[this.notes.length] - this.prefixHeights[end + 1],
    }
  }

  findIndexAt(offset) {
    let low = 0
    let high = this.prefixHeights.length - 1

    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (this.prefixHeights[mid] <= offset) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return Math.min(this.notes.length - 1, Math.max(0, low - 1))
  }

  measureRenderedCards(startIndex) {
    const cards = this.container.querySelectorAll('.note-card')
    const gap = this.getCardGap()
    let changed = false

    cards.forEach((card, offset) => {
      const note = this.notes[startIndex + offset]
      const measuredHeight = card.offsetHeight + gap
      if (note && card.offsetHeight > 0 && this.heightCache.get(note.id) !== measuredHeight) {
        this.heightCache.set(note.id, measuredHeight)
        changed = true
      }
    })

    if (changed) {
      this.rebuildPrefixHeights()
      this.updateSpacerHeights()
    }
  }

  getCardGap() {
    const windowElement = this.container.querySelector('.feed__window')
    const style = window.getComputedStyle(windowElement || this.container)
    return Number.parseFloat(style.rowGap || style.gap) || 0
  }

  getItemHeight(note) {
    return this.heightCache.get(note.id) || ESTIMATED_ITEM_HEIGHT
  }

  rebuildPrefixHeights() {
    this.prefixHeights = [0]
    for (const note of this.notes) {
      this.prefixHeights.push(this.prefixHeights.at(-1) + this.getItemHeight(note))
    }
  }

  updateSpacerHeights() {
    const range = this.getRenderRange()
    this.container.querySelector('[data-spacer="top"]').style.height = `${range.topHeight}px`
    this.container.querySelector('[data-spacer="bottom"]').style.height = `${range.bottomHeight}px`
    this.lastRange = range
  }

  pruneHeightCache() {
    const noteIds = new Set(this.notes.map(note => note.id))
    for (const noteId of this.heightCache.keys()) {
      if (!noteIds.has(noteId)) {
        this.heightCache.delete(noteId)
      }
    }
  }

  isSameRange(range) {
    return this.lastRange?.start === range.start && this.lastRange?.end === range.end
  }
}
