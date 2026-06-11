import { EditorPopup } from './EditorPopup.js';
import { getCommandSnippet, getEditorCommandsForSurface } from './editorCommandRegistry.js';
import { applyInlineCommand } from './editorTextTransforms.js';

export function setupEditorPopups(editor, textarea, composer) {
  const plusBtn = editor.container.querySelector('#composer-plus-btn');
  const formatBtn = editor.container.querySelector('#composer-format-btn');

  editor.plusPopup = new EditorPopup({
    container: composer,
    onSelect: (item) => insertCommandAtCursor(textarea, item),
    onDismiss: () => {},
  });
  bindPopupButton(editor, plusBtn, editor.plusPopup, 'plusMenuWasVisibleOnPointerDown', () => {
    editor.formatPopup?.hide();
    editor.plusPopup.show(getEditorCommandsForSurface('insert'), 'Tambien podes escribir / al inicio de linea');
  });

  editor.formatPopup = new EditorPopup({
    container: composer,
    onSelect: (item) => applyInlineCommand(textarea, item),
    onDismiss: () => {},
  });
  bindPopupButton(editor, formatBtn, editor.formatPopup, 'formatMenuWasVisibleOnPointerDown', () => {
    editor.plusPopup?.hide();
    editor.formatPopup.show(getEditorCommandsForSurface('inline'), 'Selecciona texto o inserta un placeholder');
  });
}

function bindPopupButton(editor, button, popup, visibilityKey, showPopup) {
  button.addEventListener('pointerdown', () => {
    editor[visibilityKey] = popup.isVisible();
  });
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (editor[visibilityKey] || popup.isVisible()) {
      editor[visibilityKey] = false;
      popup.hide();
    } else {
      showPopup();
    }
  });
}

function insertCommandAtCursor(textarea, command) {
  const snippet = getCommandSnippet(command);
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  textarea.value = before + snippet + after;
  const cursorOffset = Number.isInteger(command.cursorOffset)
    ? command.cursorOffset
    : snippet.length;
  const cursor = start + cursorOffset;
  if (command.selectLength) {
    textarea.setSelectionRange(cursor, cursor + command.selectLength);
  } else {
    textarea.setSelectionRange(cursor, cursor);
  }
  textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
  textarea.focus();
}
