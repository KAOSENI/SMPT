// src/scripts/layout-modal.js - Versión con Lucide en selector de temas

import {
  getLayoutPrefs,
  applyLayout,
  getNotificationPosition
} from './layout-prefs.js';
import { showToast, applyNotificationPosition } from './toast.js';
import { loadToastsEnabled, saveToastsEnabled } from './persist.js';
import { startLayoutEditing } from './layout-dnd.js';
import { markSettingsChanged, clearSettingsChanged } from './settings.js';
import { saveLayoutPrefs } from './persist.js';
import { loadTheme, setTheme } from './theme.js';

// Iconos Lucide en formato SVG
const LUCIDE_ICONS = {
  'eye': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  'bell': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  'layout': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
  'map-pin': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  'sidebar': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>`,
  'grid': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>`,
  'arrow-up-left': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10M7 7v10M7 7l9 9"/></svg>`,
  'arrow-up-right': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10M17 7L7 17"/></svg>`,
  'arrow-down-left': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7L7 17M7 17h10M7 17V7"/></svg>`,
  'arrow-down-right': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M17 7v10H7"/></svg>`,
  'map-pin-small': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  'palette': `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a8 8 0 0 0 0 16 2 2 0 0 0 0-4 4 4 0 0 1 0-8 8 8 0 0 1 8 8"/><circle cx="12" cy="12" r="2"/></svg>`,
  // --- ICONOS DE TEMA (Lucide) ---
  'sun': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  'lamp': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l4 10H4L8 2Z"/><path d="M12 12v6"/><path d="M8 18h8"/></svg>`,
  'moon': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  // Agregar a LUCIDE_ICONS en layout-modal.js
  'plus': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  'trash2': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg>`,
  'rotate-ccw': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.25 2.25L3 8"/><path d="M3 3v5h5"/></svg>`,
};

const SECTION_LABELS = {
  dashboard: { name: 'Panel de métricas', sub: 'Resumen de KPIs arriba de la página', icon: 'grid' },
  map: { name: 'Mapa de Chiapas', sub: 'Ubicación geográfica de los transmisores', icon: 'map-pin' },
  sidebar: { name: 'Panel lateral', sub: 'Disponibilidad, distribución de estados y bitácora', icon: 'sidebar' },
  grid: { name: 'Cuadrícula de transmisores', sub: 'Tarjetas con historial de cada transmisor', icon: 'grid' },
};

function getLucideIcon(name) {
  return LUCIDE_ICONS[name] || '';
}

// --- ESTADO DEL MODAL ---
let interfaceState = {
  toastsEnabled: false,
  toastsChanged: false,
  positionChanged: false,
  visibilityChanged: false,
  themeChanged: false,
  initialToasts: false,
  initialPosition: '',
  initialVisibility: {},
  initialTheme: 'light',
};

export function renderInterfaceFields(content) {
  const prefs = getLayoutPrefs();
  const isMobile = window.innerWidth <= 480;
  const currentTheme = loadTheme() || 'light';

  // --- GUARDAR ESTADO INICIAL ---
  interfaceState.initialToasts = loadToastsEnabled();
  interfaceState.initialPosition = getNotificationPosition();
  interfaceState.initialVisibility = { ...prefs.visible };
  interfaceState.initialTheme = currentTheme;
  
  interfaceState.toastsEnabled = interfaceState.initialToasts;
  interfaceState.toastsChanged = false;
  interfaceState.positionChanged = false;
  interfaceState.visibilityChanged = false;
  interfaceState.themeChanged = false;

  let currentPosition = interfaceState.initialPosition;
  if (isMobile && !currentPosition.startsWith('top')) {
    currentPosition = 'top-right';
    interfaceState.initialPosition = 'top-right';
  }

  // --- GENERAR SECCIONES VISIBLES ---
  const visibilityRows = Object.entries(SECTION_LABELS).map(([key, label]) => `
    <div class="vis-item" data-layout-row="${key}">
      <div class="vis-item-left">
        <span class="vis-item-icon">${getLucideIcon(label.icon)}</span>
        <div>
          <div class="vis-item-name">${label.name}</div>
          <div class="vis-item-sub">${label.sub}</div>
        </div>
      </div>
      <label class="switch">
        <input type="checkbox" ${prefs.visible[key] ? 'checked' : ''} data-layout-visible="${key}">
        <span class="slider"></span>
      </label>
    </div>`).join('');

  // --- GENERAR OPCIONES DE POSICIÓN ---
  const positionOptions = [
    { value: 'top-left', label: 'Sup. Izq.', icon: 'arrow-up-left' },
    { value: 'top-right', label: 'Sup. Der.', icon: 'arrow-up-right' },
    { value: 'bottom-left', label: 'Inf. Izq.', icon: 'arrow-down-left' },
    { value: 'bottom-right', label: 'Inf. Der.', icon: 'arrow-down-right' },
  ];

  const positionButtons = positionOptions.map(opt => {
    const isActive = currentPosition === opt.value;
    return `
      <button
        class="pos-btn ${isActive ? 'active' : ''}"
        data-position="${opt.value}"
        title="${opt.label}"
      >
        <span class="pos-btn-icon">${getLucideIcon(opt.icon)}</span>
        <span class="pos-btn-label">${opt.label}</span>
      </button>
    `;
  }).join('');

  // --- GENERAR OPCIONES DE TEMA (con Lucide) ---
  const themeOptions = [
    { value: 'light', label: 'Claro', icon: 'sun' },
    { value: 'phosphor', label: 'Fósforo', icon: 'lamp' },
    { value: 'dark', label: 'Oscuro', icon: 'moon' },
  ];

  const themeButtons = themeOptions.map(opt => {
    const isActive = currentTheme === opt.value;
    return `
      <button
        class="theme-option ${isActive ? 'active' : ''}"
        data-theme-value="${opt.value}"
        title="${opt.label}"
      >
        <span class="theme-option-icon">${getLucideIcon(opt.icon)}</span>
        <span class="theme-option-label">${opt.label}</span>
      </button>
    `;
  }).join('');

  const visibleCount = Object.values(prefs.visible).filter(Boolean).length;

  // --- RENDERIZADO ---
  content.innerHTML = `
    <div class="settings-body-interface">

      <!-- COLUMNA IZQUIERDA: Secciones visibles -->
      <div class="settings-card settings-card-visibility">
        <div class="settings-card-header">
          <span class="settings-card-icon">${getLucideIcon('eye')}</span>
          <span class="settings-card-title">Secciones visibles</span>
          <span class="settings-card-badge">${visibleCount}</span>
        </div>
        <p class="settings-card-desc">Oculta o muestra cada sección del panel principal</p>
        <div class="vis-list">
          ${visibilityRows}
        </div>
      </div>

      <!-- COLUMNA DERECHA: Notificaciones + Tema -->
      <div class="settings-card settings-card-notifications">
        <div class="settings-card-header">
          <span class="settings-card-icon">${getLucideIcon('bell')}</span>
          <span class="settings-card-title">Notificaciones</span>
        </div>
        <p class="settings-card-desc">Alertas emergentes para cambios de estado</p>

        <div class="notif-toggle">
          <div class="notif-toggle-info">
            <span class="notif-toggle-label">Alertas emergentes</span>
            <span class="notif-toggle-sub">${isMobile ? 'Fijas en la parte superior' : 'Avisos de cambios de estado'}</span>
          </div>
          <label class="switch">
            <input type="checkbox" ${interfaceState.initialToasts ? 'checked' : ''} id="toasts-enabled-input">
            <span class="slider"></span>
          </label>
        </div>

        <div class="pos-selector layout-desktop-only">
          <div class="pos-selector-label">
            <span class="pos-selector-icon">${getLucideIcon('map-pin-small')}</span>
            Posición
          </div>
          <div class="pos-selector-grid">
            ${positionButtons}
          </div>
        </div>

        <!-- TEMA VISUAL -->
        <div class="theme-selector">
          <div class="theme-selector-label">
            <span class="theme-selector-icon">${getLucideIcon('palette')}</span>
            Tema visual
          </div>
          <div class="theme-selector-grid">
            ${themeButtons}
          </div>
        </div>
      </div>

      <!-- BANNER INFERIOR -->
      <div class="settings-banner">
        <div class="settings-banner-left">
          <span class="settings-banner-icon">${getLucideIcon('layout')}</span>
          <div>
            <div class="settings-banner-title">Disposición de la página</div>
            <div class="settings-banner-desc">Arrastra cada sección a su lugar — cierra esta ventana y activa el modo de edición</div>
          </div>
        </div>
        <button class="btn-primary" id="start-layout-editing-btn">
          Editar disposición
        </button>
      </div>

    </div>
  `;

  // --- FUNCIÓN PARA ACTUALIZAR EL ESTADO DE CAMBIOS ---
  function updateChangeState() {
    const currentTheme = loadTheme() || 'light';
    const hasToastsChange = interfaceState.toastsEnabled !== interfaceState.initialToasts;
    const hasPositionChange = prefs.notificationPosition !== interfaceState.initialPosition;
    const hasVisibilityChange = JSON.stringify(prefs.visible) !== JSON.stringify(interfaceState.initialVisibility);
    const hasThemeChange = currentTheme !== interfaceState.initialTheme;

    const hasAnyChange = hasToastsChange || hasPositionChange || hasVisibilityChange || hasThemeChange;

    interfaceState.toastsChanged = hasToastsChange;
    interfaceState.positionChanged = hasPositionChange;
    interfaceState.visibilityChanged = hasVisibilityChange;
    interfaceState.themeChanged = hasThemeChange;

    if (hasAnyChange) {
      markSettingsChanged();
    } else {
      clearSettingsChanged();
    }
  }

  // --- EVENT LISTENERS ---

  document.getElementById('start-layout-editing-btn')?.addEventListener('click', () => {
    window.closeSettings?.();
    startLayoutEditing();
  });

  // Toggle de notificaciones
  document.getElementById('toasts-enabled-input')?.addEventListener('change', (e) => {
    interfaceState.toastsEnabled = e.target.checked;
    updateChangeState();
  });

  // Selector de posición
  if (!isMobile) {
    content.querySelectorAll('.pos-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const position = btn.dataset.position;
        content.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        prefs.notificationPosition = position;
        document.documentElement.setAttribute('data-notification-position', position);
        // Vista previa al instante: mueve el contenedor de notificaciones
        // YA, no hasta que se le dé "Guardar" — antes de que existiera
        // este flujo de Cancelar/Guardar, el cambio siempre se veía de
        // inmediato, y se sentía raro perder eso solo porque ahora hay un
        // paso intermedio de "pendiente de guardar".
        applyNotificationPosition(position);
        updateChangeState();

        const label = btn.querySelector('.pos-btn-label')?.textContent || btn.title || '';
        showToast(`Notificaciones movidas a ${label}`, 'info');
      });
    });
  }

  // Selector de tema
  content.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeValue;
      content.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      setTheme(theme);
      document.documentElement.setAttribute('data-theme', theme);
      updateChangeState();
    });
  });

  // Checkboxes de visibilidad
  content.querySelectorAll('[data-layout-visible]').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.dataset.layoutVisible;
      const nextVisibleState = { ...prefs.visible, [key]: input.checked };
      const anyVisible = Object.values(nextVisibleState).some(Boolean);

      if (!anyVisible) {
        input.checked = true;
        showToast('Debe quedar al menos una sección visible', 'error');
        return;
      }

      prefs.visible = nextVisibleState;
      applyLayout();

      const badge = content.querySelector('.settings-card-badge');
      if (badge) badge.textContent = Object.values(prefs.visible).filter(Boolean).length;

      updateChangeState();
    });
  });

  // Inicializar estado de cambios
  setTimeout(updateChangeState, 0);
}

// --- GUARDADO ---
export function saveInterfaceChangesSilently() {
  const prefs = getLayoutPrefs();
  
  const hasToastsChange = interfaceState.toastsChanged;
  const hasPositionChange = interfaceState.positionChanged;
  const hasVisibilityChange = interfaceState.visibilityChanged;
  const hasThemeChange = interfaceState.themeChanged;

  if (hasPositionChange || hasVisibilityChange) {
    saveLayoutPrefs(prefs);
  }

  if (hasPositionChange) {
    applyNotificationPosition(prefs.notificationPosition);
  }

  if (hasToastsChange) {
    saveToastsEnabled(interfaceState.toastsEnabled);
    showToast(
      interfaceState.toastsEnabled ? 'Notificaciones activadas' : 'Notificaciones desactivadas', 
      interfaceState.toastsEnabled ? 'success' : 'info'
    );
  }

  if (hasThemeChange) {
    const currentTheme = loadTheme() || 'light';
    const themeLabels = { light: 'Claro', phosphor: 'Fósforo', dark: 'Oscuro' };
    showToast(`Tema cambiado a: ${themeLabels[currentTheme]}`, 'success');
  }

  interfaceState.toastsChanged = false;
  interfaceState.positionChanged = false;
  interfaceState.visibilityChanged = false;
  interfaceState.themeChanged = false;
}

// --- EXPONER ESTADO DE CAMBIOS PARA settings.js ---
export function getInterfaceChanges() {
  return {
    hasChanges: interfaceState.toastsChanged || 
                interfaceState.positionChanged || 
                interfaceState.visibilityChanged || 
                interfaceState.themeChanged,
    toastsChanged: interfaceState.toastsChanged,
    positionChanged: interfaceState.positionChanged,
    visibilityChanged: interfaceState.visibilityChanged,
    themeChanged: interfaceState.themeChanged,
  };
}