import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { collectAccessibleNameRows } from './fixtures/rnf-022-names.mjs'

const root = { backendNodeId: 1, nodeName: '#document', children: [
  { backendNodeId: 2, nodeName: 'BUTTON', attributes: ['id', 'close', 'title', 'Cerrar'] },
  { backendNodeId: 3, nodeName: 'svg', attributes: [] },
  { backendNodeId: 4, nodeName: 'INPUT', attributes: ['type', 'checkbox'] },
] }
const ax = (id, role, name, ignored = false) => ({ backendDOMNodeId: id, role: {value:role}, name: {value:name}, ignored })

test('RNF-022: usa el nombre calculado, no la presencia del atributo title', () => {
  const [row] = collectAccessibleNameRows([ax(2,'button','')],root)
  assert.equal(row.title,'Cerrar')
  assert.equal(row.missingName,true)
})

test('RNF-022: distingue nombres descriptivos, símbolos y SVG anónimos', () => {
  const rows = collectAccessibleNameRows([ax(2,'button','+'),ax(3,'image',''),ax(4,'checkbox','Leer')],root)
  assert.equal(rows[0].symbolOnly,true)
  assert.equal(rows[1].missingName,true)
  assert.equal(rows[2].missingName,false)
})

test('RNF-022: excluye decoración ignorada y no confunde genéricos con controles', () => {
  assert.deepEqual(collectAccessibleNameRows([ax(3,'image','',true),ax(1,'generic','')],root),[])
})

test('RNF-022: exige correspondencia DOM para no aceptar evidencia incompleta', () => {
  assert.throws(()=>collectAccessibleNameRows([ax(99,'button','Nombre')],root),/sin correspondencia DOM/)
})

test('RNF-022: los SVG propios revisados son decorativos y están ocultos del AX', () => {
  const files = [
    'src/layout/appShell.js', 'src/layout/drawerArchivedSubjects.js',
    'src/layout/drawerSubjectContextMenu.js', 'src/components/academic-events/Heatmap.js',
    'src/components/feed/NoteCardRenderer.js', 'src/components/feed/TrashView.js',
    'src/components/feed/NoteList.js', 'src/components/note-editor/NoteEditorTemplate.js',
  ]
  for (const file of files) {
    const svgTags = readFileSync(new URL(`../../${file}`,import.meta.url),'utf8').match(/<svg\b[^>]*>/g)
    assert.ok(svgTags?.length,file)
    for (const tag of svgTags) assert.match(tag,/\baria-hidden="true"/,file)
  }
})
