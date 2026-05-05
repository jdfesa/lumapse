// =============================================================
// Servicio: ExportService
// Hito 03: MVP Completo
//
// Responsabilidad: Manejar la lógica de exportación masiva de notas.
// Exporta todas las notas como un archivo .zip que contiene
// cada nota como un archivo .md separado (RF-017).
// =============================================================

import JSZip from 'jszip';
import { getAllNotes } from './NoteService.js';

/**
 * RF-017: Exportar todas las notas como .zip
 * Obtiene todas las notas de la base de datos, las añade a un
 * archivo zip usando JSZip y dispara la descarga en el navegador.
 */
export async function exportAllNotesToZip() {
  const notes = await getAllNotes();
  
  if (!notes || notes.length === 0) {
    throw new Error('No hay notas para exportar.');
  }

  const zip = new JSZip();
  // Crear una carpeta principal dentro del zip para mayor orden
  const folder = zip.folder('lumapse-backup');

  // Mantener un registro de los nombres de archivo generados
  // para evitar colisiones si dos notas se llaman igual
  const filenames = new Set();

  notes.forEach(note => {
    // 1. Obtener la fecha en formato YYYY-MM-DD
    const dateStr = note.createdAt ? note.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];

    // 2. Sanitizar el título para usarlo como nombre de archivo
    const title = note.title === 'Sin título' ? 'nota' : note.title;
    let safeTitle = title.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!safeTitle) safeTitle = 'nota';

    // 3. Manejo de duplicados
    let filename = `${dateStr} - ${safeTitle}.md`;
    let counter = 1;
    while (filenames.has(filename)) {
      filename = `${safeTitle}-${counter}.md`;
      counter++;
    }
    filenames.add(filename);

    // 3. Crear el contenido Markdown (título por defecto si está vacío)
    const content = note.content || `# ${note.title}\n`;
    
    // 4. Agregar archivo al zip
    folder.file(filename, content);
  });

  // 5. Generar el archivo .zip de forma asíncrona
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // 6. Disparar la descarga en el navegador
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  
  // Generar nombre del zip con fecha actual: lumapse-backup-2026-05-05.zip
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `lumapse-backup-${dateStr}.zip`;
  
  document.body.appendChild(a);
  a.click();
  
  // 7. Limpieza
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
