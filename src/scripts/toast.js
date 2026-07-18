// src/scripts/toast.js
// Sistema simple de notificaciones para feedback visual
// Soporta posiciones configurables: bottom-right, bottom-left, top-right, top-left, y top-center (móvil)

import { loadToastsEnabled } from './persist.js';
import { getNotificationPosition } from './layout-prefs.js';

let toastTimeout = null;
let toastContainer = null;
let currentPosition = 'bottom-right';

// ============================================================
// 1. FUNCIÓN PRINCIPAL PARA APLICAR POSICIÓN
// ============================================================

export function applyNotificationPosition(position) {
  const container = document.getElementById('toast-container');
  if (!container) {
    getToastContainer();
    return;
  }
  
  // DETECCIÓN EN VIVO: Si es móvil, ignorar parámetro y forzar clase superior central
  if (window.innerWidth <= 480) {
    currentPosition = 'top-center';
  } else {
    currentPosition = position || 'bottom-right';
  }
  
  // Remove all position classes
  container.classList.remove(
    'position-bottom-right',
    'position-bottom-left',
    'position-top-right',
    'position-top-left',
    'position-top-center'
  );
  
  // Add the new position class
  const positionClass = `position-${currentPosition}`;
  container.classList.add(positionClass);
  
  // Store the current position in a data attribute for debugging
  container.dataset.position = currentPosition;
}

// ============================================================
// 2. CREAR CONTENEDOR DE TOASTS
// ============================================================

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    // Apply position immediately
    const position = getNotificationPosition();
    applyNotificationPosition(position);
  }
  return toastContainer;
}

// ============================================================
// 3. CREAR ELEMENTO TOAST
// ============================================================

function createToastElement(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  
  // Type-specific colors
  const colors = {
    info: 'var(--phosphor)',
    warning: 'var(--amber)',
    error: 'var(--red)',
    success: 'var(--phosphor)',
  };
  
  // Simple SVG icons (no emojis)
  const icons = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  };
  
  const iconColor = colors[type] || colors.info;
  
  toast.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:10px;">
      <span style="color:${iconColor};flex-shrink:0;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">${icons[type] || icons.info}</span>
      <span style="flex:1;line-height:1.4;">${message}</span>
      <button class="toast-close-btn" style="
        background:none;
        border:none;
        color:var(--text-dim);
        cursor:pointer;
        font-size:18px;
        padding:0 0 0 8px;
        flex-shrink:0;
        transition:color 0.2s;
        line-height:1;
      ">×</button>
    </div>
  `;
  
  // Close button hover
  const closeBtn = toast.querySelector('.toast-close-btn');
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.color = 'var(--text)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.color = 'var(--text-dim)';
  });
  
  return toast;
}

// ============================================================
// 4. MOSTRAR TOAST
// ============================================================

export function showToast(message, type = 'info', duration = 3500) {
  if (!loadToastsEnabled()) return;

  // Remover toast existente
  const existing = document.querySelector('.toast-notification');
  if (existing) {
    existing.remove();
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
  }
  
  const container = getToastContainer();
  const toast = createToastElement(message, type);
  
  container.appendChild(toast);
  
  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });
  
  // Close button
  toast.querySelector('.toast-close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    removeToast(toast);
  });
  
  // Auto-cerrar después de duration ms
  toastTimeout = setTimeout(() => {
    removeToast(toast);
  }, duration);
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-8px) scale(0.96)';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    toastTimeout = null;
  }, 300);
}

// ============================================================
// 5. ESCUCHAR CAMBIOS DE POSICIÓN
// ============================================================

// Listen for position changes from layout-prefs.js
window.addEventListener('notification-position-change', (e) => {
  const position = e.detail.position;
  if (position) {
    applyNotificationPosition(position);
  }
});

// Listen for storage changes (for cross-tab sync)
window.addEventListener('storage', (e) => {
  if (e.key === 'smpt:layout:v1') {
    try {
      const prefs = JSON.parse(e.newValue);
      if (prefs && prefs.notificationPosition) {
        applyNotificationPosition(prefs.notificationPosition);
      }
    } catch (err) {
      console.warn('Error parsing storage event:', err);
    }
  }
});

// ============================================================
// 6. RESPONSIVE: Manejar resize de ventana
// ============================================================

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const position = getNotificationPosition();
    applyNotificationPosition(position);
  }, 150);
});

// ============================================================
// 7. INICIALIZACIÓN
// ============================================================

// Initialize the container
const container = getToastContainer();

// Expose for debugging
window.applyNotificationPosition = applyNotificationPosition;
window.getNotificationPosition = getNotificationPosition;
window.showToast = showToast;
window.debugToast = function() {
  const container = document.getElementById('toast-container');
  if (!container) {
    return;
  }
  const styles = window.getComputedStyle(container);
};