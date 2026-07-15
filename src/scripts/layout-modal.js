// src/scripts/layout-modal.js
//
// Ventana de "Disposición de la página": deja elegir cómo se acomodan el
// mapa, el panel lateral y la cuadrícula de transmisores, y qué secciones
// se muestran. Guardar/aplicar la preferencia vive en layout-prefs.js —
// este archivo solo construye la UI y llama a esas funciones.

import { getLayoutPrefs, setArrangement, setSectionVisible } from './layout-prefs.js';
import { showToast } from './toast.js';

const SECTION_LABELS = {
  dashboard: { name: 'Panel de métricas', sub: 'Resumen de KPIs arriba de la página' },
  map: { name: 'Mapa de Chiapas', sub: 'Ubicación geográfica de los transmisores' },
  sidebar: { name: 'Panel lateral', sub: 'Disponibilidad, distribución de estados y bitácora' },
  grid: { name: 'Cuadrícula de transmisores', sub: 'Tarjetas con historial de cada transmisor' },
};

export function openLayoutModal() {
  const overlay = document.getElementById('layout-overlay');
  const content = document.getElementById('layout-modal-content');
  if (!overlay || !content) return;
  render(content);
  overlay.classList.add('open');

  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeLayoutModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

export function closeLayoutModal() {
  document.getElementById('layout-overlay')?.classList.remove('open');
}

function render(content) {
  const prefs = getLayoutPrefs();

  const visibilityRows = Object.entries(SECTION_LABELS).map(([key, label]) => `
    <div class="equip-row" data-layout-row="${key}">
      <div class="equip-name">${label.name}<span class="sub">${label.sub}</span></div>
      <label class="switch">
        <input type="checkbox" ${prefs.visible[key] ? 'checked' : ''} data-layout-visible="${key}">
        <span class="slider"></span>
      </label>
    </div>`).join('');

  content.innerHTML = `
    <div class="detail-header">
      <div><h2>Disposición de la página</h2></div>
      <button class="close-btn" aria-label="Cerrar" id="layout-close-btn">✕</button>
    </div>

    <p class="section-title">Acomodo del mapa y la cuadrícula</p>
    <div class="layout-arrangement-options">
      <button class="layout-arrangement-btn ${prefs.arrangement === 'grid-bottom' ? 'active' : ''}" data-arrangement="grid-bottom">
        <span class="layout-arrangement-preview lp-bottom"><i></i><i></i><i></i></span>
        Cuadrícula abajo
      </button>
      <button class="layout-arrangement-btn ${prefs.arrangement === 'grid-side' ? 'active' : ''}" data-arrangement="grid-side">
        <span class="layout-arrangement-preview lp-side"><i></i><i></i><i></i></span>
        Cuadrícula al lado del mapa
      </button>
    </div>

    <p class="section-title" style="margin-top:18px;">Secciones visibles</p>
    <div>${visibilityRows}</div>

    <p style="font-family:var(--mono); font-size:11px; color:var(--text-dim); margin:14px 0 0; padding:8px 10px; background:var(--surface-2); border:1px solid var(--panel-line); border-radius:5px;">
      Esta preferencia se guarda solo en este navegador — no la ven otras personas que abran el sitio.
    </p>
  `;

  document.getElementById('layout-close-btn').addEventListener('click', closeLayoutModal);

  content.querySelectorAll('[data-arrangement]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setArrangement(btn.dataset.arrangement);
      content.querySelectorAll('[data-arrangement]').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });

  content.querySelectorAll('[data-layout-visible]').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.dataset.layoutVisible;
      const ok = setSectionVisible(key, input.checked);
      if (!ok) {
        input.checked = true; // revertir: no se puede ocultar todo
        showToast('Debe quedar al menos una sección visible', 'error');
      }
    });
  });
}