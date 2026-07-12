// src/scripts/main.js
// Punto de entrada: conecta todos los módulos, expone lo necesario en window
// (para los onclick="" generados dentro de innerHTML), e inicia la simulación.

import { state } from './state.js';
import { statusOf } from './status.js';
import { setTheme, wireThemeButtons } from './theme.js';
import { renderGeoMap } from './map.js';
import { setupMapInteraction } from './map-interaction.js';
import { renderGrid } from './grid.js';
import { updateSidebarStats, addEvent } from './events.js';
import { tick } from './tick.js';
import { openDetail, closeDetail } from './detail.js';
import { closeSettings } from './settings.js';
// Importar dashboard para inicialización
import { initDashboard } from './dashboard.js';

// El HTML generado por eventos.js (bitácora) y map.js (clusters) usa
// onclick="openDetail(id)" como texto plano, así que necesita existir en window.
window.openDetail = openDetail;

// Cierre de las ventanas modales: clic fuera del panel, o tecla Escape
// (si la ventana de Configuración está encima, Escape la cierra primero).
document.getElementById('overlay').addEventListener('click', e => {
  if (e.target.id === 'overlay') closeDetail();
});
document.getElementById('settings-overlay').addEventListener('click', e => {
  if (e.target.id === 'settings-overlay') closeSettings();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('settings-overlay').classList.contains('open')) closeSettings();
  else closeDetail();
});

// Tema inicial
setTheme('light');
wireThemeButtons();

// Estado inicial del semáforo de cada transmisor (sin disparar eventos de bitácora)
state.forEach(tx => {
  tx._lastStatus = statusOf(tx);
});

renderGeoMap();
setupMapInteraction();
renderGrid();
updateSidebarStats();

// Inicializar dashboard
initDashboard();

addEvent(0, 'ok', 'sistema de monitoreo iniciado');

setInterval(() => {
  tick();
  renderGeoMap();
}, 1500);