const TASK_LIST_LINE_REGEX = /^(\s*)([-*+])\s+\[[ xX]\]\s+(.*)$/;
const BULLETED_LIST_LINE_REGEX = /^(\s*)([-*+]\s+)(.*)$/;
const NUMBERED_LIST_LINE_REGEX = /^(\s*)(\d+)([.)]\s+)(.*)$/;
const BLOCKQUOTE_LINE_REGEX = /^(\s*>\s?)(.*)$/;

export function getMarkdownContinuation(currentLine) {
  const taskMatch = currentLine.match(TASK_LIST_LINE_REGEX);
  if (taskMatch) {
    return { prefix: `${taskMatch[1]}${taskMatch[2]} [ ] `, text: taskMatch[3] };
  }

  const bulletMatch = currentLine.match(BULLETED_LIST_LINE_REGEX);
  if (bulletMatch) {
    return { prefix: `${bulletMatch[1]}${bulletMatch[2]}`, text: bulletMatch[3] };
  }

  const numberedMatch = currentLine.match(NUMBERED_LIST_LINE_REGEX);
  if (numberedMatch) {
    const nextNumber = Number.parseInt(numberedMatch[2], 10) + 1;
    return { prefix: `${numberedMatch[1]}${nextNumber}${numberedMatch[3]}`, text: numberedMatch[4] };
  }

  const blockquoteMatch = currentLine.match(BLOCKQUOTE_LINE_REGEX);
  if (blockquoteMatch) {
    return { prefix: blockquoteMatch[1].trimEnd() + ' ', text: blockquoteMatch[2] };
  }

  return null;
}

export function applyInlineCommand(textarea, command) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const text = selectedText || command.placeholder || 'texto';
  const beforeMarker = command.before || '';
  const afterMarker = command.after || '';
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  textarea.value = before + beforeMarker + text + afterMarker + after;

  if (command.selectTarget === 'url' && selectedText) {
    const urlStart = start + beforeMarker.length + text.length + 2;
    textarea.setSelectionRange(urlStart, urlStart + 3);
  } else {
    const selectionStart = start + beforeMarker.length;
    textarea.setSelectionRange(selectionStart, selectionStart + text.length);
  }

  textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
  textarea.focus();
}
