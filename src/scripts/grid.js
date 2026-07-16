// src/scripts/grid.js
import { state } from './state.js';
import { statusOf, statusReasons } from './status.js';
import { updateSidebarStats } from './events.js';
import { openDetail } from './detail.js';
import { chartSkeletonHtml, mountLineChart, updateLineChart } from './charts.js';

const cardChartInstances = {};
let gridResizeObserver = null;

// Sincroniza el redibujado con el ciclo de renderizado del navegador
export function resizeCardCharts() {
  requestAnimationFrame(() => {
    // Un pequeño delay de 10ms garantiza que el DOM ya computó el ancho real de las tarjetas
    setTimeout(() => {
      Object.values(cardChartInstances).forEach((chart) => {
        if (chart) {
          chart.resize();
        }
      });
    }, 10);
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

  section.classList.remove('grid-compact');
  
  const overflowing = gridContainer.scrollHeight > gridContainer.clientHeight;
  section.classList.toggle('grid-compact', overflowing);
  
  // Forzamos la sincronización de tamaño de los gráficos
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
      <div class="dot" id="dot-${tx.id}" title="Estado del transmisor"></div>
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
    // Si no hay errores, inyectamos un espacio en blanco no rompible (\u00A0)
    // para forzar a que el elemento mantenga su altura física intacta en el DOM.
    statusReason.textContent = reasons.length ? reasons.join(' · ') : '\u00A0';
    // Se cambia de display a visibility para ocultar/mostrar sin destruir la caja estructural
    statusReason.style.visibility = reasons.length ? 'visible' : 'hidden';
  }

  const card = document.getElementById('card-' + tx.id);
  if (card) {
    const statusLabel = s === 'ok' ? 'operando con normalidad' : s === 'warn' ? 'en advertencia' : 'en estado crítico';
    const reasonSuffix = reasons.length ? ` (${reasons.join(', ')})` : '';
    card.setAttribute('aria-label', `${tx.shortName}, ${statusLabel}${reasonSuffix}, potencia ${tx.power.toFixed(0)} por ciento. Abrir detalle.`);
  }

  if (!cardChartInstances[tx.id]) {
    cardChartInstances[tx.id] = mountLineChart(`card-chart-${tx.id}`);
  }
  updateLineChart(cardChartInstances[tx.id], `card-chart-${tx.id}`, tx.history.power, tx.thresholds.powerMin, currentColor, fmtPct);
}

export function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const section = document.getElementById('layout-section-grid');
  if (section) {
    initResizeObserver(section);
  }

  const hiddenSections = (document.documentElement.getAttribute('data-hidden-sections') || '').split(' ');
  if (hiddenSections.includes('grid')) return;

  updateCompactGridColumns();

  let ok = 0, warn = 0, crit = 0;

  state.forEach(tx => {
    const s = statusOf(tx);
    if (s === 'ok') ok++; else if (s === 'warn') warn++; else crit++;

    let card = document.getElementById(`card-${tx.id}`);
    if (!card) {
      card = buildCardSkeleton(tx);
      grid.appendChild(card);
    }
    updateCardData(tx, s);
  });

  const okEl = document.getElementById('count-ok');
  if (okEl) okEl.textContent = ok;
  const warnEl = document.getElementById('count-warn');
  if (warnEl) warnEl.textContent = warn;
  const critEl = document.getElementById('count-crit');
  if (critEl) critEl.textContent = crit;

  updateSidebarStats();
  updateCompactMode();
}