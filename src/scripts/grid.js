// src/scripts/grid.js
//
// Misma idea que en detail.js: la tarjeta de cada transmisor se separa en
// "cascarón" (se crea una sola vez, incluida la gráfica) y "datos" (se
// actualizan cada tick). Antes, `card.innerHTML = ...` reescribía la tarjeta
// COMPLETA —incluida la mini-gráfica de historial— en cada tick, forzando a
// las 11 gráficas a destruirse y recrearse cada 1.5s. Ahora la gráfica es una
// instancia viva de ECharts que solo recibe datos nuevos con setOption().

import { state } from './state.js';
import { statusOf } from './status.js';
import { updateSidebarStats } from './events.js';
import { openDetail } from './detail.js';
import { chartSkeletonHtml, mountLineChart, updateLineChart } from './charts.js';

const cardChartInstances = {};

function buildCardSkeleton(tx) {
  const card = document.createElement('div');
  card.id = `card-${tx.id}`;
  card.className = 'card';
  card.tabIndex = 0;

  card.innerHTML = `
    <div class="card-top">
      <div>
        <p class="tx-name">${tx.shortName}</p>
        <p class="tx-freq">${tx.freq} · ${tx.band} · ${tx.municipio}</p>
      </div>
      <div class="dot" id="dot-${tx.id}"></div>
    </div>
    <div class="meter-row"><span>Potencia</span><span id="power-val-${tx.id}">—</span></div>
    <div class="meter-track"><div class="meter-fill" id="meter-${tx.id}" style="width:0%;"></div></div>

    <div class="card-graph-container" style="margin: 10px 0;">
      ${chartSkeletonHtml(`card-chart-${tx.id}`, 'Historial Potencia')}
    </div>

    <p class="card-status-text" id="status-text-${tx.id}"></p>
  `;

  card.addEventListener('click', () => openDetail(tx.id));
  return card;
}

function updateCardData(tx, s) {
  const colorMap = { ok: '#22c55e', warn: '#eab308', crit: '#ef4444' };
  const currentColor = colorMap[s] || '#6b7280';
  const fmtKw = (val) => val.toFixed(1) + ' kW';

  const dot = document.getElementById(`dot-${tx.id}`);
  if (dot) dot.className = `dot dot-${s}`;

  const powerVal = document.getElementById(`power-val-${tx.id}`);
  if (powerVal) powerVal.textContent = tx.power.toFixed(0) + '%';

  const meter = document.getElementById(`meter-${tx.id}`);
  if (meter) {
    meter.style.width = tx.power + '%';
    meter.style.background = s === 'crit' ? 'var(--red)' : s === 'warn' ? 'var(--amber)' : 'var(--phosphor)';
  }

  const statusText = document.getElementById(`status-text-${tx.id}`);
  if (statusText) {
    statusText.className = `card-status-text txt-${s}`;
    statusText.textContent = s === 'ok' ? 'Operando con normalidad' : s === 'warn' ? 'Requiere revisión' : 'Alarma activa';
  }

  // La gráfica se monta UNA vez (cuando el contenedor ya existe en el DOM)
  // y de ahí en adelante solo se le actualizan los datos.
  if (!cardChartInstances[tx.id]) {
    cardChartInstances[tx.id] = mountLineChart(`card-chart-${tx.id}`);
  }
  updateLineChart(cardChartInstances[tx.id], `card-chart-${tx.id}`, tx.waveform, 75, currentColor, fmtKw);
}

export function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;

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
}
