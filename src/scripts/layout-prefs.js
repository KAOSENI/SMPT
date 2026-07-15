// src/scripts/layout-prefs.js
//
// Controla qué secciones de la página se muestran y cómo se acomodan el
// mapa, el panel lateral y la cuadrícula de transmisores. Se guarda en
// localStorage (ver persist.js) para que la preferencia sobreviva entre
// sesiones, igual que el tema y la configuración de cada transmisor.
//
// La UI que llama a estas funciones vive en layout-modal.js — este archivo
// solo guarda el estado y lo aplica al DOM.

import { loadLayoutPrefs, saveLayoutPrefs } from './persist.js';
import { resizeCardCharts } from './grid.js';

function defaultPrefs() {
  return {
    // 'grid-bottom': mapa + panel lateral arriba, cuadrícula de
    //   transmisores abajo a todo lo ancho (disposición original).
    // 'grid-side': mapa + cuadrícula de transmisores arriba, panel
    //   lateral abajo a todo lo ancho.
    arrangement: 'grid-bottom',
    visible: { dashboard: true, map: true, sidebar: true, grid: true },
  };
}

function normalize(saved) {
  const base = defaultPrefs();
  if (!saved || typeof saved !== 'object') return base;
  return {
    arrangement: saved.arrangement === 'grid-side' ? 'grid-side' : 'grid-bottom',
    visible: {
      dashboard: saved.visible?.dashboard !== false,
      map: saved.visible?.map !== false,
      sidebar: saved.visible?.sidebar !== false,
      grid: saved.visible?.grid !== false,
    },
  };
}

let prefs = normalize(loadLayoutPrefs());

export function getLayoutPrefs() {
  return prefs;
}

export function applyLayout() {
  // Mismo mecanismo que usa el script inline en Layout.astro (que corre
  // antes del primer pintado): atributos en <html>, no estilos inline por
  // elemento. Mantenerlos como única fuente de verdad evita que ambos
  // caminos (carga inicial vs. cambios en vivo desde el modal) se
  // desincronicen entre sí.
  const html = document.documentElement;
  html.setAttribute('data-arrangement', prefs.arrangement);

  const hidden = Object.entries(prefs.visible)
    .filter(([, visible]) => !visible)
    .map(([key]) => key);
  if (hidden.length) html.setAttribute('data-hidden-sections', hidden.join(' '));
  else html.removeAttribute('data-hidden-sections');

  // Los contenedores de las gráficas pudieron cambiar de tamaño al
  // reacomodar la página — ECharts no se reajusta solo ante eso, así que
  // se le pide explícitamente después de que el CSS termine de aplicarse.
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    resizeCardCharts();
  }, 50);
}

export function setArrangement(value) {
  prefs.arrangement = value === 'grid-side' ? 'grid-side' : 'grid-bottom';
  saveLayoutPrefs(prefs);
  applyLayout();
}

// Devuelve false (y no cambia nada) si el cambio dejaría TODAS las
// secciones ocultas a la vez — evita que el usuario se quede con una
// página en blanco sin una forma obvia de recuperarla.
export function setSectionVisible(key, value) {
  if (!(key in prefs.visible)) return true;
  const next = { ...prefs.visible, [key]: value };
  const anyVisible = Object.values(next).some(Boolean);
  if (!anyVisible) return false;

  prefs.visible = next;
  saveLayoutPrefs(prefs);
  applyLayout();
  return true;
}

export function initLayout() {
  applyLayout();
}