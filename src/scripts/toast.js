// src/scripts/toast.js
// Sistema simple de notificaciones para feedback visual

import { loadToastsEnabled } from './persist.js';

let toastTimeout = null;

export function showToast(message, type = 'info') {
  // El usuario puede desactivar las notificaciones desde "Disposición de
  // la página" (ver layout-modal.js) — por defecto están activadas.
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
  
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.textContent = message;
  
  // Asegurar que el toast se añade al body, no dentro del modal
  document.body.appendChild(toast);
  
  // Auto-cerrar después de 3 segundos
  toastTimeout = setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
      toastTimeout = null;
    }, 300);
  }, 3000);
}