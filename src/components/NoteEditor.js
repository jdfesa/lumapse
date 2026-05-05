// =============================================================
// Componente: NoteEditor
// Hito 04: Organización y UX
//
// Responsabilidad: Renderizar la nota activa y permitir su edición.
// Detectar cambios en tiempo real, guardarlos en IndexedDB vía Store
// (Auto-guardado) y mostrar una vista previa de Markdown en vivo.
//
// DP-001: Título unificado — El título de la nota se extrae
// automáticamente de la primera línea que comience con "# "
// en el contenido Markdown (estilo Typora). No existe un campo
// de título separado.
//
// Integra: MarkdownPreview (RF-010)
// =============================================================

import * as NoteStore from '../store/NoteStore.js';
import { MarkdownPreview } from './MarkdownPreview.js';
import './NoteEditor.css';

/**
 * Extrae el título de un texto Markdown.
 * Busca la primera línea que comience con "# " y retorna el texto
 * que le sigue. Si no hay ninguna línea con ese patrón, retorna
 * 'Sin título'.
 *
 * @param {string} content Contenido Markdown completo
 * @returns {string} Título extraído o 'Sin título'
 */
function extractTitleFromContent(content) {
  if (!content) return 'Sin título';

  // Buscar la primera línea que empiece con "# " (h1 de Markdown)
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      const title = trimmed.slice(2).trim();
      return title || 'Sin título';
    }
  }

  return 'Sin título';
}

export class NoteEditor {
  constructor(container) {
    this.container = container;
    this.currentNoteId = null;
    this.saveTimeout = null;
    this.preview = null; // Instancia de MarkdownPreview
    this.viewMode = 'split'; // Modos: 'edit', 'split', 'read'
    
    // Bind manual para mantener el contexto de 'this'
    this.handleInput = this.handleInput.bind(this);
    
    // Suscribirse a cambios en el Store
    this.unsubscribe = NoteStore.subscribe((state) => {
      this.onStateChange(state);
    });
  }

  /**
   * Responde a cambios de estado en la aplicación.
   */
  onStateChange(state) {
    const { activeNoteId, notes } = state;
    
    // 1. Estado vacío: si no hay nota seleccionada
    if (!activeNoteId) {
      this.currentNoteId = null;
      this.renderEmpty();
      return;
    }

    // 2. Cambio de nota seleccionada: si el ID es diferente, re-renderizamos todo
    if (this.currentNoteId !== activeNoteId) {
      this.currentNoteId = activeNoteId;
      const activeNote = notes.find(n => n.id === activeNoteId);
      if (activeNote) {
        this.renderEditor(activeNote);
      }
    }
    
    // Nota: Si el ID activo es el mismo que currentNoteId, NO re-renderizamos.
    // Esto es crucial para no perder el foco o la posición del cursor mientras
    // el usuario está escribiendo y se disparan actualizaciones.
  }

  /**
   * Renderiza el estado vacío cuando no hay nada seleccionado.
   */
  renderEmpty() {
    // Limpiar la instancia de preview si existe
    if (this.preview) {
      this.preview.destroy();
      this.preview = null;
    }

    this.container.innerHTML = `
      <div class="note-editor note-editor--empty">
        <p>Selecciona una nota del listado o presiona <strong>+</strong> para crear una nueva.</p>
      </div>
    `;
  }

  /**
   * DP-001: Renderiza el editor sin campo de título separado.
   * El contenido Markdown ocupa todo el espacio y el título se
   * extrae automáticamente de la primera línea "# ".
   */
  renderEditor(note) {
    this.container.innerHTML = `
      <div class="note-editor">
        <header class="note-editor__header">
          <div class="note-editor__actions">
            <div class="note-editor__view-toggles">
              <button class="view-btn ${this.viewMode === 'edit' ? 'active' : ''}" data-view="edit" title="Modo Edición">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="view-btn ${this.viewMode === 'split' ? 'active' : ''}" data-view="split" title="Modo Dividido">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>
              </button>
              <button class="view-btn ${this.viewMode === 'read' ? 'active' : ''}" data-view="read" title="Modo Lectura">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </button>
            </div>
            <button id="btn-export-md" class="note-editor__export-btn" aria-label="Exportar a Markdown" title="Exportar a Markdown">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button id="btn-delete-note" class="note-editor__delete-btn" aria-label="Eliminar nota" title="Eliminar nota">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </header>
        <div class="note-editor__body view-${this.viewMode}">
          <textarea 
            id="editor-content" 
            class="note-editor__content" 
            placeholder="# Título de tu nota&#10;&#10;Empieza a escribir en Markdown..."
          >${note.content || ''}</textarea>
          <div id="preview-container" class="note-editor__preview-container"></div>
        </div>
      </div>
    `;

    // Adjuntar manejadores de eventos
    const contentInput = this.container.querySelector('#editor-content');
    const deleteBtn = this.container.querySelector('#btn-delete-note');
    const exportBtn = this.container.querySelector('#btn-export-md');

    contentInput.addEventListener('input', this.handleInput);
    
    // Configurar toggle de vistas
    const viewBtns = this.container.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setViewMode(e.currentTarget.dataset.view);
      });
    });
    
    // HU-003: Confirmación al eliminar
    deleteBtn.addEventListener('click', async () => {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta nota de forma permanente?')) {
        await NoteStore.deleteNote(this.currentNoteId);
      }
    });

    // RF-016: Exportar nota actual como Markdown
    exportBtn.addEventListener('click', () => {
      // Leer el estado actual del contenido directamente del DOM
      const textarea = this.container.querySelector('#editor-content');
      const currentContent = textarea ? textarea.value : '';

      // Validar que haya contenido significativo para exportar
      const trimmedContent = currentContent.replace(/^#\s*/, '').trim();
      if (!trimmedContent) {
        alert('La nota está vacía. Escribí algo antes de exportar.');
        return;
      }

      const currentTitle = extractTitleFromContent(currentContent);
      this.exportToMarkdown({ ...note, title: currentTitle, content: currentContent });
    });

    // Instanciar el MarkdownPreview en su contenedor
    const previewContainer = this.container.querySelector('#preview-container');
    this.preview = new MarkdownPreview(previewContainer);

    // Renderizar el preview con el contenido actual de la nota
    if (note.content) {
      this.preview.update(note.content);
    }

    // UX: Poner foco en el textarea al abrir la nota
    contentInput.focus();

    // Si la nota está vacía (recién creada), el cursor ya está
    // al inicio, listo para que el usuario escriba "# Título"
  }

  /**
   * Cambia el modo de vista actual (edit, split, read)
   */
  setViewMode(mode) {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    
    // Actualizar clases de los botones
    const viewBtns = this.container.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      if (btn.dataset.view === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar clase del contenedor principal del body
    const bodyContainer = this.container.querySelector('.note-editor__body');
    if (bodyContainer) {
      bodyContainer.className = `note-editor__body view-${mode}`;
    }
  }

  /**
   * RF-016: Exportar la nota actual como archivo .md
   */
  exportToMarkdown(note) {
    if (!note) return;
    
    // Obtener la fecha en formato YYYY-MM-DD
    const dateStr = note.createdAt ? note.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
    
    const title = note.title === 'Sin título' ? 'nota' : note.title;
    // Sanitizar nombre del archivo
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Formato de archivo: YYYY-MM-DD - titulo.md
    const filename = `${dateStr} - ${safeTitle || 'nota'}.md`;
    
    // Crear el Blob con el contenido en Markdown
    const content = note.content || `# ${note.title}\n`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    
    // Crear un elemento <a> para disparar la descarga
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  /**
   * DP-001: Maneja el evento de escritura en el textarea.
   * Extrae el título de la primera línea "# " del contenido
   * y lo guarda como campo derivado en la base de datos.
   * También actualiza el preview de Markdown en tiempo real.
   */
  handleInput() {
    const contentInput = this.container.querySelector('#editor-content');

    // Actualizar el preview en tiempo real (sin debounce, es instantáneo)
    if (this.preview && contentInput) {
      this.preview.update(contentInput.value);
    }

    // Debounce para el auto-guardado en IndexedDB
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // HU-005: Auto-guardado automático tras inactividad
    this.saveTimeout = setTimeout(async () => {
      if (!this.currentNoteId) return;
      
      const newContent = contentInput.value;
      
      // DP-001: Extraer el título de la primera línea "# " del contenido
      const newTitle = extractTitleFromContent(newContent);
      
      await NoteStore.updateNote(this.currentNoteId, {
        title: newTitle,
        content: newContent
      });
    }, 800); // 800ms de debounce para el auto-guardado
  }

  /**
   * Limpieza al desmontar.
   */
  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    if (this.preview) this.preview.destroy();
    this.container.innerHTML = '';
  }
}
