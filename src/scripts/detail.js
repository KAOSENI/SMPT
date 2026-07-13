// Ventana de datos de un transmisor (solo lectura + encendido/apagado de equipos
// YA instalados). Habilitar/deshabilitar equipos vive en settings.js.

import { state } from './state.js';
import { statusOf } from './status.js';
import { EQUIPMENT_LABELS, EQUIPMENT_KEYS } from './data/stations.js';
import { eventLog } from './events.js';
import { chartSkeletonHtml, mountLineChart, updateLineChart, disposeLineChart } from './charts.js';
import { openSettings } from './settings.js';
import { toggleEquipmentOn } from './controls.js';

export let openDetailId = null;

let chartInstances = { power: null, vswr: null, temp: null };

function disposeCharts() {
  disposeLineChart(chartInstances.power);
  disposeLineChart(chartInstances.vswr);
  disposeLineChart(chartInstances.temp);
  chartInstances = { power: null, vswr: null, temp: null };
}

// --- FUNCIONES DE GENERACIÓN DE HTML ---

function metricsHtml(tx, s) {
  const powerColor = tx.power < tx.thresholds.powerMin ? 'var(--amber)' : 'var(--phosphor)';
  const vswrColor = tx.vswr > tx.thresholds.vswrMax + 0.3 ? 'var(--red)' : tx.vswr > tx.thresholds.vswrMax ? 'var(--amber)' : 'var(--phosphor)';
  const tempColor = tx.temp > tx.thresholds.tempMax + 8 ? 'var(--red)' : tx.temp > tx.thresholds.tempMax ? 'var(--amber)' : 'var(--phosphor)';
  const statusColor = s === 'crit' ? 'var(--red)' : s === 'warn' ? 'var(--amber)' : 'var(--phosphor)';
  const statusLabel = s === 'ok' ? 'Normal' : s === 'warn' ? 'Advertencia' : 'Crítico';

  return `
    <div class="detail-metrics-grid">
      <div class="metric-card metric-power">
        <div class="metric-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v8"/>
            <path d="M8 6l4 4 4-4"/>
            <path d="M4 14h16"/>
            <path d="M6 18h12"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">Potencia</div>
          <div class="metric-value" style="color:${powerColor}">${tx.power.toFixed(1)}<span class="metric-unit">%</span></div>
          <div class="metric-mini">Mín: ${tx.thresholds.powerMin}%</div>
        </div>
      </div>
      <div class="metric-card metric-vswr">
        <div class="metric-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12h3l2-5 4 10 4-10 2 5h3"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">ROE</div>
          <div class="metric-value" style="color:${vswrColor}">${tx.vswr.toFixed(2)}<span class="metric-unit">:1</span></div>
          <div class="metric-mini">Máx: ${tx.thresholds.vswrMax}:1</div>
        </div>
      </div>
      <div class="metric-card metric-temp">
        <div class="metric-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">Temperatura</div>
          <div class="metric-value" style="color:${tempColor}">${tx.temp.toFixed(1)}<span class="metric-unit">°C</span></div>
          <div class="metric-mini">Máx: ${tx.thresholds.tempMax}°C</div>
        </div>
      </div>
      <div class="metric-card metric-status">
        <div class="metric-icon status-dot" style="color:${statusColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">Estado</div>
          <div class="metric-value" style="color:${statusColor}">${statusLabel}</div>
          <div class="metric-mini">${tx.uptime}h en operación</div>
        </div>
      </div>
    </div>`;
}

function phaseHtml(tx) {
  if (tx.config.phaseMonitoring === 0) {
    return `
      <div class="detail-phase-card">
        <div class="detail-phase-header">
          <span class="detail-phase-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </span>
          <span class="detail-phase-title">Alimentación eléctrica</span>
        </div>
        <div class="detail-phase-empty">
          <span class="detail-phase-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
          <span>Sin monitoreo de fase configurado</span>
        </div>
      </div>`;
  }

  const phaseAStatus = tx.phaseA ? 'Operativa' : 'Caída';
  const phaseAColor = tx.phaseA ? 'var(--phosphor)' : 'var(--red)';
  
  let phaseBHtml = '';
  if (tx.config.phaseMonitoring === 2) {
    const phaseBStatus = tx.phaseB ? 'Operativa' : 'Caída';
    const phaseBColor = tx.phaseB ? 'var(--phosphor)' : 'var(--red)';
    phaseBHtml = `
      <div class="detail-phase-item">
        <span class="detail-phase-item-icon" style="color:${phaseBColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </span>
        <span class="detail-phase-item-label">Fase B</span>
        <span class="detail-phase-item-status" style="color:${phaseBColor}">${phaseBStatus}</span>
      </div>`;
  }

  return `
    <div class="detail-phase-card">
      <div class="detail-phase-header">
        <span class="detail-phase-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </span>
        <span class="detail-phase-title">Alimentación eléctrica</span>
        <span class="detail-phase-badge">${tx.config.phaseMonitoring === 1 ? 'Monofásico' : 'Bifásico'}</span>
      </div>
      <div class="detail-phase-items">
        <div class="detail-phase-item">
          <span class="detail-phase-item-icon" style="color:${phaseAColor}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </span>
          <span class="detail-phase-item-label">${tx.config.phaseMonitoring === 1 ? 'Fase' : 'Fase A'}</span>
          <span class="detail-phase-item-status" style="color:${phaseAColor}">${phaseAStatus}</span>
        </div>
        ${phaseBHtml}
      </div>
    </div>`;
}

function equipmentListHtml(tx) {
  const anyInstalled = Object.values(tx.equipment).some(e => e.installed);
  
  if (!anyInstalled) {
    return `
      <div class="detail-equipment-card empty">
        <div class="detail-equipment-header">
          <span class="detail-equipment-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </span>
          <span class="detail-equipment-title">Cadena de equipos</span>
        </div>
        <div class="detail-equipment-empty">
          <span class="detail-equipment-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </span>
          <span>Ningún equipo instalado</span>
          <span class="detail-equipment-hint">Configura los equipos desde el botón "Configuración"</span>
        </div>
      </div>`;
  }

  const rows = EQUIPMENT_KEYS.map(key => {
    const eq = tx.equipment[key];
    const label = EQUIPMENT_LABELS[key];
    const installed = eq.installed;
    const on = eq.on;

    if (!installed) {
      return `
        <div class="detail-equipment-item disabled">
          <span class="detail-equipment-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </span>
          <span class="detail-equipment-item-name">${label.name}</span>
          <span class="detail-equipment-item-sub">${label.sub}</span>
          <span class="detail-equipment-item-badge">No instalado</span>
        </div>`;
    }

    return `
      <div class="detail-equipment-item">
        <span class="detail-equipment-item-icon" style="color:${on ? 'var(--phosphor)' : 'var(--text-dim)'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </span>
        <span class="detail-equipment-item-name">${label.name}</span>
        <span class="detail-equipment-item-sub">${label.sub}</span>
        <label class="switch">
          <input type="checkbox" ${on ? 'checked' : ''} data-equip-on="${key}">
          <span class="slider"></span>
        </label>
      </div>`;
  }).join('');

  const installedCount = EQUIPMENT_KEYS.filter(k => tx.equipment[k].installed).length;

  return `
    <div class="detail-equipment-card">
      <div class="detail-equipment-header">
        <span class="detail-equipment-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </span>
        <span class="detail-equipment-title">Cadena de equipos</span>
        <span class="detail-equipment-count">${installedCount}/${EQUIPMENT_KEYS.length}</span>
      </div>
      <div class="detail-equipment-items">${rows}</div>
    </div>`;
}

function eventsListHtml(id) {
  const txEvents = eventLog.filter(e => e.txId === id).slice(0, 5);
  
  if (txEvents.length === 0) {
    return `
      <div class="detail-events-empty">
        <span class="detail-events-empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </span>
        <span>No hay eventos recientes</span>
      </div>`;
  }

  return txEvents.map(e => {
    const statusColor = e.status === 'crit' ? 'var(--red)' : e.status === 'warn' ? 'var(--amber)' : 'var(--phosphor)';
    return `
      <div class="detail-event-item">
        <span class="detail-event-dot" style="color:${statusColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </span>
        <span class="detail-event-time">${e.timeStr}</span>
        <span class="detail-event-message">${e.message}</span>
      </div>`;
  }).join('');
}

export function openDetail(id) {
  const isNewTransmitter = openDetailId !== id;
  openDetailId = id;
  const tx = state[id];
  const s = statusOf(tx);
  const overlay = document.getElementById('overlay');
  const content = document.getElementById('detail-content');

  if (isNewTransmitter) {
    disposeCharts();

    content.innerHTML = `
      <div class="detail-header">
        <div class="detail-header-left">
          <h2>${tx.shortName}</h2>
          <div class="detail-header-tags">
            <span class="detail-tag">${tx.call}</span>
            <span class="detail-tag">${tx.freq}</span>
            <span class="detail-tag">${tx.band}</span>
            ${tx.powerKW ? `<span class="detail-tag">${tx.powerKW} kW</span>` : ''}
          </div>
        </div>
        <div class="detail-header-actions">
          <button class="detail-action-btn settings-btn" id="settings-btn" aria-label="Configuración">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Configuración
          </button>
          <button class="detail-action-btn close-btn" id="close-btn" aria-label="Cerrar detalle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="detail-location">
        <span class="detail-location-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </span>
        <span>${tx.municipio}</span>
        <span class="detail-location-coords">${tx.lat.toFixed(4)}°, ${tx.lon.toFixed(4)}°</span>
      </div>

      <div class="detail-body">
        <div class="d-area-metrics" id="detail-metrics"></div>
        <div class="d-area-phase" id="detail-phase"></div>
        <div class="d-area-equipment" id="detail-equipment-wrapper">
          <div id="detail-equipment-list"></div>
        </div>
        <div class="d-area-events">
          <div class="detail-events-card">
            <div class="detail-events-header">
              <span class="detail-events-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <span class="detail-events-title">Eventos recientes</span>
            </div>
            <div class="detail-events-list" id="detail-events-list"></div>
          </div>
        </div>
        <div class="d-area-history">
          <div class="detail-history-card">
            <div class="detail-history-header">
              <span class="detail-history-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </span>
              <span class="detail-history-title">Historial</span>
            </div>
            <div class="detail-history-charts">
              ${chartSkeletonHtml('chart-power', 'Potencia (%)')}
              ${chartSkeletonHtml('chart-vswr', 'ROE (VSWR)')}
              ${chartSkeletonHtml('chart-temp', 'Temperatura (°C)')}
            </div>
          </div>
        </div>
      </div>
    `;
    overlay.classList.add('open');
    document.getElementById('close-btn').addEventListener('click', closeDetail);
    document.getElementById('settings-btn').addEventListener('click', () => openSettings(id));

    chartInstances.power = mountLineChart('chart-power');
    chartInstances.vswr = mountLineChart('chart-vswr');
    chartInstances.temp = mountLineChart('chart-temp');
  }

  // Actualizar contenido dinámico
  document.getElementById('detail-metrics').innerHTML = metricsHtml(tx, s);
  document.getElementById('detail-phase').innerHTML = phaseHtml(tx);
  document.getElementById('detail-events-list').innerHTML = eventsListHtml(id);

  const equipListEl = document.getElementById('detail-equipment-list');
  equipListEl.innerHTML = equipmentListHtml(tx);
  equipListEl.querySelectorAll('[data-equip-on]').forEach(el => {
    el.addEventListener('change', () => toggleEquipmentOn(id, el.dataset.equipOn));
  });

  updateLineChart(chartInstances.power, 'chart-power', tx.history.power, tx.thresholds.powerMin, 'var(--phosphor)', v => v.toFixed(0) + '%');
  updateLineChart(chartInstances.vswr, 'chart-vswr', tx.history.vswr, tx.thresholds.vswrMax, 'var(--amber)', v => v.toFixed(2) + ':1');
  updateLineChart(chartInstances.temp, 'chart-temp', tx.history.temp, tx.thresholds.tempMax, 'var(--red)', v => v.toFixed(0) + '°C');
}

export function updateDetailValues(id) {
  if (openDetailId !== id) return;
  const tx = state[id];
  const s = statusOf(tx);

  const metricsEl = document.getElementById('detail-metrics');
  if (metricsEl) metricsEl.innerHTML = metricsHtml(tx, s);

  const phaseEl = document.getElementById('detail-phase');
  if (phaseEl) phaseEl.innerHTML = phaseHtml(tx);

  const eventsEl = document.getElementById('detail-events-list');
  if (eventsEl) eventsEl.innerHTML = eventsListHtml(id);

  const equipListEl = document.getElementById('detail-equipment-list');
  if (equipListEl) {
    equipListEl.innerHTML = equipmentListHtml(tx);
    equipListEl.querySelectorAll('[data-equip-on]').forEach(el => {
      el.addEventListener('change', () => toggleEquipmentOn(id, el.dataset.equipOn));
    });
  }

  updateLineChart(chartInstances.power, 'chart-power', tx.history.power, tx.thresholds.powerMin, 'var(--phosphor)', v => v.toFixed(0) + '%');
  updateLineChart(chartInstances.vswr, 'chart-vswr', tx.history.vswr, tx.thresholds.vswrMax, 'var(--amber)', v => v.toFixed(2) + ':1');
  updateLineChart(chartInstances.temp, 'chart-temp', tx.history.temp, tx.thresholds.tempMax, 'var(--red)', v => v.toFixed(0) + '°C');
}

export function closeDetail() {
  disposeCharts();
  openDetailId = null;
  document.getElementById('overlay').classList.remove('open');
}