// src/scripts/grid.js
//
// Misma idea que en detail.js: la tarjeta de cada transmisor se separa en
// "cascarón" (se crea una sola vez, incluida la gráfica) y "datos" (se
// actualizan cada tick). Antes, `card.innerHTML = ...` reescribía la tarjeta
// COMPLETA —incluida la mini-gráfica de historial— en cada tick, forzando a
// las 11 gráficas a destruirse y recrearse cada 1.5s. Ahora la gráfica es una
// instancia viva de ECharts que solo recibe datos nuevos con setOption().

import { state } from './state.js';
import { statusOf, statusReasons } from './status.js';
import { updateSidebarStats } from './events.js';
import { openDetail } from './detail.js';
import { chartSkeletonHtml, mountLineChart, updateLineChart } from './charts.js';

const cardChartInstances = {};

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

    <div class="card-graph-container" style="margin: 10px 0;">
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

  // Motivo específico (ROE, temperatura, potencia, fase o equipo) por el
  // que se disparó la advertencia/crítico — así no hay que abrir el
  // detalle solo para saber qué está mal.
  const statusReason = document.getElementById(`status-reason-${tx.id}`);
  if (statusReason) {
    statusReason.textContent = reasons.join(' · ');
    statusReason.style.display = reasons.length ? '' : 'none';
  }

  // Describe la tarjeta completa para lectores de pantalla (equivalente a lo
  // que ya se ve en pantalla: nombre, estado, motivo y potencia actual) y
  // refuerza visualmente que la tarjeta es interactiva.
  const card = document.getElementById(`card-${tx.id}`);
  if (card) {
    const statusLabel = s === 'ok' ? 'operando con normalidad' : s === 'warn' ? 'en advertencia' : 'en estado crítico';
    const reasonSuffix = reasons.length ? ` (${reasons.join(', ')})` : '';
    card.setAttribute('aria-label', `${tx.shortName}, ${statusLabel}${reasonSuffix}, potencia ${tx.power.toFixed(0)} por ciento. Abrir detalle.`);
  }

  // La gráfica se monta UNA vez (cuando el contenedor ya existe en el DOM)
  // y de ahí en adelante solo se le actualizan los datos. Usa el mismo
  // histórico real (tx.history.power) que el panel de detalle, y el umbral
  // que de verdad está configurado para este transmisor — así la mini-gráfica
  // siempre es coherente con el medidor de arriba, en vez de una animación
  // decorativa sin relación con el valor mostrado.
  if (!cardChartInstances[tx.id]) {
    cardChartInstances[tx.id] = mountLineChart(`card-chart-${tx.id}`);
  }
  updateLineChart(cardChartInstances[tx.id], `card-chart-${tx.id}`, tx.history.power, tx.thresholds.powerMin, currentColor, fmtPct);
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