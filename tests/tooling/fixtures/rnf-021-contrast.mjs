// Helpers de prueba sRGB; no forman parte del runtime de Lumapse.
export function rgba(value) {
  if (value === 'transparent') return [0, 0, 0, 0]
  if (/^#[\da-f]{6}$/i.test(value)) {
    return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16)).concat(1)
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/)
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    if (parts.length === 3) parts.push(1)
    if (parts.length === 4 && parts.every(Number.isFinite)) return parts
  }
  const srgb = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/)
  if (srgb) return srgb.slice(1, 4).map(v => Number(v) * 255).concat(Number(srgb[4] ?? 1))
  throw new Error(`Color no soportado: ${value}`)
}

export function over(front, back) {
  const alpha = front[3] + back[3] * (1 - front[3])
  if (!alpha) return [0, 0, 0, 0]
  return front.slice(0, 3).map((v, i) =>
    (v * front[3] + back[i] * back[3] * (1 - front[3])) / alpha,
  ).concat(alpha)
}

export function contrastRatio(front, back) {
  if (front[3] !== 1 || back[3] !== 1) throw new Error('El ratio requiere colores efectivos opacos')
  const luminance = color => color.slice(0, 3).map(v => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
  const a = luminance(front), b = luminance(back)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

// Se evalúa en el WebView con getComputedStyle, no en DOM simulado.
// No interpreta imágenes, gradientes no uniformes ni filtros: los informa.
export function measureText(element, pseudo = null) {
  const textStyle = getComputedStyle(element, pseudo)
  let foreground = rgba(textStyle.color)
  if (pseudo) foreground[3] *= Number(textStyle.opacity)
  let background = [0, 0, 0, 0]
  const layers = []
  for (let node = element; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    let layer = rgba(style.backgroundColor)
    if (style.backgroundImage !== 'none') {
      const stops = style.backgroundImage.match(/rgba?\([^)]+\)|color\(srgb[^)]+\)/g)
      if (!style.backgroundImage.startsWith('linear-gradient(') || !stops?.length ||
          !stops.every(v => v === stops[0])) throw new Error(`Fondo no uniforme: ${style.backgroundImage}`)
      layer = over(rgba(stops[0]), layer)
    }
    if (style.filter !== 'none') throw new Error(`Filtro no soportado: ${style.filter}`)
    foreground = over(foreground, layer)
    background = over(background, layer)
    const opacity = Number(style.opacity)
    foreground[3] *= opacity
    background[3] *= opacity
    layers.push({class:node.className, background:style.backgroundColor, image:style.backgroundImage,opacity})
  }
  // Fondo del canvas del documento; body aporta el fondo opaco de ambos temas.
  if (background[3] !== 1) throw new Error('Fondo final no opaco')
  return {color:textStyle.color, foreground, background, ratio:contrastRatio(foreground, background),layers}
}
