// src/scripts/tick.js
// Simulación en vivo: cada "tick" mueve un poco las métricas de cada transmisor,
// acumula el histórico y revisa si algún transmisor cambió de semáforo.

import { state } from './state.js';
import { rand } from './utils.js';
import { HISTORY_MAX } from './charts.js';
import { checkStatusChange } from './controls.js';
import { renderGrid } from './grid.js';
import { openDetail, openDetailId } from './detail.js';
import { openSettings, settingsOpenId } from './settings.js';
import { updateDashboard, calculateMetrics } from './dashboard.js';
import { statusOf } from './status.js';

export const TICK_INTERVAL_MS = 1500;

export function pushHistory(tx) {
  ['power', 'vswr', 'temp'].forEach(k => {
    tx.history[k].push(tx[k]);
    if (tx.history[k].length > HISTORY_MAX) tx.history[k].shift();
  });
}

export function tick() {
  let statusChanged = false;

  // --- FILTRAR: Solo iterar sobre transmisores válidos ---
  const validTransmitters = state.filter(tx => tx && typeof tx === 'object' && tx.equipment);
  
  validTransmitters.forEach(tx => {
    tx.power = Math.min(100, Math.max(40, tx.power + rand(-4, 4)));
    tx.vswr = Math.max(1.0, tx.vswr + rand(-0.05, 0.05));
    tx.temp = Math.max(25, tx.temp + rand(-1.5, 1.5));
    pushHistory(tx);

    if (statusOf(tx) !== 'ok') tx.degradedMs = (tx.degradedMs || 0) + TICK_INTERVAL_MS;

    const changed = checkStatusChange(tx.id);
    if (changed) statusChanged = true;
  });

  renderGrid();

  const metrics = calculateMetrics(state);
  updateDashboard(metrics);

  const ok = state.filter(tx => tx && statusOf(tx) === 'ok').length;
  const warn = state.filter(tx => tx && statusOf(tx) === 'warn').length;
  const crit = state.filter(tx => tx && statusOf(tx) === 'crit').length;
  
  if (window.__updateSidebarStatus) {
    window.__updateSidebarStatus(ok, warn, crit);
  }
  
  if (window.updateSidebarGauge) {
    window.updateSidebarGauge(metrics.availability);
  }

  if (window.__refreshStatsModal) window.__refreshStatsModal();

  const active = document.activeElement;
  const editingThreshold = active && active.matches('#settings-content input[type="number"]');
  const isClosing = document.getElementById('settings-content')?.classList.contains('settings-closing');

  // --- VALIDAR QUE EL ID AÚN EXISTA ANTES DE ABRIR DETALLE ---
  if (openDetailId !== null && state.some(s => s.id === openDetailId)) {
    openDetail(openDetailId);
  } else if (openDetailId !== null) {
    import('./detail.js').then(({ closeDetail }) => closeDetail());
  }
  
  // --- ACTUALIZAR CONFIGURACIÓN SIN RE-RENDERIZAR ---
  if (settingsOpenId !== null && !editingThreshold && !isClosing) {
    const exists = state.some(s => s.id === settingsOpenId);
    if (exists) {
      // Solo actualizar valores, no re-renderizar toda la ventana
      import('./settings.js').then(({ updateStationTabValues }) => {
        if (typeof updateStationTabValues === 'function') {
          updateStationTabValues(settingsOpenId);
        }
      });
    } else {
      // Si ya no existe, cerrar configuración
      import('./settings.js').then(({ closeSettings }) => closeSettings());
    }
  }
}