import { APP_METADATA } from '../../config/appMetadata.js'
import { escapeHtml } from '../feed/NoteCardRenderer.js'
import './AboutView.css'

function renderMetadataItem(label, value) {
  return `
    <div class="about-view__meta-item">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `
}

function renderScopeItem(copy) {
  return `
    <li class="about-view__scope-item">
      <svg class="about-view__scope-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${escapeHtml(copy)}</span>
    </li>
  `
}

export function renderAboutView(metadata = APP_METADATA) {
  return `
    <section class="about-view" aria-labelledby="about-view-title">
      <header class="about-view__header">
        <img class="about-view__logo" src="icons/icon-144x144.png" width="56" height="56" alt="" aria-hidden="true">
        <div class="about-view__identity">
          <p class="about-view__eyebrow">Acerca de</p>
          <h2 id="about-view-title" class="about-view__title">${escapeHtml(metadata.name)}</h2>
          <p class="about-view__tagline">${escapeHtml(metadata.tagline)}</p>
        </div>
      </header>

      <dl class="about-view__meta" aria-label="Datos de la aplicación">
        ${renderMetadataItem('Versión', metadata.version)}
        ${renderMetadataItem('Autor', metadata.author)}
        ${renderMetadataItem('Licencia', metadata.license)}
      </dl>

      <section class="about-view__section" aria-labelledby="about-view-purpose-title">
        <h3 id="about-view-purpose-title" class="about-view__section-title">Propósito</h3>
        <p class="about-view__copy">${escapeHtml(metadata.purpose)}</p>
      </section>

      <section class="about-view__section" aria-labelledby="about-view-scope-title">
        <h3 id="about-view-scope-title" class="about-view__section-title">Alcance actual</h3>
        <ul class="about-view__scope-list">
          ${metadata.scope.map(renderScopeItem).join('')}
        </ul>
      </section>

      <p class="about-view__note">
        Proyecto académico construido con foco en mantenibilidad, pruebas y trazabilidad.
      </p>
    </section>
  `
}
