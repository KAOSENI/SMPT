// src/scripts/events.js
// Bitácora de eventos (cambios de estado) y estadísticas resumidas del panel lateral.

import { state } from './state.js';
import { statusOf } from './status.js';

export let eventLog = [];
export const MAX_EVENTS = 100;
export const DISPLAY_EVENTS = 10;

export function addEvent(txId, status, message) {
  // --- VALIDACIÓN: Si el transmisor no existe, no agregar evento ---
  const tx = state.find(s => s.id === txId);
  if (!tx) {
    // Si el transmisor ya no existe, simplemente ignoramos el evento
    return;
  }

  const time = new Date();
  const event = {
    id: eventLog.length,
    txId: txId,
    txName: tx.shortName || tx.call || 'Desconocido',
    status: status,
    message: message,
    time: time,
    timeStr: time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
  eventLog.unshift(event);
  if (eventLog.length > MAX_EVENTS) eventLog.pop();
  
  // Limpiar eventos de transmisores que ya no existen (al eliminar)
  cleanupOrphanEvents();
  
  renderSidebarEvents();
  updateSidebarStats();
}

// --- LIMPIAR EVENTOS DE TRANSMISORES ELIMINADOS ---
function cleanupOrphanEvents() {
  const validIds = new Set(state.map(tx => tx.id));
  eventLog = eventLog.filter(e => validIds.has(e.txId));
}

export function renderSidebarEvents() {
  const container = document.getElementById('sidebar-events');
  const countEl = document.getElementById('sidebar-event-count');

  if (!container || !countEl) return;

  // Limpiar eventos huérfanos antes de renderizar
  cleanupOrphanEvents();

  countEl.textContent = `${eventLog.length} eventos`;

  if (eventLog.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; color:var(--text-dim); font-family:var(--mono); font-size:10px; padding:16px 0;">
        Esperando eventos...
      </div>`;
    return;
  }

  const eventsToShow = eventLog.slice(0, DISPLAY_EVENTS);

  container.innerHTML = eventsToShow.map(e => {
    // Verificar que el transmisor aún exista antes de crear el enlace
    const exists = state.some(s => s.id === e.txId);
    const clickHandler = exists ? `onclick="openDetail(${e.txId})"` : '';
    return `
      <div class="sidebar-event" style="cursor:${exists ? 'pointer' : 'default'}; opacity:${exists ? 1 : 0.5};" ${clickHandler}>
        <span class="ev-time">${e.timeStr}</span>
        <span class="ev-dot ${e.status}"></span>
        <span class="ev-msg">
          <span class="${e.status}">${e.txName}</span>
          ${e.message}
        </span>
      </div>
    `;
  }).join('');

  container.scrollTop = 0;
}

export function updateSidebarStats() {
  // Filtrar solo transmisores válidos
  const validTxs = state.filter(tx => tx && typeof tx === 'object' && tx.equipment);
  
  let ok = 0, warn = 0, crit = 0;
  validTxs.forEach(tx => {
    try {
      const s = statusOf(tx);
      if (s === 'ok') ok++;
      else if (s === 'warn') warn++;
      else crit++;
    } catch {
      // Ignorar errores de status
    }
  });

  const okEl = document.getElementById('sidebar-ok');
  const warnEl = document.getElementById('sidebar-warn');
  const critEl = document.getElementById('sidebar-crit');
  const totalEl = document.getElementById('sidebar-total');
  const lastEl = document.getElementById('sidebar-last');

  if (okEl) okEl.textContent = ok;
  if (warnEl) warnEl.textContent = warn;
  if (critEl) critEl.textContent = crit;
  if (totalEl) totalEl.textContent = validTxs.length;

  // Limpiar eventos huérfanos
  cleanupOrphanEvents();

  if (eventLog.length > 0 && lastEl) {
    lastEl.textContent = eventLog[0].timeStr;
  }

  if (window.updateBarsChart) {
    window.updateBarsChart();
  }
}

// --- EXPONER FUNCIONES PARA LIMPIEZA DESDE FUERA ---
export function cleanupEvents() {
  cleanupOrphanEvents();
  renderSidebarEvents();
}