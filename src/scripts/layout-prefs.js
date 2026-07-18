// src/scripts/layout-prefs.js - Versión optimizada con onSplashReady

import { loadLayoutPrefs, saveLayoutPrefs } from './persist.js';
import { resizeCardCharts, updateCompactMode, renderGrid } from './grid.js';
import { onSplashReady } from './splash-ready.js';

const SECTION_KEYS = ['dashboard', 'map', 'sidebar', 'grid'];
let pendingLayoutUpdate = false;

function defaultPrefs() {
  return {
    order: ['dashboard', 'map', 'sidebar', 'grid'],
    visible: { dashboard: true, map: true, sidebar: true, grid: true },
    notificationPosition: 'bottom-right',
  };
}

function normalizeOrder(saved) {
  if (!Array.isArray(saved)) return defaultPrefs().order;
  const seen = new Set();
  const cleaned = saved.filter((key) => {
    if (!SECTION_KEYS.includes(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  SECTION_KEYS.forEach((key) => {
    if (!seen.has(key)) cleaned.push(key);
  });
  return cleaned;
}

function normalize(saved) {
  const base = defaultPrefs();
  if (!saved || typeof saved !== 'object') return base;
  return {
    order: normalizeOrder(saved.order),
    visible: {
      dashboard: saved.visible?.dashboard !== false,
      map: saved.visible?.map !== false,
      sidebar: saved.visible?.sidebar !== false,
      grid: saved.visible?.grid !== false,
    },
    notificationPosition: saved.notificationPosition || 'bottom-right',
  };
}

let prefs = normalize(loadLayoutPrefs());

export function getLayoutPrefs() {
  return prefs;
}

function computeCompanion(order, visible) {
  if (!visible.map) return 'none';
  const candidate = order.find((key) => (key === 'sidebar' || key === 'grid') && visible[key] !== false);
  return candidate || 'none';
}

function applyOrderAttributes(order, visible) {
  const html = document.documentElement;
  order.forEach((key, index) => {
    html.setAttribute(`data-order-${key}`, String(index));
  });
  html.setAttribute('data-companion', computeCompanion(order, visible));
}

// --- ACTUALIZACIÓN PESADA: SOLO DESPUÉS DEL SPLASH ---
function performHeavyLayoutUpdate() {
  // Verificar si el modal está activo o cerrando
  const settingsOverlay = document.getElementById('settings-overlay');
  const isSettingsActive = settingsOverlay?.classList.contains('open') || false;
  const settingsContent = document.getElementById('settings-content');
  const isClosing = settingsContent?.classList.contains('settings-closing') || false;

  if (isClosing || isSettingsActive) {
    updateCompactMode();
    return;
  }

  // Usar requestAnimationFrame para sincronizar con el refresh del navegador
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
    
    requestAnimationFrame(() => {
      resizeCardCharts();
      updateCompactMode();
      renderGrid();
      window.initSidebarCharts?.();
    });
  });
}

// --- ACTUALIZACIÓN LIGERA: PARA CAMBIOS EN TIEMPO REAL ---
function performLightLayoutUpdate() {
  // Solo actualiza lo que es crítico para el layout inmediato
  // Las operaciones pesadas (renderGrid, resizeCardCharts) se saltan
  // porque ya se ejecutarán en el próximo tick de la simulación
  updateCompactMode();
}

export function applyLayout() {
  applyOrderAttributes(prefs.order, prefs.visible);

  const html = document.documentElement;

  // Ocultar/Mostrar secciones
  const hidden = Object.entries(prefs.visible)
    .filter(([, visible]) => !visible)
    .map(([key]) => key);
  if (hidden.length) html.setAttribute('data-hidden-sections', hidden.join(' '));
  else html.removeAttribute('data-hidden-sections');

  // Posición de notificaciones
  const finalPosition = getNotificationPosition();
  html.setAttribute('data-notification-position', finalPosition);

  // --- ESTRATEGIA OPTIMIZADA ---
  // Si el splash ya terminó, ejecutar actualización pesada
  // Si no, usar onSplashReady para retrasarla
  if (window.__splashReady) {
    // El splash ya terminó: ejecutar actualización pesada
    if (!pendingLayoutUpdate) {
      pendingLayoutUpdate = true;
      queueMicrotask(() => {
        pendingLayoutUpdate = false;
        performHeavyLayoutUpdate();
      });
    }
  } else {
    // El splash NO ha terminado: solo ejecutar actualización ligera ahora,
    // y programar la pesada para después del splash
    performLightLayoutUpdate();
    
    // Programar la actualización pesada para después del splash
    onSplashReady(() => {
      if (!pendingLayoutUpdate) {
        pendingLayoutUpdate = true;
        queueMicrotask(() => {
          pendingLayoutUpdate = false;
          performHeavyLayoutUpdate();
        });
      }
    });
  }
}

export function previewOrder(order) {
  applyOrderAttributes(order, prefs.visible);
}

export function setOrder(newOrder) {
  prefs.order = normalizeOrder(newOrder);
  saveLayoutPrefs(prefs);
  applyLayout();
}

export function setSectionVisible(key, value) {
  if (!(key in prefs.visible)) return true;
  const next = { ...prefs.visible, [key]: value };
  const anyVisible = Object.values(next).some(Boolean);
  if (!anyVisible) return false;

  prefs.visible = next;
  saveLayoutPrefs(prefs);
  applyLayout();
  return true;
}

export function getNotificationPosition() {
  if (typeof window !== 'undefined' && window.innerWidth <= 480) {
    return 'top-right';
  }
  return prefs.notificationPosition || 'bottom-right';
}

export function setNotificationPosition(position) {
  if (typeof window !== 'undefined' && window.innerWidth <= 480) return;

  const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
  if (!validPositions.includes(position)) return;

  prefs.notificationPosition = position;
  saveLayoutPrefs(prefs);

  document.documentElement.setAttribute('data-notification-position', position);

  window.dispatchEvent(new CustomEvent('notification-position-change', {
    detail: { position }
  }));
}

export function initLayout() {
  applyLayout();
}