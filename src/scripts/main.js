// src/scripts/main.js
// Punto de entrada: conecta todos los módulos, expone lo necesario en window
// (para los onclick="" generados dentro de innerHTML), e inicia la simulación.

import { state } from './state.js';
import { statusOf } from './status.js';
import { setTheme, wireThemeButtons, loadTheme } from './theme.js';
import { renderGeoMap } from './map.js';
import { setupMapInteraction } from './map-interaction.js';
import { renderGrid } from './grid.js';
import { updateSidebarStats } from './events.js';
import { tick, TICK_INTERVAL_MS } from './tick.js';
import { openDetail, closeDetail } from './detail.js';
// Cambiada la importación para traer la función con validación de cambios
import { closeSettingsWithAnimation, openSettings } from './settings.js';
// Importar dashboard para inicialización
import { initDashboard } from './dashboard.js';
import { openAbout } from './about.js';
import { registerServiceWorker } from './pwa.js';
import { initLayout } from './layout-prefs.js';
import { onSplashReady } from './splash-ready.js';
import { initLayoutDnd } from './layout-dnd.js';

// El HTML generado por eventos.js (bitácora) y map.js (clusters) usa
// onclick="openDetail(id)" como texto plano, así que necesita existir en window.
window.openDetail = openDetail;
window.closeSettings = closeSettingsWithAnimation;

// Cierre de las ventanas modales: clic fuera del panel, o tecla Escape
// (si la ventana de Configuración está encima, Escape la cierra primero).
document.getElementById('overlay').addEventListener('click', e => {
  if (e.target.id === 'overlay') closeDetail();
});
document.getElementById('settings-overlay').addEventListener('click', e => {
  if (e.target.id === 'settings-overlay') closeSettingsWithAnimation();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('settings-overlay').classList.contains('open')) closeSettingsWithAnimation();
  else closeDetail();
});

// Tema inicial: el que quedó guardado en una sesión anterior, o Claro por defecto.
setTheme(loadTheme() || 'light');
wireThemeButtons();

document.getElementById('about-btn')?.addEventListener('click', openAbout);
document.getElementById('global-settings-btn')?.addEventListener('click', () => openSettings());

// El botón de disposición ahora activa el modo de edición (arrastrar
// secciones) en vez de abrir directamente la ventana de "secciones
// visibles" — ver layout-dnd.js.
initLayoutDnd();

// Preferencia de disposición guardada en una sesión anterior (qué secciones
// se ven y cómo se acomodan) — se aplica antes de renderizar el resto para
// no mostrar el diseño por defecto y luego saltar al preferido.
initLayout();

// Estado inicial del semáforo de cada transmisor (sin disparar eventos de bitácora)
state.forEach(tx => {
  tx._lastStatus = statusOf(tx);
});

renderGeoMap();
setupMapInteraction();

// renderGrid() monta las gráficas de las tarjetas con ECharts, que necesita
// medir el ancho/alto real de cada contenedor. Si se llama de forma
// síncrona aquí (inmediatamente después de parsear el HTML), el navegador
// todavía no terminó su primer cálculo de layout y esas medidas pueden dar
// 0 — ECharts lo reporta como advertencia en consola aunque el layout final
// sí sea correcto un instante después. onSplashReady() difiere la llamada
// hasta que el splash de carga (ver SplashScreen.astro) termina su tiempo
// mínimo en pantalla (~0.9s) — de sobra para que el layout ya esté resuelto.
onSplashReady(() => {
  renderGrid();
});
updateSidebarStats();

// Inicializar dashboard
initDashboard();

setInterval(() => {
  tick();
  renderGeoMap();
}, TICK_INTERVAL_MS);

registerServiceWorker();