// src/scripts/layout-prefs.js
//
// Controla qué secciones de la página se muestran y en qué orden se
// acomodan (panel de métricas, mapa, panel lateral, cuadrícula de
// transmisores). El orden lo decide el usuario arrastrando cada sección
// (ver layout-dnd.js) y se guarda en localStorage (ver persist.js) para que
// sobreviva entre sesiones, igual que el tema.
//
// Cómo se traduce el orden a CSS (sin manipular el DOM directamente, para
// poder aplicarlo ANTES del primer pintado y evitar un flash del acomodo
// por defecto — ver el script inline en Layout.astro):
//   - Cada sección vive siempre en el mismo contenedor flex (.layout-grid).
//     Su posición visual la da la propiedad CSS `order`, tomada de
//     data-order-<sección> en <html>.
//   - El mapa es de tamaño fijo (cuadrado). De las otras dos secciones que
//     pueden ir "junto al mapa" (panel lateral y cuadrícula), la que
//     aparezca primero en el orden guardado es la que se acomoda angosta
//     al lado del mapa ("companion"); la otra pasa a su propia fila a todo
//     lo ancho. Ese resultado se guarda en data-companion.
// Ver src/styles/map.css para las reglas CSS que consumen estos atributos.

import { loadLayoutPrefs, saveLayoutPrefs } from './persist.js';
import { resizeCardCharts, updateCompactMode, renderGrid } from './grid.js';

const SECTION_KEYS = ['dashboard', 'map', 'sidebar', 'grid'];

function defaultPrefs() {
  return {
    // Orden de arriba hacia abajo / izquierda a derecha. Ver comentario de
    // arriba sobre cómo "sidebar" antes que "grid" (o viceversa) decide
    // cuál de las dos queda junto al mapa.
    order: ['dashboard', 'map', 'sidebar', 'grid'],
    visible: { dashboard: true, map: true, sidebar: true, grid: true },
  };
}

function normalizeOrder(saved) {
  if (!Array.isArray(saved)) return defaultPrefs().order;
  // Se queda solo con llaves válidas y sin duplicados, y agrega al final
  // cualquier sección que falte — así una preferencia guardada con una
  // versión vieja del código (menos secciones) no rompe el layout actual.
  const seen = new Set();
  const cleaned = saved.filter((key) => {
    if (!SECTION_KEYS.includes(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  SECTION_KEYS.forEach((key) => {
    if (!seen.has(key)) cleaned.push(key);
  });
  return cleaned;
}

function normalize(saved) {
  const base = defaultPrefs();
  if (!saved || typeof saved !== 'object') return base;
  return {
    order: normalizeOrder(saved.order),
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

// De las secciones "sidebar"/"grid" (las únicas que pueden ir junto al
// mapa), decide cuál es la que se acomoda angosta al lado — la primera de
// las dos, visible, que aparezca en el orden guardado. 'none' si el mapa
// está oculto o si ninguna de las dos está visible.
function computeCompanion(order, visible) {
  if (!visible.map) return 'none';
  const candidate = order.find((key) => (key === 'sidebar' || key === 'grid') && visible[key] !== false);
  return candidate || 'none';
}

export function applyLayout() {
  // Mismo mecanismo que usa el script inline en Layout.astro (que corre
  // antes del primer pintado): atributos en <html>, no estilos inline por
  // elemento. Mantenerlos como única fuente de verdad evita que ambos
  // caminos (carga inicial vs. cambios en vivo al arrastrar) se
  // desincronicen entre sí.
  const html = document.documentElement;

  prefs.order.forEach((key, index) => {
    html.setAttribute(`data-order-${key}`, String(index));
  });

  html.setAttribute('data-companion', computeCompanion(prefs.order, prefs.visible));

  const hidden = Object.entries(prefs.visible)
    .filter(([, visible]) => !visible)
    .map(([key]) => key);
  if (hidden.length) html.setAttribute('data-hidden-sections', hidden.join(' '));
  else html.removeAttribute('data-hidden-sections');

  // Los contenedores de las gráficas pudieron cambiar de tamaño al
  // reacomodar la página — ECharts no se reajusta solo ante eso, así que
  // se le pide explícitamente después de que el CSS termine de aplicarse.
  // updateCompactMode() también necesita ese mismo respiro: recién ahí
  // "data-companion" ya quedó aplicado y el layout terminó de asentarse.
  //
  // renderGrid() e initSidebarCharts() se llaman aquí también porque son
  // las mismas funciones que montan las gráficas la primera vez — ambas
  // ya revisan si su sección está oculta (y no hacen nada si lo está) y
  // ya son seguras de llamar de más (no duplican instancias), así que
  // llamarlas en cada cambio de disposición, sin rastrear a mano si hubo
  // una transición oculto→visible, resuelve automáticamente el caso de
  // "el usuario vuelve a mostrar una sección que antes estaba oculta".
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    resizeCardCharts();
    updateCompactMode();
    renderGrid();
    window.initSidebarCharts?.();
  }, 50);
}

// Llamado desde layout-dnd.js cuando el usuario suelta una sección
// arrastrada en una nueva posición.
export function setOrder(newOrder) {
  prefs.order = normalizeOrder(newOrder);
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