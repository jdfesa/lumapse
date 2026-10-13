// Inventario de nombres calculados por Chromium, no cálculo propio de AccName.
const RELEVANT_ROLES = new Set([
  'button', 'menuitem', 'textbox', 'combobox', 'checkbox', 'radio',
  'option', 'link', 'listbox', 'tab', 'image', 'slider', 'spinbutton',
])

export function collectAccessibleNameRows(nodes, root) {
  const dom = new Map()
  function visit(node) {
    dom.set(node.backendNodeId, node)
    for (const child of node.children || []) visit(child)
    for (const child of node.shadowRoots || []) visit(child)
    if (node.contentDocument) visit(node.contentDocument)
  }
  visit(root)
  return nodes.filter(node => !node.ignored && RELEVANT_ROLES.has(node.role?.value)).map(node => {
    const element = dom.get(node.backendDOMNodeId)
    if (!element) throw new Error(`Nodo AX sin correspondencia DOM: ${node.backendDOMNodeId}`)
    const attributes = {}
    for (let i = 0; i < (element.attributes || []).length; i += 2) {
      attributes[element.attributes[i]] = element.attributes[i + 1]
    }
    const name = String(node.name?.value || '').trim()
    return {
      role: node.role.value,
      name,
      tag: element.nodeName.toLowerCase(),
      id: attributes.id || '',
      classes: attributes.class || '',
      ariaLabel: attributes['aria-label'] || '',
      title: attributes.title || '',
      alt: attributes.alt ?? null,
      missingName: !name,
      // Un símbolo no basta para describir una acción, aunque no esté vacío.
      symbolOnly: /^[+×✕✓−-]$/.test(name),
    }
  })
}
