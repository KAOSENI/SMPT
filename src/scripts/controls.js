// Funciones que modifican el estado de un transmisor (umbrales, fases, equipos
// instalados/encendidos), registran el evento correspondiente si cambió el semáforo,
// y vuelven a pintar todo lo que depende de ese transmisor.
//
// Nota sobre imports circulares: este archivo importa de detail.js y settings.js,
// y esos a su vez importan de aquí. Es seguro en módulos ES porque todo el uso
// ocurre dentro de funciones (nunca al cargar el módulo), así que en tiempo de
// ejecución todos los bindings ya están resueltos.

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
  state[id].equipment[key].installed = !state[id].equipment[key].installed;
  if (!state[id].equipment[key].installed) state[id].equipment[key].on = false;
  checkStatusChange(id);
  renderAll();
  // Sin toast aquí para no interrumpir la edición
}

export function toggleEquipmentOn(id, key) {
  const eq = state[id].equipment[key];
  if (!eq.installed) return;
  eq.on = !eq.on;
  checkStatusChange(id);
  renderAll();
}

export function togglePhase(id, key) {
  state[id][key] = !state[id][key];
  checkStatusChange(id);
  renderAll();
}

export function updatePhaseMonitoring(id, value) {
  state[id].config.phaseMonitoring = parseInt(value);
  checkStatusChange(id);
  renderAll();
}

export function updateThreshold(id, field, value) {
  const v = parseFloat(value);
  if (!isNaN(v)) state[id].thresholds[field] = v;
  checkStatusChange(id);
  renderAll();
}

export function checkStatusChange(txId) {
  const tx = state[txId];
  const newStatus = statusOf(tx);
  const oldStatus = tx._lastStatus;

  if (oldStatus === null) {
    tx._lastStatus = newStatus;
    const msg = newStatus === 'ok' ? 'entró en operación normal' :
      newStatus === 'warn' ? 'entró en estado de advertencia' :
        'entró en estado crítico';
    addEvent(txId, newStatus, msg);
    return;
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
    
    // Solo mostrar toast para cambios de estado críticos
    // (esto ocurre fuera del modal de configuración normalmente)
    if (newStatus === 'crit') {
      showToast(`${tx.shortName} - ${msg}`, 'error');
    } else if (newStatus === 'warn') {
      showToast(`${tx.shortName} - ${msg}`, 'info');
    }
  }
}

export function renderAll() {
  saveConfig(state);
  renderGrid();
  renderGeoMap();
  updateSidebarStats();
  
  // Actualizar detalle sin recargar el modal de configuración
  if (openDetailId !== null) {
    // Solo actualizar valores, no regenerar todo el HTML
    import('./detail.js').then(({ updateDetailValues }) => {
      if (typeof updateDetailValues === 'function') {
        updateDetailValues(openDetailId);
      } else {
        // Fallback: reabrir detail
        openDetail(openDetailId);
      }
    });
  }
  
  // NO llamar a openSettings() aquí para evitar recargar el modal
  // En su lugar, solo actualizar valores si está abierto
  if (settingsOpenId !== null) {
    import('./settings.js').then(({ updateSettingsValues }) => {
      if (typeof updateSettingsValues === 'function') {
        updateSettingsValues(settingsOpenId);
      }
    });
  }
}