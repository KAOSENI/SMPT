// Ventana de datos de un transmisor (solo lectura + encendido/apagado de equipos
// YA instalados). Habilitar/deshabilitar equipos vive en settings.js.
//
// IMPORTANTE sobre las gráficas: el panel se separa en dos partes.
//   - "Cascarón" (header, botones, contenedores de gráfica): se construye
//     UNA sola vez, solo cuando se abre un transmisor DISTINTO al que ya
//     estaba mostrándose. Las gráficas viven aquí y nunca se destruyen
//     mientras siga abierto el mismo transmisor.
//   - Contenido de "#detail-metrics", "#detail-phase", "#detail-equipment-list"
//     y "#detail-events-list" (dentro de .detail-body): esto sí se reescribe
//     en cada tick, porque son textos/colores que cambian seguido y no
//     producen parpadeo visible al hacerlo. Están separados en 4 contenedores
//     (en vez de uno solo) para poder acomodarlos en 2 columnas en pantallas
//     anchas vía CSS Grid (ver .detail-body en modal.css) sin afectar el
//     cascarón de las gráficas.
// Antes TODO el panel —incluidas las gráficas— se reescribía en cada tick,
// lo que forzaba a los SVG de las gráficas a destruirse y recrearse cada
// 1.5s (de ahí el parpadeo). Separar ambas partes lo evita de raíz.

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

// Cada función devuelve el HTML de UN área del layout (ver detail-body en
// openDetail). Separadas para poder acomodarlas en columnas distintas en
// pantallas anchas sin depender del orden en el que aparecen en el DOM
// (eso lo resuelve el CSS Grid con grid-template-areas en modal.css).

function metricsHtml(tx, s) {
  return `
    <div class="detail-grid">
      <div class="metric-box"><div class="metric-label">Potencia de salida</div><div class="metric-value" style="color:${tx.power < tx.thresholds.powerMin ? 'var(--amber)' : 'var(--phosphor)'}">${tx.power.toFixed(1)}%</div></div>
      <div class="metric-box"><div class="metric-label">ROE (VSWR)</div><div class="metric-value" style="color:${tx.vswr > tx.thresholds.vswrMax + 0.3 ? 'var(--red)' : tx.vswr > tx.thresholds.vswrMax ? 'var(--amber)' : 'var(--phosphor)'}">${tx.vswr.toFixed(2)}:1</div></div>
      <div class="metric-box"><div class="metric-label">Temperatura</div><div class="metric-value" style="color:${tx.temp > tx.thresholds.tempMax + 8 ? 'var(--red)' : tx.temp > tx.thresholds.tempMax ? 'var(--amber)' : 'var(--phosphor)'}">${tx.temp.toFixed(1)}°C</div></div>
      <div class="metric-box"><div class="metric-label">Estado</div><div class="metric-value" style="color:${s === 'crit' ? 'var(--red)' : s === 'warn' ? 'var(--amber)' : 'var(--phosphor)'}">${s === 'ok' ? 'Normal' : s === 'warn' ? 'Advertencia' : 'Crítico'}</div></div>
    </div>`;
}

function phaseHtml(tx) {
  let phaseSummary;
  if (tx.config.phaseMonitoring === 0) {
    phaseSummary = `
      <p style="font-family:var(--mono); font-size:11px; color:var(--text-dim); margin:0; padding:8px 10px; background:var(--surface-2); border:1px solid var(--panel-line); border-radius:5px;">
        Este transmisor no tiene monitoreo de fase eléctrica configurado.
      </p>`;
  } else {
    phaseSummary = `
      <div class="phase-row" style="margin-bottom:0;">
        <div class="phase-box">
          <span class="phase-label"><span class="dot dot-${tx.phaseA ? 'ok' : 'crit'}" style="margin-top:0;"></span>${tx.config.phaseMonitoring === 1 ? 'Fase (monofásico)' : 'Fase A'}</span>
          <span style="font-family:var(--mono); font-size:10px; color:var(--text-dim);">${tx.phaseA ? 'Operativa' : 'Caída'}</span>
        </div>
        ${tx.config.phaseMonitoring === 2 ? `
        <div class="phase-box">
          <span class="phase-label"><span class="dot dot-${tx.phaseB ? 'ok' : 'crit'}" style="margin-top:0;"></span>Fase B</span>
          <span style="font-family:var(--mono); font-size:10px; color:var(--text-dim);">${tx.phaseB ? 'Operativa' : 'Caída'}</span>
        </div>` : ''}
      </div>`;
  }
  return `<p class="section-title">Alimentación eléctrica</p>${phaseSummary}`;
}

function equipmentListHtml(tx) {
  const anyInstalled = Object.values(tx.equipment).some(e => e.installed);
  if (!anyInstalled) {
    return `
      <div class="info-note">
        <strong>Ningún equipo ha sido instalado en este transmisor.</strong><br>
        Ve a <strong>Configuración</strong> para habilitar los componentes que realmente existen en este transmisor.
        Solo los equipos habilitados aparecerán aquí y podrán ser monitoreados/controlados.
      </div>`;
  }
  const rows = EQUIPMENT_KEYS.map(key => {
    const eq = tx.equipment[key];
    const label = EQUIPMENT_LABELS[key];
    if (!eq.installed) {
      return `
        <div class="equip-row equip-not-installed">
          <div class="equip-name">${label.name}<span class="sub">${label.sub}</span></div>
          <span class="badge-not-installed">No instalado</span>
        </div>`;
    }
    const on = eq.on;
    return `
      <div class="equip-row">
        <div class="equip-name">${label.name}<span class="sub">${label.sub}</span></div>
        <label class="switch">
          <input type="checkbox" ${on ? 'checked' : ''} data-equip-on="${key}">
          <span class="slider"></span>
        </label>
      </div>`;
  }).join('');
  return `<div style="margin-bottom:0;">${rows}</div>`;
}

function eventsListHtml(id) {
  const txEvents = eventLog.filter(e => e.txId === id).slice(0, 5);
  return txEvents.length > 0 ? txEvents.map(e => `
    <li><span class="t">${e.timeStr}</span>${e.message}</li>
  `).join('') : `<li style="color:var(--text-dim);">No hay eventos recientes para este transmisor.</li>`;
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
        <div>
          <h2>${tx.shortName}</h2>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="close-btn" aria-label="Configuración de este transmisor" id="settings-btn" style="width:auto; padding:0 10px; font-size:11px; font-family:var(--sans);">Configuración</button>
          <button class="close-btn" aria-label="Cerrar detalle" id="close-btn">✕</button>
        </div>
      </div>
      <p class="detail-freq">${tx.call} · ${tx.freq} · ${tx.band} · ${tx.municipio}${tx.powerKW ? ` · ${tx.powerKW} kW autorizados` : ''} · en operación ${tx.uptime}h</p>
      <p class="detail-freq" style="margin-top:-12px; opacity:0.6; font-size:11px;">Coordenadas: ${tx.lat.toFixed(4)}, ${tx.lon.toFixed(4)}</p>

      <div class="detail-body">
        <div class="d-area-metrics" id="detail-metrics"></div>
        <div class="d-area-phase" id="detail-phase"></div>
        <div class="d-area-equipment">
          <p class="section-title">Cadena de equipos</p>
          <div id="detail-equipment-list"></div>
        </div>
        <div class="d-area-events">
          <p class="section-title">Eventos recientes</p>
          <ul class="log-list" id="detail-events-list"></ul>
        </div>
        <div class="d-area-history">
          <p class="section-title">Historial</p>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${chartSkeletonHtml('chart-power', 'Potencia (%)')}
            ${chartSkeletonHtml('chart-vswr', 'ROE (VSWR)')}
            ${chartSkeletonHtml('chart-temp', 'Temperatura (°C)')}
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

  // Esto corre SIEMPRE (apertura nueva o refresco por tick): solo texto/colores,
  // no toca las gráficas ni el resto del cascarón (ni la disposición del layout).
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

export function closeDetail() {
  disposeCharts();
  openDetailId = null;
  document.getElementById('overlay').classList.remove('open');
}