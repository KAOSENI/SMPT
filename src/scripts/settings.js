// Ventana auxiliar de Configuración: aquí viven todos los controles editables
// (umbrales, número de fases, qué equipos están instalados). Separada de la
// ventana de datos (detail.js) para no saturarla — ver openDetail().

import { state } from './state.js';
import { EQUIPMENT_LABELS, EQUIPMENT_KEYS } from './data/stations.js';
import { toggleEquipmentInstalled, togglePhase, updatePhaseMonitoring, updateThreshold } from './controls.js';

export let settingsOpenId = null;

export function openSettings(id) {
  settingsOpenId = id;
  const tx = state[id];
  const content = document.getElementById('settings-content');

  const equipRows = EQUIPMENT_KEYS.map(key => {
    const eq = tx.equipment[key];
    const label = EQUIPMENT_LABELS[key];
    const installed = eq.installed;
    return `
      <div class="equip-row ${installed ? '' : 'equip-off'}">
        <div class="equip-name">${label.name}<span class="sub">${label.sub}</span></div>
        <label class="switch">
          <input type="checkbox" ${installed ? 'checked' : ''} data-equip-install="${key}">
          <span class="slider"></span>
        </label>
      </div>`;
  }).join('');

  const phaseToggles = tx.config.phaseMonitoring === 0 ? `
    <p style="font-family:var(--mono); font-size:11px; color:var(--text-dim); margin:0;">
      Activa el monitoreo de fases arriba para poder encenderlas/apagarlas aquí.
    </p>` : `
    <div class="phase-row" style="margin-bottom:0;">
      <div class="phase-box">
        <span class="phase-label"><span class="dot dot-${tx.phaseA ? 'ok' : 'crit'}" style="margin-top:0;"></span>${tx.config.phaseMonitoring === 1 ? 'Fase (monofásico)' : 'Fase A'}</span>
        <label class="switch">
          <input type="checkbox" ${tx.phaseA ? 'checked' : ''} data-phase="phaseA">
          <span class="slider"></span>
        </label>
      </div>
      ${tx.config.phaseMonitoring === 2 ? `
      <div class="phase-box">
        <span class="phase-label"><span class="dot dot-${tx.phaseB ? 'ok' : 'crit'}" style="margin-top:0;"></span>Fase B</span>
        <label class="switch">
          <input type="checkbox" ${tx.phaseB ? 'checked' : ''} data-phase="phaseB">
          <span class="slider"></span>
        </label>
      </div>` : ''}
    </div>`;

  content.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>Configuración</h2>
        <p class="detail-freq" style="margin:2px 0 0;">${tx.shortName} (${tx.call})</p>
      </div>
      <button class="close-btn" aria-label="Volver al detalle" id="settings-close-btn">✕</button>
    </div>

    <p class="section-title">Parámetros normales</p>
    <div class="threshold-grid">
      <div class="threshold-box">
        <label>Potencia mínima (%)</label>
        <input type="number" step="1" min="0" max="100" value="${tx.thresholds.powerMin}" data-threshold="powerMin">
      </div>
      <div class="threshold-box">
        <label>ROE máximo</label>
        <input type="number" step="0.05" min="1" max="3" value="${tx.thresholds.vswrMax}" data-threshold="vswrMax">
      </div>
      <div class="threshold-box">
        <label>Temperatura máxima (°C)</label>
        <input type="number" step="1" min="20" max="80" value="${tx.thresholds.tempMax}" data-threshold="tempMax">
      </div>
    </div>

    <p class="section-title">Monitoreo de fase eléctrica</p>
    <div class="threshold-box" style="margin-bottom:12px;">
      <label>Fases instaladas</label>
      <select data-phase-config style="width:100%; background:var(--panel); border:1px solid var(--panel-line); border-radius:4px; color:var(--text); font-family:var(--mono); font-size:12px; padding:4px 6px;">
        <option value="0" ${tx.config.phaseMonitoring === 0 ? 'selected' : ''}>Sin monitoreo</option>
        <option value="1" ${tx.config.phaseMonitoring === 1 ? 'selected' : ''}>1 fase (monofásico)</option>
        <option value="2" ${tx.config.phaseMonitoring === 2 ? 'selected' : ''}>2 fases (bifásico)</option>
      </select>
    </div>
    <div style="margin-bottom:18px;">${phaseToggles}</div>

    <p class="section-title">Cadena de equipos</p>
    <p style="font-family:var(--mono); font-size:9px; color:var(--text-dim); margin:-4px 0 10px;">
      Activa cada equipo que realmente exista en este transmisor.
    </p>
    <div>${equipRows}</div>
  `;

  document.getElementById('settings-overlay').classList.add('open');
  document.getElementById('settings-close-btn').addEventListener('click', closeSettings);
  content.querySelectorAll('[data-equip-install]').forEach(el => {
    el.addEventListener('change', () => toggleEquipmentInstalled(id, el.dataset.equipInstall));
  });
  content.querySelectorAll('[data-phase]').forEach(el => {
    el.addEventListener('change', () => togglePhase(id, el.dataset.phase));
  });
  content.querySelectorAll('[data-threshold]').forEach(el => {
    el.addEventListener('change', () => updateThreshold(id, el.dataset.threshold, el.value));
  });
  const phaseConfigEl = content.querySelector('[data-phase-config]');
  if (phaseConfigEl) phaseConfigEl.addEventListener('change', () => updatePhaseMonitoring(id, phaseConfigEl.value));
}

export function closeSettings() {
  settingsOpenId = null;
  document.getElementById('settings-overlay').classList.remove('open');
}
