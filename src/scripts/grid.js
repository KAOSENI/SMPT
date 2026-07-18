// src/scripts/grid.js - Versión optimizada con procesamiento por lotes

import { state } from './state.js';
import { statusOf, statusReasons } from './status.js';
import { updateSidebarStats } from './events.js';
import { openDetail } from './detail.js';
import { chartSkeletonHtml, mountLineChart, updateLineChart } from './charts.js';

const cardChartInstances = {};
let gridResizeObserver = null;
let gridInitialized = false;
let renderPending = false;

// --- PROCESAMIENTO POR LOTES ---
const BATCH_SIZE = 2;
const BATCH_DELAY_MS = 16;

function processBatch(ids, index, callback) {
  const end = Math.min(index + BATCH_SIZE, ids.length);
  const batch = ids.slice(index, end);

  batch.forEach(id => {
    const tx = state.find(s => s.id === id);
    if (!tx) return;

    const s = statusOf(tx);
    let card = document.getElementById(`card-${tx.id}`);
    if (!card) {
      card = buildCardSkeleton(tx);
      const grid = document.getElementById('grid');
      if (grid) grid.appendChild(card);
    }
    if (card) {
      updateCardData(tx, s);
    }
  });

  updateStatusCounters();

  if (end < ids.length) {
    setTimeout(() => {
      processBatch(ids, end, callback);
    }, BATCH_DELAY_MS);
  } else {
    gridInitialized = true;
    renderPending = false;
    updateCompactMode();
    if (callback) callback();
    window.dispatchEvent(new CustomEvent('grid-ready'));
  }
}

// --- ELIMINAR TARJETAS HUÉRFANAS ---
function removeOrphanCards() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const validIds = new Set(state.map(tx => tx.id));
  const cards = grid.querySelectorAll('.card');

  cards.forEach(card => {
    const cardId = parseInt(card.id.replace('card-', ''), 10);
    if (!validIds.has(cardId)) {
      // Eliminar instancia de gráfica
      if (cardChartInstances[cardId]) {
        try {
          cardChartInstances[cardId].dispose();
        } catch (e) {}
        delete cardChartInstances[cardId];
      }
      // Eliminar tarjeta del DOM
      card.remove();
    }
  });
}

// --- FUNCIÓN PRINCIPAL renderGrid ---
export function renderGrid() {
  // Si ya hay una renderización pendiente, no duplicar
  if (renderPending) return;

  const grid = document.getElementById('grid');
  if (!grid) return;

  // --- SIEMPRE ELIMINAR TARJETAS HUÉRFANAS (incluso si ya está inicializado) ---
  removeOrphanCards();

  // Si ya está inicializado, solo actualizar datos (sin recrear)
  if (gridInitialized) {
    updateAllCards();
    return;
  }

  const section = document.getElementById('layout-section-grid');
  if (section) {
    initResizeObserver(section);
  }

  const hiddenSections = (document.documentElement.getAttribute('data-hidden-sections') || '').split(' ');
  if (hiddenSections.includes('grid')) return;

  updateCompactGridColumns();

  const ids = state.map(tx => tx.id);

  if (ids.length === 0) {
    // Si no hay transmisores, mostrar mensaje
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:var(--text-dim); font-family:var(--mono);">
        <p style="font-size:16px; margin-bottom:8px;">No hay transmisores configurados</p>
        <p style="font-size:12px;">Agrega uno desde Configuración → Sistema y transmisores</p>
      </div>
    `;
    gridInitialized = true;
    return;
  }

  renderPending = true;
  processBatch(ids, 0);
}

// --- ACTUALIZACIÓN RÁPIDA (para ticks) ---
export function updateAllCards() {
  requestAnimationFrame(() => {
    state.forEach(tx => {
      const s = statusOf(tx);
      const card = document.getElementById(`card-${tx.id}`);
      if (card) {
        updateCardData(tx, s);
      }
    });
    updateStatusCounters();
    updateSidebarStats();
  });
}

// --- ACTUALIZAR CONTADORES ---
function updateStatusCounters() {
  let ok = 0, warn = 0, crit = 0;
  state.forEach(tx => {
    try {
      const s = statusOf(tx);
      if (s === 'ok') ok++;
      else if (s === 'warn') warn++;
      else crit++;
    } catch {
      // Ignorar errores
    }
  });

  const okEl = document.getElementById('count-ok');
  if (okEl) okEl.textContent = ok;
  const warnEl = document.getElementById('count-warn');
  if (warnEl) warnEl.textContent = warn;
  const critEl = document.getElementById('count-crit');
  if (critEl) critEl.textContent = crit;
}

// --- RESIZE ---
export function resizeCardCharts() {
  requestAnimationFrame(() => {
    Object.values(cardChartInstances).forEach((chart) => {
      if (chart && typeof chart.resize === 'function') {
        try {
          chart.resize();
        } catch (e) {}
      }
    });
  });
}

function initResizeObserver(section) {
  if (gridResizeObserver) {
    gridResizeObserver.disconnect();
  }

  gridResizeObserver = new ResizeObserver(() => {
    updateCompactMode();
  });

  gridResizeObserver.observe(section);
}

export function updateCompactMode() {
  const section = document.getElementById('layout-section-grid');
  const gridContainer = document.getElementById('grid');
  if (!section || !gridContainer) return;

  const isCompanion = document.documentElement.getAttribute('data-companion') === 'grid';
  if (!isCompanion) {
    section.classList.remove('grid-compact');
    resizeCardCharts();
    return;
  }

  // ✅ 1. PRIMERO: Leer (sin modificaciones previas)
  const overflowing = gridContainer.scrollHeight > gridContainer.clientHeight;

  // ✅ 2. LUEGO: Modificar el DOM
  section.classList.remove('grid-compact');
  section.classList.toggle('grid-compact', overflowing);

  resizeCardCharts();
}

let compactResizeTimeout = null;
window.addEventListener('resize', () => {
  clearTimeout(compactResizeTimeout);
  compactResizeTimeout = setTimeout(() => {
    updateCompactMode();
  }, 50);
});

function updateCompactGridColumns() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  const cols = Math.max(2, Math.ceil(Math.sqrt(state.length)));
  grid.style.setProperty('--compact-cols', String(cols));
}

function buildCardSkeleton(tx) {
  const card = document.createElement('div');
  card.id = `card-${tx.id}`;
  card.className = 'card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');

  card.innerHTML = `
    <div class="card-top">
      <div>
        <p class="tx-name">${tx.shortName}</p>
        <p class="tx-freq">${tx.freq} · ${tx.band} · ${tx.municipio}</p>
      </div>
      <div class="card-top-right">
        <span class="card-power-badge" id="power-badge-${tx.id}" title="Potencia actual">—</span>
        <div class="dot" id="dot-${tx.id}" title="Estado del transmisor"></div>
      </div>
    </div>
    <div class="meter-row"><span title="Porcentaje de la potencia nominal del transmisor">Potencia actual</span><span id="power-val-${tx.id}">—</span></div>
    <div class="meter-track"><div class="meter-fill" id="meter-${tx.id}" style="width:0%;"></div></div>

    <div class="card-graph-container">
      ${chartSkeletonHtml(`card-chart-${tx.id}`, 'Historial de potencia')}
    </div>

    <p class="card-status-text" id="status-text-${tx.id}"></p>
    <p class="card-status-reason" id="status-reason-${tx.id}"></p>
  `;

  card.addEventListener('click', () => openDetail(tx.id));
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openDetail(tx.id);
  });
  return card;
}

function updateCardData(tx, s) {
  const colorMap = { ok: '#22c55e', warn: '#eab308', crit: '#ef4444' };
  const currentColor = colorMap[s] || '#6b7280';
  const fmtPct = (val) => val.toFixed(0) + '%';
  const reasons = s === 'ok' ? [] : statusReasons(tx);

  const dot = document.getElementById('dot-' + tx.id);
  if (dot) dot.className = `dot dot-${s}`;

  const powerVal = document.getElementById('power-val-' + tx.id);
  if (powerVal) powerVal.textContent = tx.power.toFixed(0) + '%';

  const powerBadge = document.getElementById('power-badge-' + tx.id);
  if (powerBadge) powerBadge.textContent = tx.power.toFixed(0) + '%';

  const meter = document.getElementById('meter-' + tx.id);
  if (meter) {
    meter.style.width = tx.power + '%';
    meter.style.background = s === 'crit' ? 'var(--red)' : s === 'warn' ? 'var(--amber)' : 'var(--phosphor)';
  }

  const statusText = document.getElementById('status-text-' + tx.id);
  if (statusText) {
    statusText.className = `card-status-text txt-${s}`;
    statusText.textContent = s === 'ok' ? 'Operando con normalidad' : s === 'warn' ? 'Requiere revisión' : 'Alarma activa';
  }

  const statusReason = document.getElementById('status-reason-' + tx.id);
  if (statusReason) {
    statusReason.textContent = reasons.length ? reasons.join(' · ') : '\u00A0';
    statusReason.style.visibility = reasons.length ? 'visible' : 'hidden';
  }

  const card = document.getElementById('card-' + tx.id);
  if (card) {
    const statusLabel = s === 'ok' ? 'operando con normalidad' : s === 'warn' ? 'en advertencia' : 'en estado crítico';
    const reasonSuffix = reasons.length ? ` (${reasons.join(', ')})` : '';
    card.setAttribute('aria-label', `${tx.shortName}, ${statusLabel}${reasonSuffix}, potencia ${tx.power.toFixed(0)} por ciento. Abrir detalle.`);
  }

  if (!cardChartInstances[tx.id]) {
    setTimeout(() => {
      const container = document.getElementById(`card-chart-${tx.id}`);
      if (container) {
        cardChartInstances[tx.id] = mountLineChart(`card-chart-${tx.id}`);
        updateLineChart(cardChartInstances[tx.id], `card-chart-${tx.id}`, tx.history.power, tx.thresholds.powerMin, currentColor, fmtPct);
      }
    }, 0);
  } else {
    updateLineChart(cardChartInstances[tx.id], `card-chart-${tx.id}`, tx.history.power, tx.thresholds.powerMin, currentColor, fmtPct);
  }
}

// --- REINICIALIZAR GRID (cuando se eliminan/agregan transmisores) ---
export function reinitGrid() {
  gridInitialized = false;
  gridRenderPending = false;
  // Limpiar instancias de gráficas
  Object.values(cardChartInstances).forEach(chart => {
    try { chart.dispose(); } catch (e) {}
  });
  Object.keys(cardChartInstances).forEach(key => delete cardChartInstances[key]);
  renderGrid();
}