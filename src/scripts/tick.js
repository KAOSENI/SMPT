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
// Importar dashboard para actualizar estadísticas
import { updateDashboard, calculateMetrics } from './dashboard.js';
// Importar statusOf para calcular estados
import { statusOf } from './status.js';

export function pushHistory(tx) {
  ['power', 'vswr', 'temp'].forEach(k => {
    tx.history[k].push(tx[k]);
    if (tx.history[k].length > HISTORY_MAX) tx.history[k].shift();
  });
}

export function tick() {
  let statusChanged = false;

  state.forEach(tx => {
    tx.power = Math.min(100, Math.max(40, tx.power + rand(-4, 4)));
    tx.vswr = Math.max(1.0, tx.vswr + rand(-0.05, 0.05));
    tx.temp = Math.max(25, tx.temp + rand(-1.5, 1.5));
    pushHistory(tx);
    const changed = checkStatusChange(tx.id);
    if (changed) statusChanged = true;
  });

  renderGrid();

  // Actualizar dashboard con las nuevas métricas
  const metrics = calculateMetrics(state);
  updateDashboard(metrics);

  // ACTUALIZAR SIDEBAR - Calcular estados actuales
  const ok = state.filter(tx => statusOf(tx) === 'ok').length;
  const warn = state.filter(tx => statusOf(tx) === 'warn').length;
  const crit = state.filter(tx => statusOf(tx) === 'crit').length;
  
  // Actualizar gráfica de estado del sidebar
  if (window.__updateSidebarStatus) {
    window.__updateSidebarStatus(ok, warn, crit);
  }
  
  // Actualizar también el gauge de disponibilidad
  if (window.updateSidebarGauge) {
    const metrics = calculateMetrics(state);
    window.updateSidebarGauge(metrics.availability);
  }

  // Ventana de "Estadísticas detalladas": antes solo se llenaba una vez al
  // abrirla y se quedaba congelada mientras seguía abierta. Ahora se
  // refresca en cada tick, igual que el panel de detalle/configuración
  // (la función internamente no hace nada si el modal está cerrado).
  if (window.__refreshStatsModal) window.__refreshStatsModal();

  const active = document.activeElement;
  const editingThreshold = active && active.matches('#settings-content input[type="number"]');
  if (openDetailId !== null) openDetail(openDetailId);
  if (settingsOpenId !== null && !editingThreshold) openSettings(settingsOpenId);
}