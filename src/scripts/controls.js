// src/scripts/controls.js
// Funciones que modifican el estado de un transmisor.

import { state } from './state.js';
import { statusOf } from './status.js';
import { addEvent, updateSidebarStats } from './events.js';
import { renderGrid } from './grid.js';
import { renderGeoMap } from './map.js';
import { openDetail, openDetailId } from './detail.js';
import { openSettings, settingsOpenId } from './settings.js';
import { saveConfig } from './persist.js';
import { showToast } from './toast.js';
import { EQUIPMENT_LABELS } from './data/stations.js';

export function toggleEquipmentInstalled(id, key) {
  if (!state[id]) return;
  state[id].equipment[key].installed = !state[id].equipment[key].installed;
  if (!state[id].equipment[key].installed) state[id].equipment[key].on = false;
  checkStatusChange(id);
  renderAll();
}

export function toggleEquipmentOn(id, key) {
  if (!state[id]) return;
  const eq = state[id].equipment[key];
  if (!eq.installed) return;
  eq.on = !eq.on;
  checkStatusChange(id);
  renderAll();
}

export function togglePhase(id, key) {
  if (!state[id]) return;
  state[id][key] = !state[id][key];
  checkStatusChange(id);
  renderAll();
}

export function updatePhaseMonitoring(id, value) {
  if (!state[id]) return;
  state[id].config.phaseMonitoring = parseInt(value);
  checkStatusChange(id);
  renderAll();
}

export function updateThreshold(id, field, value) {
  if (!state[id]) return;
  const v = parseFloat(value);
  if (!isNaN(v)) state[id].thresholds[field] = v;
  checkStatusChange(id);
  renderAll();
}

export function checkStatusChange(txId) {
  // --- VALIDACIÓN: Si txId es undefined o no existe en state ---
  if (txId === undefined || txId === null) {
    return false;
  }
  
  const tx = state.find(s => s.id === txId);
  if (!tx) {
    return false;
  }
  
  const newStatus = statusOf(tx);
  const oldStatus = tx._lastStatus;

  if (oldStatus === null) {
    tx._lastStatus = newStatus;
    const msg = newStatus === 'ok' ? 'entró en operación normal' :
      newStatus === 'warn' ? 'entró en estado de advertencia' :
        'entró en estado crítico';
    addEvent(txId, newStatus, msg);
    return true;
  }

  if (newStatus !== oldStatus) {
    tx._lastStatus = newStatus;
    let msg = '';
    if (newStatus === 'ok') {
      msg = oldStatus === 'crit' ? 'se recuperó del estado crítico' :
        oldStatus === 'warn' ? 'se recuperó de la advertencia' :
          'volvió a operación normal';
    } else if (newStatus === 'warn') {
      msg = oldStatus === 'crit' ? 'mejoró de crítico a advertencia' :
        oldStatus === 'ok' ? 'entró en estado de advertencia' :
          'cambió a advertencia';
    } else {
      msg = oldStatus === 'ok' ? 'falló críticamente' :
        oldStatus === 'warn' ? 'empeoró a estado crítico' :
          'entró en estado crítico';
    }
    addEvent(txId, newStatus, msg);
    
    // --- VALIDACIÓN: Asegurar que tx existe antes de mostrar toast ---
    if (tx && tx.shortName) {
      const fullMsg = `${tx.shortName} - ${msg}`;
      if (newStatus === 'crit') {
        showToast(fullMsg, 'error');
      } else if (newStatus === 'warn') {
        showToast(fullMsg, 'info');
      }
    } else {
      // Si no hay nombre, mostrar mensaje genérico
      if (newStatus === 'crit') {
        showToast(`Transmisor ${txId} - ${msg}`, 'error');
      } else if (newStatus === 'warn') {
        showToast(`Transmisor ${txId} - ${msg}`, 'info');
      }
    }
    return true;
  }
  
  return false;
}

export function renderAll() {
  saveConfig(state);
  
  const isSettingsClosing = document.getElementById('settings-content')?.classList.contains('settings-closing');

  if (isSettingsClosing) {
    renderGrid();
    renderGeoMap();
    updateSidebarStats();
    return;
  }

  renderGrid();
  renderGeoMap();
  updateSidebarStats();
  
  if (openDetailId !== null) {
    // Verificar que el transmisor aún exista
    const exists = state.some(s => s.id === openDetailId);
    if (exists) {
      import('./detail.js').then(({ updateDetailValues }) => {
        if (typeof updateDetailValues === 'function') {
          updateDetailValues(openDetailId);
        }
      });
    } else {
      import('./detail.js').then(({ closeDetail }) => closeDetail());
    }
  }
  
  if (settingsOpenId !== null) {
    // Verificar que el transmisor aún exista
    const exists = state.some(s => s.id === settingsOpenId);
    if (exists) {
      import('./settings.js').then(({ updateStationTabValues }) => {
        if (typeof updateStationTabValues === 'function') {
          updateStationTabValues(settingsOpenId);
        }
      });
    } else {
      import('./settings.js').then(({ closeSettings }) => closeSettings());
    }
  }
}