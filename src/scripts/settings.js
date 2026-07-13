// src/scripts/settings.js
import { state } from './state.js';
import { EQUIPMENT_LABELS, EQUIPMENT_KEYS } from './data/stations.js';
import { renderAll } from './controls.js';
import { showToast } from './toast.js';

export let settingsOpenId = null;
let settingsChanged = false;
let currentSettingsId = null;

// --- FUNCIÓN PRINCIPAL: abre el modal SOLO si es necesario ---
export function openSettings(id) {
  // Si ya está abierto el mismo transmisor, NO regenerar el HTML
  if (settingsOpenId === id && document.getElementById('settings-content').innerHTML !== '') {
    // Solo actualizar los valores de los inputs sin regenerar todo
    updateSettingsValues(id);
    return;
  }

  settingsOpenId = id;
  currentSettingsId = id;
  settingsChanged = false;
  const tx = state[id];
  const content = document.getElementById('settings-content');

  // --- GENERAR HTML ---
  const equipRows = EQUIPMENT_KEYS.map(key => {
    const eq = tx.equipment[key];
    const label = EQUIPMENT_LABELS[key];
    const installed = eq.installed;
    return `
      <div class="equip-row ${installed ? '' : 'equip-off'}" data-equip-row="${key}">
        <div class="equip-name">${label.name}<span class="sub">${label.sub}</span></div>
        <label class="switch">
          <input type="checkbox" ${installed ? 'checked' : ''} data-equip-install="${key}">
          <span class="slider"></span>
        </label>
      </div>`;
  }).join('');

  const phaseToggles = tx.config.phaseMonitoring === 0 ? `
    <p style="font-family:var(--mono); font-size:11px; color:var(--text-dim); margin:8px 0 0;">
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
    <div class="detail-header settings-header">
      <div>
        <h2>Configuración</h2>
        <p class="detail-freq" style="margin:2px 0 0;">${tx.shortName} (${tx.call}) · ${tx.municipio}</p>
      </div>
      <button class="close-btn settings-close-btn" aria-label="Cerrar configuración" id="settings-close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="settings-body">
      <div class="settings-column">
        <div class="settings-section">
          <p class="section-title">Parámetros de operación</p>
          <p style="font-family:var(--mono); font-size:9px; color:var(--text-dim); margin:-4px 0 12px;">
            Ajusta los límites de alerta para este transmisor
          </p>
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
        </div>

        <div class="settings-section">
          <p class="section-title">Monitoreo de fase</p>
          <p style="font-family:var(--mono); font-size:9px; color:var(--text-dim); margin:-4px 0 12px;">
            Configura el número de fases y su estado
          </p>
          <div class="threshold-box" style="margin-bottom:12px;">
            <label>Fases instaladas</label>
            <select data-phase-config style="width:100%; background:var(--panel); border:1px solid var(--panel-line); border-radius:4px; color:var(--text); font-family:var(--mono); font-size:12px; padding:4px 6px;">
              <option value="0" ${tx.config.phaseMonitoring === 0 ? 'selected' : ''}>Sin monitoreo</option>
              <option value="1" ${tx.config.phaseMonitoring === 1 ? 'selected' : ''}>1 fase (monofásico)</option>
              <option value="2" ${tx.config.phaseMonitoring === 2 ? 'selected' : ''}>2 fases (bifásico)</option>
            </select>
          </div>
          <div style="margin-bottom:0;">${phaseToggles}</div>
        </div>
      </div>

      <div class="settings-column">
        <div class="settings-section">
          <p class="section-title">Cadena de equipos</p>
          <p style="font-family:var(--mono); font-size:9px; color:var(--text-dim); margin:-4px 0 12px;">
            Activa cada equipo que realmente exista en este transmisor
          </p>
          <div>${equipRows}</div>
        </div>
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn-secondary" id="settings-cancel-btn">Cancelar</button>
      <button class="btn-primary" id="settings-save-btn">Guardar cambios</button>
    </div>
  `;

  // --- ABRIR MODAL ---
  document.getElementById('settings-overlay').classList.add('open');
  
  // --- CONECTAR EVENTOS (SOLO UNA VEZ) ---
  attachSettingsEvents(id);
}

// --- ACTUALIZAR SOLO LOS VALORES (sin regenerar HTML) ---
function updateSettingsValues(id) {
  const tx = state[id];
  const content = document.getElementById('settings-content');
  if (!content) return;

  // Actualizar umbrales
  content.querySelectorAll('[data-threshold]').forEach(el => {
    const field = el.dataset.threshold;
    if (tx.thresholds[field] !== undefined) {
      el.value = tx.thresholds[field];
    }
  });

  // Actualizar equipos
  content.querySelectorAll('[data-equip-install]').forEach(el => {
    const key = el.dataset.equipInstall;
    if (tx.equipment[key]) {
      el.checked = tx.equipment[key].installed;
      const row = el.closest('.equip-row');
      if (row) {
        row.classList.toggle('equip-off', !tx.equipment[key].installed);
      }
    }
  });

  // Actualizar fases
  content.querySelectorAll('[data-phase]').forEach(el => {
    const key = el.dataset.phase;
    if (tx[key] !== undefined) {
      el.checked = tx[key];
    }
  });

  // Actualizar selector de fases
  const phaseConfig = content.querySelector('[data-phase-config]');
  if (phaseConfig) {
    phaseConfig.value = tx.config.phaseMonitoring;
  }

  // Actualizar dots de fase
  updatePhaseDots(id);
}

// --- CONECTAR EVENTOS ---
function attachSettingsEvents(id) {
  const content = document.getElementById('settings-content');
  if (!content) return;

  // Botones
  document.getElementById('settings-close-btn')?.addEventListener('click', closeSettingsWithAnimation);
  document.getElementById('settings-cancel-btn')?.addEventListener('click', closeSettingsWithAnimation);
  document.getElementById('settings-save-btn')?.addEventListener('click', () => saveSettingsAndClose(id));

  // Equipos - cambiar estado SIN renderAll()
  content.querySelectorAll('[data-equip-install]').forEach(el => {
    el.removeEventListener('change', handleEquipChange);
    el.addEventListener('change', handleEquipChange);
  });

  // Fases - cambiar estado SIN renderAll()
  content.querySelectorAll('[data-phase]').forEach(el => {
    el.removeEventListener('change', handlePhaseChange);
    el.addEventListener('change', handlePhaseChange);
  });

  // Umbrales - cambiar estado SIN renderAll()
  content.querySelectorAll('[data-threshold]').forEach(el => {
    el.removeEventListener('change', handleThresholdChange);
    el.addEventListener('change', handleThresholdChange);
  });

  // Selector de fases
  const phaseConfig = content.querySelector('[data-phase-config');
  if (phaseConfig) {
    phaseConfig.removeEventListener('change', handlePhaseConfigChange);
    phaseConfig.addEventListener('change', handlePhaseConfigChange);
  }

  // Marcar cambios en cualquier input
  content.querySelectorAll('input, select').forEach(el => {
    el.removeEventListener('change', markSettingsChanged);
    el.removeEventListener('input', markSettingsChanged);
    el.addEventListener('change', markSettingsChanged);
    el.addEventListener('input', markSettingsChanged);
  });
}

// --- MANEJADORES DE EVENTOS (modifican state SIN renderAll) ---
function handleEquipChange(e) {
  const id = currentSettingsId;
  const key = e.target.dataset.equipInstall;
  state[id].equipment[key].installed = !state[id].equipment[key].installed;
  if (!state[id].equipment[key].installed) state[id].equipment[key].on = false;
  // Actualizar visualmente la fila
  const row = e.target.closest('.equip-row');
  if (row) row.classList.toggle('equip-off', !state[id].equipment[key].installed);
  markSettingsChanged();
}

function handlePhaseChange(e) {
  const id = currentSettingsId;
  const key = e.target.dataset.phase;
  state[id][key] = !state[id][key];
  updatePhaseDots(id);
  markSettingsChanged();
}

function handleThresholdChange(e) {
  const id = currentSettingsId;
  const field = e.target.dataset.threshold;
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) state[id].thresholds[field] = v;
  markSettingsChanged();
}

function handlePhaseConfigChange(e) {
  const id = currentSettingsId;
  const value = parseInt(e.target.value);
  state[id].config.phaseMonitoring = value;
  markSettingsChanged();
  // Recargar SOLO la sección de fases (no todo el modal)
  refreshPhaseSection(id);
}

// --- REFRESCAR SOLO LA SECCIÓN DE FASES ---
function refreshPhaseSection(id) {
  const tx = state[id];
  const phaseContainer = document.querySelector('#settings-content .settings-section:nth-child(2)');
  if (!phaseContainer) return;

  const phaseToggles = tx.config.phaseMonitoring === 0 ? `
    <p style="font-family:var(--mono); font-size:11px; color:var(--text-dim); margin:8px 0 0;">
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

  // Reemplazar solo el contenido de fase
  const phaseContent = phaseContainer.querySelector('div:last-child');
  if (phaseContent) {
    phaseContent.innerHTML = phaseToggles;
    // Reconectar eventos de fase
    phaseContent.querySelectorAll('[data-phase]').forEach(el => {
      el.addEventListener('change', handlePhaseChange);
      el.addEventListener('change', markSettingsChanged);
    });
  }
}

// --- ACTUALIZAR DOTS DE FASE ---
function updatePhaseDots(id) {
  const tx = state[id];
  const dots = document.querySelectorAll('#settings-content .dot');
  if (dots.length >= 1) {
    dots[0].className = `dot dot-${tx.phaseA ? 'ok' : 'crit'}`;
  }
  if (dots.length >= 2) {
    dots[1].className = `dot dot-${tx.phaseB ? 'ok' : 'crit'}`;
  }
}

// --- MARCAR CAMBIOS ---
function markSettingsChanged() {
  settingsChanged = true;
  const saveBtn = document.getElementById('settings-save-btn');
  if (saveBtn) {
    saveBtn.classList.add('has-changes');
  }
}

// --- CERRAR MODAL ---
export function closeSettings() {
  settingsOpenId = null;
  currentSettingsId = null;
  settingsChanged = false;
  document.getElementById('settings-overlay').classList.remove('open');
}

function closeSettingsWithAnimation() {
  const content = document.getElementById('settings-content');
  
  if (settingsChanged) {
    if (confirm('Tienes cambios sin guardar. ¿Seguro que quieres cerrar?')) {
      content.classList.add('settings-closing');
      setTimeout(() => {
        closeSettings();
        content.classList.remove('settings-closing');
      }, 300);
    }
  } else {
    content.classList.add('settings-closing');
    setTimeout(() => {
      closeSettings();
      content.classList.remove('settings-closing');
    }, 300);
  }
}

// --- GUARDAR Y CERRAR ---
function saveSettingsAndClose(id) {
  import('./persist.js').then(({ saveConfig }) => {
    saveConfig(state);
  });
  
  renderAll();
  showToast('Configuración guardada correctamente', 'success');
  
  settingsChanged = false;
  const saveBtn = document.getElementById('settings-save-btn');
  if (saveBtn) {
    saveBtn.classList.remove('has-changes');
  }
  
  closeSettingsWithAnimation();
}