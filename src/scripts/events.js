// src/scripts/events.js
// Bitácora de eventos (cambios de estado) y estadísticas resumidas del panel lateral.

import { state } from './state.js';
import { statusOf } from './status.js';

export let eventLog = [];
export const MAX_EVENTS = 100;
// Mostrar solo los 7 eventos más recientes
export const DISPLAY_EVENTS = 10;

export function addEvent(txId, status, message) {
  const tx = state[txId];
  const time = new Date();
  const event = {
    id: eventLog.length,
    txId: txId,
    txName: tx.shortName,
    status: status,
    message: message,
    time: time,
    timeStr: time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
  eventLog.unshift(event);
  if (eventLog.length > MAX_EVENTS) eventLog.pop();
  renderSidebarEvents();
  updateSidebarStats();
}

export function renderSidebarEvents() {
  const container = document.getElementById('sidebar-events');
  const countEl = document.getElementById('sidebar-event-count');

  if (!container || !countEl) return;

  countEl.textContent = `${eventLog.length} eventos`;

  if (eventLog.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; color:var(--text-dim); font-family:var(--mono); font-size:10px; padding:16px 0;">
        Esperando eventos...
      </div>`;
    return;
  }

  // Mostrar solo los últimos DISPLAY_EVENTS (5) eventos
  const eventsToShow = eventLog.slice(0, DISPLAY_EVENTS);

  // openDetail se expone en window (ver main.js) porque este HTML se inserta como
  // texto (innerHTML), así que el onclick solo puede resolver funciones globales.
  container.innerHTML = eventsToShow.map(e => `
    <div class="sidebar-event" style="cursor:pointer;" onclick="openDetail(${e.txId})">
      <span class="ev-time">${e.timeStr}</span>
      <span class="ev-dot ${e.status}"></span>
      <span class="ev-msg">
        <span class="${e.status}">${e.txName}</span>
        ${e.message}
      </span>
    </div>
  `).join('');

  container.scrollTop = 0;
}

export function updateSidebarStats() {
  let ok = 0, warn = 0, crit = 0;
  state.forEach(tx => {
    const s = statusOf(tx);
    if (s === 'ok') ok++;
    else if (s === 'warn') warn++;
    else crit++;
  });

  // Actualizar elementos del sidebar
  const okEl = document.getElementById('sidebar-ok');
  const warnEl = document.getElementById('sidebar-warn');
  const critEl = document.getElementById('sidebar-crit');
  const totalEl = document.getElementById('sidebar-total');
  const lastEl = document.getElementById('sidebar-last');

  if (okEl) okEl.textContent = ok;
  if (warnEl) warnEl.textContent = warn;
  if (critEl) critEl.textContent = crit;
  if (totalEl) totalEl.textContent = state.length;

  if (eventLog.length > 0 && lastEl) {
    lastEl.textContent = eventLog[0].timeStr;
  }

  // ============================================================
  // ACTUALIZAR GRÁFICA DE BARRAS (si existe)
  // ============================================================
  if (window.updateBarsChart) {
    window.updateBarsChart();
  }
}
