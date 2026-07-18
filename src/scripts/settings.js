// src/scripts/settings.js
// Ventana de configuración de un transmisor independiente del panel de detalle.

import { state } from './state.js';
import { EQUIPMENT_LABELS, EQUIPMENT_KEYS } from './data/stations.js';
import { renderAll } from './controls.js';
import { showToast } from './toast.js';
import { renderInterfaceFields, saveInterfaceChangesSilently } from './layout-modal.js';
import { getLayoutPrefs } from './layout-prefs.js';
import { saveLayoutPrefs } from './persist.js';

export let settingsOpenId = null;
let settingsChanged = false;
let currentSettingsId = null;
let activeTab = 'interfaz';

// --- ESTADO PARA DETECTAR CAMBIOS EN SISTEMA ---
let systemState = {
  initial: null,
  currentId: null,
  hasChanges: false,
  initialTheme: 'light',
};

// Respaldo en memoria profunda para restaurar la interfaz si el usuario cancela
let backupInterfacePrefs = null;

// Iconos Lucide para los botones
const LUCIDE_ICONS = {
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg>`,
  rotate: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.25 2.25L3 8"/><path d="M3 3v5h5"/></svg>`,
  plusModal: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  trashModal: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg>`,
  rotateModal: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.25 2.25L3 8"/><path d="M3 3v5h5"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  gear: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  radioTower: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 9.5-5 5M9.14 5.5A5.5 5.5 0 0 1 17 9.36M17 14.5a5.5 5.5 0 0 1-7.86 3.86M4.5 9.5a10 10 0 0 1 3.5-6M19.5 14.5a10 10 0 0 1-3.5 6"/><circle cx="12" cy="12" r="1.5"/></svg>`,
};

function getLucideIcon(name) {
  return LUCIDE_ICONS[name] || '';
}

// --- FUNCIÓN PRINCIPAL ---
export function openSettings(id = null) {
  const overlay = document.getElementById('settings-overlay');
  const isOpen = overlay.classList.contains('open');

  if (isOpen) {
    if (typeof id === 'number' && id === currentSettingsId) {
      updateStationTabValues(id);
    }
    return;
  }

  if (typeof id === 'number') {
    activeTab = 'sistema';
    currentSettingsId = id;
  } else {
    activeTab = 'interfaz';
    if (currentSettingsId !== null && !state.some((s) => s.id === currentSettingsId)) {
      currentSettingsId = null;
    }
  }

  settingsOpenId = currentSettingsId;
  settingsChanged = false;
  systemState.hasChanges = false;
  systemState.currentId = currentSettingsId;

  systemState.initial = currentSettingsId !== null ? deepCloneState(currentSettingsId) : null;

  import('./theme.js').then(({ loadTheme }) => {
    systemState.initialTheme = loadTheme() || 'light';
  });

  import('./layout-prefs.js').then(({ getLayoutPrefs }) => {
    backupInterfacePrefs = JSON.parse(JSON.stringify(getLayoutPrefs()));
  });

  renderShell();
  overlay.classList.add('open');

  // Si se abre directo con un ID de transmisor, desplegamos su modal emergente
  if (currentSettingsId !== null) {
    openSubwindowModal(currentSettingsId);
  }
}

// --- FUNCIÓN PARA CLONAR EL ESTADO DE UN TRANSMISOR ---
function deepCloneState(id) {
  const tx = state.find(s => s.id === id);
  if (!tx) return null;
  return {
    thresholds: { ...tx.thresholds },
    equipment: Object.fromEntries(
      Object.entries(tx.equipment).map(([key, val]) => [
        key,
        { installed: val.installed, on: val.on }
      ])
    ),
    phaseA: tx.phaseA,
    phaseB: tx.phaseB,
    config: { phaseMonitoring: tx.config.phaseMonitoring },
  };
}

// --- FUNCIÓN PARA COMPARAR ESTADO ACTUAL CON INICIAL ---
function checkSystemChanges() {
  if (systemState.initial === null || systemState.currentId === null) {
    return false;
  }

  const current = state.find(s => s.id === systemState.currentId);
  if (!current) return false;
  const initial = systemState.initial;

  const thresholdsMatch = Object.keys(initial.thresholds).every(
    key => current.thresholds[key] === initial.thresholds[key]
  );

  const equipmentMatch = Object.keys(initial.equipment).every(
    key => current.equipment[key].installed === initial.equipment[key].installed
  );

  const phaseAMatch = current.phaseA === initial.phaseA;
  const phaseBMatch = current.phaseB === initial.phaseB;
  const configMatch = current.config.phaseMonitoring === initial.config.phaseMonitoring;

  const hasChanges = !(thresholdsMatch && equipmentMatch && phaseAMatch && phaseBMatch && configMatch);

  systemState.hasChanges = hasChanges;

  if (hasChanges) {
    settingsChanged = true;
    document.getElementById('settings-save-btn')?.classList.add('has-changes');
  } else {
    const saveBtn = document.getElementById('settings-save-btn');
    if (saveBtn) {
      const hasInterfaceChanges = checkInterfaceChanges();
      if (!hasInterfaceChanges) {
        settingsChanged = false;
        saveBtn.classList.remove('has-changes');
      }
    }
  }

  return hasChanges;
}

// --- VERIFICAR CAMBIOS EN INTERFAZ ---
function checkInterfaceChanges() {
  let hasChanges = false;
  try {
    const { getInterfaceChanges } = import('./layout-modal.js');
    const interfaceState = getInterfaceChanges();
    hasChanges = interfaceState.hasChanges;
  } catch (e) {}
  return hasChanges;
}

// --- REFRESCO LIVE ---
function updateStationTabValues(id) {
  // Busca elementos tanto en el panel base como en el modal emergente activo
  const containers = [
    document.querySelector('[data-settings-pane="sistema"]'),
    document.getElementById('station-modal-overlay')
  ];

  const tx = state.find(s => s.id === id);
  if (!tx) return;

  containers.forEach(pane => {
    if (!pane) return;

    pane.querySelectorAll('[data-threshold]').forEach((el) => {
      const field = el.dataset.threshold;
      if (tx.thresholds[field] !== undefined) el.value = tx.thresholds[field];
    });

    pane.querySelectorAll('[data-equip-install]').forEach((el) => {
      const key = el.dataset.equipInstall;
      if (tx.equipment[key]) {
        el.checked = tx.equipment[key].installed;
        el.closest('.equip-row')?.classList.toggle('equip-off', !tx.equipment[key].installed);
      }
    });

    pane.querySelectorAll('[data-phase]').forEach((el) => {
      const key = el.dataset.phase;
      if (tx[key] !== undefined) el.checked = tx[key];
    });

    const phaseConfig = pane.querySelector('[data-phase-config]');
    if (phaseConfig) phaseConfig.value = tx.config.phaseMonitoring;
  });

  updatePhaseDots(id);
}

// --- CASCARÓN ---
function renderShell() {
  const content = document.getElementById('settings-content');

  content.innerHTML = `
    <div class="detail-header settings-header">
      <div><h2>Configuración</h2></div>
      <button class="close-btn settings-close-btn" aria-label="Cerrar configuración" id="settings-close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="settings-tabs" role="tablist">
      <button class="settings-tab-btn" data-settings-tab="interfaz" role="tab">Interfaz</button>
      <button class="settings-tab-btn" data-settings-tab="sistema" role="tab">Sistema y transmisores</button>
    </div>

    <div class="settings-tab-pane" data-settings-pane="interfaz"></div>
    <div class="settings-tab-pane" data-settings-pane="sistema"></div>

    <div class="settings-footer">
      <button class="btn-secondary" id="settings-cancel-btn">Cancelar</button>
      <button class="btn-primary" id="settings-save-btn">Guardar cambios</button>
    </div>
  `;

  document.getElementById('settings-close-btn').addEventListener('click', closeSettingsWithAnimation);
  document.getElementById('settings-cancel-btn').addEventListener('click', closeSettingsWithAnimation);
  document.getElementById('settings-save-btn').addEventListener('click', saveSettingsAndClose);

  content.querySelectorAll('[data-settings-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.settingsTab));
  });

  renderInterfaceFields(content.querySelector('[data-settings-pane="interfaz"]'));
  renderStationTab(currentSettingsId);

  switchTab(activeTab);

  setTimeout(checkSystemChanges, 0);
}

function switchTab(tab) {
  activeTab = tab;
  const content = document.getElementById('settings-content');
  content.querySelectorAll('[data-settings-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.settingsTab === tab);
  });
  content.querySelectorAll('[data-settings-pane]').forEach((pane) => {
    pane.classList.toggle('active', pane.dataset.settingsPane === tab);
  });

  if (tab === 'sistema') {
    checkSystemChanges();
  }
}

// --- PESTAÑA "SISTEMA Y TRANSMISORES" ---
function renderStationTab(id) {
  const pane = document.querySelector('[data-settings-pane="sistema"]');
  if (!pane) return;

  if (id !== null && !state.some((s) => s.id === id)) {
    id = null;
    currentSettingsId = null;
    settingsOpenId = null;
  }

  const rows = state.map((s) => {
    const bandClass = s.band === 'AM' ? 'band-am' : 'band-fm';
    return `
      <div class="station-list-item ${s.id === id ? 'selected' : ''}" data-station-row="${s.id}">
        <span class="station-call">${s.call}</span>
        <span class="station-name">${s.shortName || s.name}</span>
        <span class="station-band ${bandClass}">${s.band || 'FM'}</span>
        <button class="station-config-btn" data-station-config="${s.id}" title="Configurar ${s.shortName || s.name}" aria-label="Configurar ${s.shortName || s.name}">
          ${getLucideIcon('gear')}
        </button>
      </div>`;
  }).join('');

  pane.innerHTML = `
    <div class="station-list-container">
      <div class="station-list-header">
        <span class="station-list-title">${getLucideIcon('radioTower')} Transmisores</span>
        <span class="station-list-count">${state.length} total</span>
      </div>
      <div class="station-list">${rows}</div>
      <div class="station-list-actions">
        <button class="btn-secondary" id="add-station-btn" style="flex:1; display:flex; align-items:center; gap:6px; justify-content:center;">
          ${getLucideIcon('plus')} Agregar transmisor
        </button>
        <button class="btn-secondary" id="reset-stations-btn" style="flex:1; display:flex; align-items:center; gap:6px; justify-content:center;">
          ${getLucideIcon('rotate')} Restaurar por defecto
        </button>
      </div>
    </div>
  `;

  // Al hacer clic en un elemento de la lista se abre la ventana emergente individual
  pane.querySelectorAll('[data-station-row]').forEach((row) => {
    row.addEventListener('click', () => {
      const newId = parseInt(row.dataset.stationRow, 10);
      confirmDiscardIfChanged(() => {
        currentSettingsId = newId;
        settingsOpenId = newId;
        systemState.currentId = newId;
        systemState.initial = deepCloneState(newId);
        systemState.hasChanges = false;
        settingsChanged = false;
        document.getElementById('settings-save-btn')?.classList.remove('has-changes');
        
        openSubwindowModal(newId);
      });
    });
  });

  document.getElementById('add-station-btn')?.addEventListener('click', () => {
    showAddStationForm();
  });

  document.getElementById('reset-stations-btn')?.addEventListener('click', () => {
    showPasswordModal('reset');
  });

  setTimeout(checkSystemChanges, 0);
}

// --- CONTROLADOR DE LA VENTANA EMERGENTE (MODAL) ---
function openSubwindowModal(id) {
  document.getElementById('station-modal-overlay')?.remove();

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'station-modal-overlay';
  modalOverlay.className = 'custom-confirm-overlay'; 
  modalOverlay.style.zIndex = '1100'; // Asegura quedar por encima de la configuración general

  modalOverlay.innerHTML = renderSubwindowHtml(id);
  document.body.appendChild(modalOverlay);

  wireSubwindowEvents(id);
}

// --- SUB-VENTANA DE CONFIGURACIÓN DE UN TRANSMISOR (RETORNA EL HTML DEL MODAL) ---
function renderSubwindowHtml(id) {
  const tx = state.find((s) => s.id === id);
  if (!tx) return '';

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

  return `
    <div class="custom-confirm-box" style="max-width: 680px !important; width: 100%;" data-subwindow-for="${id}">
      <div class="subwindow-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-line); padding-bottom: 12px; margin-bottom: 16px;">
        <span class="subwindow-title" style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
          ${getLucideIcon('gear')} Configuración: ${tx.shortName || tx.name}
          <span class="subwindow-call" style="font-size: 11px; font-family: var(--mono); background: var(--panel-line); padding: 2px 6px; border-radius: 4px;">${tx.call}</span>
        </span>
        <button class="subwindow-close-btn" id="subwindow-close-btn" aria-label="Cerrar configuración" style="background: none; border: none; color: var(--text); cursor: pointer; display: flex; align-items: center;">
          ${getLucideIcon('x')}
        </button>
      </div>

      <div class="subwindow-body" style="max-height: 60vh; overflow-y: auto; padding-right: 4px;">
        <div class="settings-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="settings-column">
            <div class="settings-section">
              <p class="section-title" style="font-weight: 600; margin-bottom: 4px;">Parámetros de operación</p>
              <p style="font-family:var(--mono); font-size:9px; color:var(--text-dim); margin:-4px 0 12px;">
                Ajusta los límites de alerta para este transmisor
              </p>
              <div class="threshold-grid" style="display: flex; flex-direction: column; gap: 10px;">
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

            <div class="settings-section" id="settings-phase-section" style="margin-top: 16px;">
              ${renderPhaseSectionHtml(tx)}
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-section">
              <p class="section-title" style="font-weight: 600; margin-bottom: 4px;">Cadena de equipos</p>
              <p style="font-family:var(--mono); font-size:9px; color:var(--text-dim); margin:-4px 0 12px;">
                Activa cada equipo que realmente exista en este transmisor
              </p>
              <div style="display: flex; flex-direction: column; gap: 6px;">${equipRows}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="subwindow-footer" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--panel-line); display: flex; justify-content: space-between; align-items: center;">
        <button class="btn-secondary" id="delete-station-btn" style="display:flex; align-items:center; gap:6px; color:var(--red, #e5484d); border-color:var(--red, #e5484d);">
          ${getLucideIcon('trash')} Eliminar transmisor
        </button>
        <button class="btn-primary" id="subwindow-accept-btn">Aceptar</button>
      </div>
    </div>
  `;
}

function wireSubwindowEvents(id) {
  const closeModal = () => {
    document.getElementById('station-modal-overlay')?.remove();
    currentSettingsId = null;
    settingsOpenId = null;
    systemState.currentId = null;
    systemState.initial = null;
    systemState.hasChanges = false;
    renderStationTab(null);
  };

  document.getElementById('subwindow-close-btn')?.addEventListener('click', () => {
    confirmDiscardIfChanged(closeModal);
  });

  document.getElementById('subwindow-accept-btn')?.addEventListener('click', () => {
    // Al dar Aceptar se conservan temporalmente los cambios en memoria. El modal se cierra de inmediato.
    document.getElementById('station-modal-overlay')?.remove();
    renderStationTab(null);
  });

  document.getElementById('delete-station-btn')?.addEventListener('click', () => {
    document.getElementById('station-modal-overlay')?.remove();
    showPasswordModal('eliminar');
  });

  attachStationEvents();
}

function renderPhaseSectionHtml(tx) {
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

  return `
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
  `;
}

function attachStationEvents() {
  // Escucha cambios tanto del listado como dentro del modal abierto
  const containers = [
    document.querySelector('[data-settings-pane="sistema"]'),
    document.getElementById('station-modal-overlay')
  ];

  containers.forEach(pane => {
    if (!pane) return;
    const allInputs = pane.querySelectorAll('input, select');
    allInputs.forEach((el) => {
      el.addEventListener('change', () => {
        handleFieldChange(el);
        checkSystemChanges();
      });
      el.addEventListener('input', () => {
        if (el.type === 'number') {
          handleFieldChange(el);
          checkSystemChanges();
        }
      });
    });
  });
}

// --- MANEJAR CAMBIO DE CAMPO EN MEMORIA ---
function handleFieldChange(el) {
  const id = currentSettingsId;
  const tx = state.find(s => s.id === id);
  if (!tx) return;

  if (el.dataset.equipInstall) {
    const key = el.dataset.equipInstall;
    tx.equipment[key].installed = el.checked;
    if (!tx.equipment[key].installed) tx.equipment[key].on = false;
    const row = el.closest('.equip-row');
    if (row) row.classList.toggle('equip-off', !tx.equipment[key].installed);
    return;
  }

  if (el.dataset.phase) {
    const key = el.dataset.phase;
    tx[key] = el.checked;
    updatePhaseDots(id);
    return;
  }

  if (el.dataset.threshold) {
    const field = el.dataset.threshold;
    const v = parseFloat(el.value);
    if (!isNaN(v)) tx.thresholds[field] = v;
    return;
  }

  if (el.dataset.phaseConfig) {
    const value = parseInt(el.value, 10);
    tx.config.phaseMonitoring = value;
    const section = document.getElementById('settings-phase-section');
    if (section) {
      section.innerHTML = renderPhaseSectionHtml(tx);
      section.querySelectorAll('input, select').forEach((newEl) => {
        newEl.addEventListener('change', () => {
          handleFieldChange(newEl);
          checkSystemChanges();
        });
        newEl.addEventListener('input', () => {
          if (newEl.type === 'number') {
            handleFieldChange(newEl);
            checkSystemChanges();
          }
        });
      });
    }
    return;
  }
}

function updatePhaseDots(id) {
  const tx = state.find(s => s.id === id);
  if (!tx) return;
  // Actualiza los dots reflectivos de fase tanto en el subwindow del modal como en el DOM general
  const dots = document.querySelectorAll('#station-modal-overlay .dot, [data-settings-pane="sistema"] .dot');
  if (dots.length >= 1) dots[0].className = `dot dot-${tx.phaseA ? 'ok' : 'crit'}`;
  if (dots.length >= 2) dots[1].className = `dot dot-${tx.phaseB ? 'ok' : 'crit'}`;
}

// --- FUNCIONES DE ESTADO DE CAMBIOS ---
export function markSettingsChanged() {
  settingsChanged = true;
  document.getElementById('settings-save-btn')?.classList.add('has-changes');
}

export function clearSettingsChanged() {
  settingsChanged = false;
  systemState.hasChanges = false;
  document.getElementById('settings-save-btn')?.classList.remove('has-changes');
}

// --- MODAL DE CONTRASEÑA ---
function showPasswordModal(action, payload = null) {
  document.getElementById('custom-password-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'custom-password-overlay';
  overlay.className = 'custom-confirm-overlay';

  const actionLabels = {
    agregar: 'Agregar nuevo transmisor',
    eliminar: 'Eliminar transmisor',
    reset: 'Restaurar transmisores por defecto'
  };

  const actionIcons = {
    agregar: getLucideIcon('plusModal'),
    eliminar: getLucideIcon('trashModal'),
    reset: getLucideIcon('rotateModal')
  };

  overlay.innerHTML = `
    <div class="custom-confirm-box">
      <h3 style="display:flex; align-items:center; gap:8px;">
        <span style="color:var(--phosphor);">${actionIcons[action]}</span>
        ${actionLabels[action]}
      </h3>
      <p style="margin-bottom:12px; font-family:var(--mono); font-size:13px; color:var(--text-dim);">
        La contraseña es: <strong style="color:var(--phosphor);">pass</strong>
      </p>
      <form onsubmit="event.preventDefault(); document.getElementById('password-confirm-btn')?.click();" style="margin:0;">
        <input type="text" name="username" autocomplete="username" style="display:none;" value="admin">
        <input type="password" id="password-input" placeholder="Contraseña" autocomplete="new-password"
          style="width:100%; padding:8px 12px; border:1px solid var(--panel-line); border-radius:6px;
          background:var(--panel); color:var(--text); font-family:var(--mono); font-size:13px;
          margin-bottom:12px; box-sizing:border-box;">
      </form>
      <div class="custom-confirm-buttons">
        <button class="btn-secondary" id="password-cancel-btn">Cancelar</button>
        <button class="btn-primary" id="password-confirm-btn">Confirmar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = document.getElementById('password-input');
  if (input) input.focus();

  document.getElementById('password-cancel-btn')?.addEventListener('click', () => {
    overlay.remove();
  });

  document.getElementById('password-confirm-btn')?.addEventListener('click', () => {
    if (input.value === 'pass') {
      overlay.remove();
      executeStationAction(action, payload);
    } else {
      input.value = '';
      input.placeholder = 'Contraseña incorrecta';
      input.style.borderColor = 'var(--red)';
      setTimeout(() => {
        input.placeholder = 'Contraseña';
        input.style.borderColor = 'var(--panel-line)';
      }, 1500);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('password-confirm-btn')?.click();
    }
    if (e.key === 'Escape') {
      overlay.remove();
    }
  });
}

// --- FORMULARIO "AGREGAR TRANSMISOR" ---
function showAddStationForm() {
  document.getElementById('add-station-form-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'add-station-form-overlay';
  overlay.className = 'custom-confirm-overlay';

  const field = (id, label, opts = {}) => `
    <div class="threshold-box">
      <label>${label}</label>
      <input type="${opts.type || 'text'}" id="${id}" ${opts.step ? `step="${opts.step}"` : ''} placeholder="${opts.placeholder || ''}" value="${opts.value ?? ''}">
    </div>`;

  overlay.innerHTML = `
    <div class="custom-confirm-box" style="max-width:560px !important;">
      <h3 style="display:flex; align-items:center; gap:8px;">
        <span style="color:var(--phosphor);">${getLucideIcon('plusModal')}</span>
        Agregar transmisor
      </h3>
      <form id="add-station-form" style="margin:0;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
          ${field('new-station-call', 'Indicativo', { placeholder: 'XHXXX-FM' })}
          ${field('new-station-name', 'Nombre', { placeholder: 'Radio Nuevo' })}
          <div class="threshold-box">
            <label>Banda</label>
            <select id="new-station-band" style="width:100%; background:var(--panel); border:1px solid var(--panel-line); border-radius:3px; color:var(--text); font-family:var(--mono); font-size:12px; padding:3px 6px;">
              <option value="FM">FM</option>
              <option value="AM">AM</option>
            </select>
          </div>
          ${field('new-station-freq', 'Frecuencia', { placeholder: '93.9 MHz' })}
          ${field('new-station-municipio', 'Municipio', { placeholder: 'Ciudad' })}
          ${field('new-station-power', 'Potencia (kW)', { type: 'number', step: '0.5', placeholder: '50' })}
          ${field('new-station-lat', 'Latitud', { type: 'number', step: '0.0001', placeholder: '16.7729' })}
          ${field('new-station-lon', 'Longitud', { type: 'number', step: '0.0001', placeholder: '-93.1281' })}
        </div>
      </form>
      <div class="custom-confirm-buttons">
        <button class="btn-secondary" id="add-station-form-cancel-btn">Cancelar</button>
        <button class="btn-primary" id="add-station-form-submit-btn">Agregar transmisor</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('new-station-call')?.focus();

  document.getElementById('add-station-form-cancel-btn')?.addEventListener('click', () => overlay.remove());

  document.getElementById('add-station-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('add-station-form-submit-btn')?.click();
  });

  document.getElementById('add-station-form-submit-btn')?.addEventListener('click', () => {
    const val = (id) => document.getElementById(id)?.value.trim();
    const num = (id) => {
      const v = document.getElementById(id)?.value;
      return v !== '' && v !== undefined ? parseFloat(v) : undefined;
    };

    const formData = {
      call: val('new-station-call') || undefined,
      name: val('new-station-name') || undefined,
      band: val('new-station-band') || 'FM',
      freqLabel: val('new-station-freq') || undefined,
      municipio: val('new-station-municipio') || undefined,
      powerKW: num('new-station-power'),
      lat: num('new-station-lat'),
      lon: num('new-station-lon'),
    };

    overlay.remove();
    showPasswordModal('agregar', formData);
  });
}

// --- EJECUTAR ACCIÓN SOBRE TRANSMISORES ---
function executeStationAction(action, payload = null) {
  import('./data/stations-manager.js').then(({ addStation, removeStation, resetToDefaultStations, getStations }) => {
    let result = null;
    let message = '';
    let newId = currentSettingsId;

    try {
      switch (action) {
        case 'agregar':
          const newStation = addStation(payload || {});
          result = newStation;
          message = `Transmisor "${newStation.name}" agregado correctamente`;
          break;
        case 'eliminar':
          removeStation(currentSettingsId);
          message = 'Transmisor eliminado correctamente';
          break;
        case 'reset':
          resetToDefaultStations();
          message = 'Transmisores restaurados a los valores por defecto';
          break;
      }
    } catch (e) {
      showToast(e.message, 'error');
      return;
    }

    // Reconstruir estado
    import('./state.js').then(({ rebuildState }) => {
      rebuildState();
      
      // Actualizaciones de componentes e interfaces
      import('./controls.js').then(({ renderAll }) => renderAll());
      
      import('./events.js').then(({ renderSidebarEvents, updateSidebarStats, cleanupEvents }) => {
        cleanupEvents();
        renderSidebarEvents();
        updateSidebarStats();
      });
      
      if (window.updateBarsChart) {
        window.updateBarsChart();
      }
      
      import('./map.js').then(({ renderGeoMap }) => renderGeoMap());
      
      import('./dashboard.js').then(({ updateDashboard, calculateMetrics }) => {
        const metrics = calculateMetrics(state);
        updateDashboard(metrics);
      });
      
      if (window.__refreshStatsModal) {
        window.__refreshStatsModal();
      }
      
      const stations = getStations();
      if (action === 'agregar' && result) {
        newId = result.id;
      } else {
        newId = null;
      }

      currentSettingsId = newId;
      settingsOpenId = newId;
      systemState.currentId = newId;
      systemState.initial = newId !== null ? deepCloneState(newId) : null;
      systemState.hasChanges = false;
      settingsChanged = false;
      document.getElementById('settings-save-btn')?.classList.remove('has-changes');
      
      renderStationTab(newId);
      
      // Si agregamos uno nuevo, le mostramos directamente su modal emergente para revisión rápida
      if (action === 'agregar' && newId !== null) {
        openSubwindowModal(newId);
      }

      showToast(message, 'success');
    });
  });
}

// --- CERRAR MODAL GLOBAL ---
export function closeSettings() {
  document.getElementById('station-modal-overlay')?.remove(); // Previene dejar modales huérfanos
  settingsOpenId = null;
  settingsChanged = false;
  systemState.hasChanges = false;
  systemState.initial = null;
  document.getElementById('settings-overlay').classList.remove('open');
}

async function confirmDiscardIfChanged(proceed) {
  const hasSystemChanges = checkSystemChanges();

  let hasInterfaceChanges = false;
  try {
    const { getInterfaceChanges } = await import('./layout-modal.js');
    const interfaceState = getInterfaceChanges();
    hasInterfaceChanges = interfaceState.hasChanges;
  } catch (e) {}

  if (!settingsChanged && !hasSystemChanges && !hasInterfaceChanges) {
    proceed();
    return;
  }

  document.getElementById('custom-confirm-overlay')?.remove();

  const confirmOverlay = document.createElement('div');
  confirmOverlay.id = 'custom-confirm-overlay';
  confirmOverlay.className = 'custom-confirm-overlay';

  confirmOverlay.innerHTML = `
    <div class="custom-confirm-box">
      <h3>Cambios sin guardar</h3>
      <p>Tienes modificaciones pendientes en la configuración. ¿Seguro que quieres continuar y descartar los cambios?</p>
      <div class="custom-confirm-buttons">
        <button class="btn-secondary" id="confirm-cancel-btn">Regresar</button>
        <button class="btn-primary" id="confirm-proceed-btn">Descartar</button>
      </div>
    </div>
  `;

  document.body.appendChild(confirmOverlay);

  document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
    confirmOverlay.remove();
  });

  document.getElementById('confirm-proceed-btn').addEventListener('click', () => {
    confirmOverlay.remove();

    if (backupInterfacePrefs) {
      import('./layout-prefs.js').then(({ getLayoutPrefs, applyLayout }) => {
        const prefs = getLayoutPrefs();
        prefs.visible = backupInterfacePrefs.visible;
        prefs.notificationPosition = backupInterfacePrefs.notificationPosition;
        prefs.order = backupInterfacePrefs.order;
        applyLayout();
      });
      import('./toast.js').then(({ applyNotificationPosition }) => {
        applyNotificationPosition(backupInterfacePrefs.notificationPosition);
      });
    }

    if (systemState.initial && systemState.currentId !== null) {
      const tx = state.find(s => s.id === systemState.currentId);
      if (tx) {
        const initial = systemState.initial;
        tx.thresholds = { ...initial.thresholds };
        tx.equipment = Object.fromEntries(
          Object.entries(initial.equipment).map(([key, val]) => [
            key,
            { installed: val.installed, on: val.on }
          ])
        );
        tx.phaseA = initial.phaseA;
        tx.phaseB = initial.phaseB;
        tx.config.phaseMonitoring = initial.config.phaseMonitoring;
        
        renderStationTab(systemState.currentId);
      }
    }

    if (systemState.initialTheme) {
      import('./theme.js').then(({ setTheme }) => {
        setTheme(systemState.initialTheme);
      });
    }

    settingsChanged = false;
    systemState.hasChanges = false;
    document.getElementById('settings-save-btn')?.classList.remove('has-changes');
    proceed();
  });
}

export function closeSettingsWithAnimation() {
  confirmDiscardIfChanged(() => {
    closeSettings();
  });
}

// --- GUARDAR Y CERRAR ---
function saveSettingsAndClose() {
  import('./persist.js').then(({ saveConfig }) => {
    saveConfig(state);
  });

  saveInterfaceChangesSilently();

  renderAll();
  showToast('Configuración guardada correctamente', 'success');
  settingsChanged = false;
  systemState.hasChanges = false;
  document.getElementById('settings-save-btn')?.classList.remove('has-changes');

  closeSettings();
}