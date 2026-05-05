// =============================================================
// ImportService — Lógica de importación
// Hito 03: MVP Completo
//
// Responsabilidad: Importar archivos .md desde el sistema de
// archivos local del usuario e insertarlos como nuevas notas.
// =============================================================

import { createNote } from '../store/NoteStore.js';

/**
 * Abre un cuadro de diálogo del sistema para seleccionar un archivo .md.
 * Lee el archivo seleccionado y crea una nueva nota en el sistema.
 * 
 * @returns {Promise<boolean>} Promesa que resuelve a true si se importó con éxito, o false si se canceló.
 */
export async function importMarkdownFile() {
  return new Promise((resolve, reject) => {
    // Crear un elemento input de tipo archivo oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md, text/markdown';
    input.style.display = 'none';

    // Manejar el cambio cuando el usuario selecciona un archivo
    input.onchange = async (e) => {
      const file = e.target.files[0];
      
      if (!file) {
        resolve(false);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const content = event.target.result;
          
          // Usar el nombre del archivo sin extensión como título
          const title = file.name.replace(/\.md$/i, '').trim();
          
          // Crear la nota utilizando el Store
          await createNote(title || 'Nota importada', content);
          
          resolve(true);
        } catch (error) {
          console.error('Error al importar la nota:', error);
          reject(new Error('No se pudo guardar la nota importada.'));
        }
      };

      reader.onerror = () => {
        console.error('Error de FileReader:', reader.error);
        reject(new Error('Error al leer el archivo.'));
      };

      // Leer el contenido del archivo como texto
      reader.readAsText(file);
    };

    // Disparar el clic para abrir el diálogo del sistema
    document.body.appendChild(input);
    input.click();
    
    // Limpieza
    document.body.removeChild(input);
  });
}
