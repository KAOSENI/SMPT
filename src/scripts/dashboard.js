// src/scripts/dashboard.js
// Módulo de estadísticas del dashboard
// Actualiza los valores en tiempo real basado en el estado de los transmisores

import { state } from './state.js';
import { statusOf } from './status.js';

/**
 * Elementos del DOM para actualización
 */
const domElements = {
  total: document.getElementById('stat-total'),
  operational: document.getElementById('stat-operational'),
  warning: document.getElementById('stat-warning'),
  critical: document.getElementById('stat-critical'),
  availability: document.getElementById('stat-availability'),
  lastUpdate: document.getElementById('stat-lastupdate'),
  badge: document.getElementById('stats-badge'),
};

/**
 * Calcula métricas a partir de la lista de transmisores
 * @param {Array} stations - Lista de transmisores (usa state global)
 * @returns {Object} Métricas calculadas
 */
export function calculateMetrics(stations) {
  // Si no se pasan stations, usar state global
  const list = stations || state;
  
  if (!list || !Array.isArray(list) || list.length === 0) {
    return {
      total: 0,
      operational: 0,
      warning: 0,
      critical: 0,
      availability: 0,
    };
  }

  const total = list.length;
  let operational = 0;
  let warning = 0;
  let critical = 0;

  list.forEach((tx) => {
    const status = statusOf(tx);
    if (status === 'ok') {
      operational++;
    } else if (status === 'warn') {
      warning++;
    } else if (status === 'crit') {
      critical++;
    }
  });

  // Disponibilidad ponderada: ok=100%, warn=50%, crit=0%
  const weightedSum = (operational * 100) + (warning * 50);
  const availability = total > 0 ? Math.round(weightedSum / total) : 0;

  return {
    total,
    operational,
    warning,
    critical,
    availability,
  };
}

/**
 * Formatea la fecha y hora actual
 * @returns {string} Hora formateada HH:MM:SS
 */
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Actualiza el DOM con los valores calculados
 * @param {Object} metrics - Métricas del dashboard
 */
export function updateDashboard(metrics) {
  // Actualizar números
  if (domElements.total) {
    domElements.total.textContent = metrics.total;
  }
  if (domElements.operational) {
    domElements.operational.textContent = metrics.operational;
  }
  if (domElements.warning) {
    domElements.warning.textContent = metrics.warning;
  }
  if (domElements.critical) {
    domElements.critical.textContent = metrics.critical;
  }
  if (domElements.availability) {
    domElements.availability.textContent = metrics.availability + '%';
  }

  // Actualizar timestamp
  if (domElements.lastUpdate) {
    domElements.lastUpdate.textContent = getCurrentTime();
  }

  // Actualizar badge (si hay críticos, cambiar color)
  if (domElements.badge) {
    const dot = domElements.badge.querySelector('.dot');
    if (dot) {
      if (metrics.critical > 0) {
        dot.style.background = '#ef4444';
        domElements.badge.style.borderColor = '#ef4444';
        domElements.badge.style.color = '#ef4444';
      } else if (metrics.warning > 0) {
        dot.style.background = '#eab308';
        domElements.badge.style.borderColor = '#eab308';
        domElements.badge.style.color = '#eab308';
      } else {
        dot.style.background = '#22c55e';
        domElements.badge.style.borderColor = 'var(--panel-line, #dde3e0)';
        domElements.badge.style.color = 'var(--text-dim, #667169)';
      }
    }
  }
}

/**
 * Inicializa el dashboard con los datos actuales
 */
export function initDashboard() {
  const metrics = calculateMetrics(state);
  updateDashboard(metrics);
}

// Exportar módulo
export default {
  calculateMetrics,
  updateDashboard,
  initDashboard,
  getCurrentTime,
};