// Interacción del mapa: zoom (rueda/pellizco), arrastre, hover con tooltip,
// clic para abrir el detalle, y el menú de opciones (cobertura/calor/etiquetas/clusters).

import { state } from './state.js';
import { statusOf } from './status.js';
import { openDetail } from './detail.js';
import { mapView, MAP_W, mapOptions, projectPoint, clampMapView, getMapCoords, renderGeoMap } from './map.js';

export function setupMapInteraction() {
  const svg = document.getElementById('geo-svg');
  const tooltip = document.getElementById('map-tooltip');
  const ttName = document.getElementById('tt-name');
  const ttDetail = document.getElementById('tt-detail');
  const ttStatus = document.getElementById('tt-status');

  let dragging = false, lastX = 0, lastY = 0, moved = false;

  // Menú de opciones
  const optionsBtn = document.getElementById('map-options-btn');
  const optionsMenu = document.getElementById('map-options-menu');

  optionsBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    optionsMenu.classList.toggle('open');
    this.classList.toggle('active');
  });

  document.addEventListener('click', function () {
    optionsMenu.classList.remove('open');
    optionsBtn.classList.remove('active');
  });

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      const option = this.dataset.option;
      mapOptions[option] = !mapOptions[option];
      this.classList.toggle('active');
      renderGeoMap();
    });
  });

  // Hover
  svg.addEventListener('mousemove', function (e) {
    const coords = getMapCoords(e.clientX, e.clientY);
    const mx = coords.x;
    const my = coords.y;

    let found = false;
    for (const txState of state) {
      const pos = projectPoint(txState.lat, txState.lon);
      const dx = pos.x - mx;
      const dy = pos.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 15) {
        found = true;
        const s = statusOf(txState);
        
        // 1. PRIMERO: Leer (antes de modificar el DOM)
        const rect = svg.getBoundingClientRect();
        
        // 2. LUEGO: Modificar el DOM
        ttName.textContent = txState.shortName;
        ttDetail.textContent = `${txState.call} · ${txState.freq} · ${txState.municipio}`;
        ttStatus.textContent = s === 'ok' ? 'Normal' : s === 'warn' ? 'Advertencia' : 'Crítico';
        ttStatus.className = `tt-status ${s}`;

        const tooltipX = e.clientX - rect.left + 14;
        const tooltipY = e.clientY - rect.top - 10;
        tooltip.style.left = Math.min(tooltipX, rect.width - 200) + 'px';
        tooltip.style.top = Math.min(tooltipY, rect.height - 80) + 'px';
        tooltip.classList.add('visible');
        break;
      }
    }
    if (!found) {
      tooltip.classList.remove('visible');
    }
  });

  svg.addEventListener('mouseleave', function () {
    tooltip.classList.remove('visible');
  });

  // Zoom
  svg.addEventListener('wheel', function (e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    mapView.scale *= delta;
    clampMapView();
    renderGeoMap();
  }, { passive: false });

  // Arrastre
  svg.addEventListener('pointerdown', function (e) {
    dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY;
    svg.setPointerCapture(e.pointerId);
    svg.style.cursor = 'grabbing';
  });

  svg.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    
    // 1. PRIMERO: Leer
    const rect = svg.getBoundingClientRect();
    
    // 2. LUEGO: Procesar
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    const scaleFactor = MAP_W / rect.width;
    mapView.x += dx * scaleFactor;
    mapView.y += dy * scaleFactor;
    lastX = e.clientX;
    lastY = e.clientY;
    clampMapView();
    renderGeoMap();
  });

  svg.addEventListener('pointerup', function (e) {
    dragging = false;
    svg.style.cursor = 'grab';
    if (!moved) {
      const coords = getMapCoords(e.clientX, e.clientY);
      const mx = coords.x;
      const my = coords.y;

      for (const txState of state) {
        const pos = projectPoint(txState.lat, txState.lon);
        const dx = pos.x - mx;
        const dy = pos.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          openDetail(txState.id);
          break;
        }
      }
    }
  });

  ['pointerleave', 'pointercancel'].forEach(evt => {
    svg.addEventListener(evt, function () {
      dragging = false;
      svg.style.cursor = 'grab';
    });
  });

  document.getElementById('map-zoom-in').addEventListener('click', function () {
    mapView.scale *= 1.4;
    clampMapView();
    renderGeoMap();
  });

  document.getElementById('map-zoom-out').addEventListener('click', function () {
    mapView.scale /= 1.4;
    clampMapView();
    renderGeoMap();
  });

  document.getElementById('map-zoom-reset').addEventListener('click', function () {
    mapView.scale = 1;
    mapView.x = 0;
    mapView.y = 0;
    renderGeoMap();
  });
}
