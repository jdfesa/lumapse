const SVG_ICONS = {
  bullet: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="7" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="6" cy="17" r="1.5"></circle><path d="M10 7h8M10 12h8M10 17h8"></path></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h4v4H4zM4 15h4v4H4zM11 9h8M11 17h8"></path><path d="m5 16.5 1.2 1.2L8 15.5"></path></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18-6-6 6-6M15 6l6 6-6 6"></path></svg>',
  divider: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"></path></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"></path></svg>',
  'numbered-list': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 7h8M10 12h8M10 17h8"></path><path d="M5 6h1v4M4.5 10h2M4 14h3l-2.5 4H7"></path></svg>',
  quote: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H5v5h4v5H4M20 7h-4v5h4v5h-5"></path></svg>',
  table: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 10h16M10 5v14"></path></svg>',
  today: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 8h16M5 5h14v15H5z"></path></svg>',
}

export function renderEditorPopupIcon(iconName = 'text') {
  if (iconName.startsWith('heading-')) {
    return `<span class="editor-popup__icon-text">H${iconName.slice(-1)}</span>`
  }
  if (iconName.startsWith('callout-')) {
    return `<span class="editor-popup__icon-text">${iconName.replace('callout-', '').slice(0, 1).toUpperCase()}</span>`
  }
  if (iconName.startsWith('inline-')) {
    return `<span class="editor-popup__icon-text">${getInlineIconText(iconName)}</span>`
  }
  if (SVG_ICONS[iconName]) return SVG_ICONS[iconName]
  return '<span class="editor-popup__icon-text">T</span>'
}

function getInlineIconText(iconName) {
  const textByIcon = {
    'inline-bold': 'B',
    'inline-italic': 'I',
    'inline-strike': 'S',
    'inline-code': '{}',
    'inline-link': '@',
  }
  return textByIcon[iconName] || 'Aa'
}
