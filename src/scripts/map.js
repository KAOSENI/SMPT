// Proyección geográfica (lat/lon → coordenadas del SVG) y render del mapa:
// puntos de cada transmisor, círculos de cobertura, mapa de calor y clusters.
// El zoom/arrastre en sí vive en map-interaction.js.

import { state } from './state.js';
import { statusOf } from './status.js';

export const mapView = { scale: 1, x: 0, y: 0 };
export const MAP_W = 480, MAP_H = 480; // lienzo estrictamente cuadrado (1:1), igual que el viewBox del SVG

export const mapOptions = {
  coverage: true,
  heatmap: false,
  labels: true,
  clusters: false
};

export function projectPoint(lat, lon) {
  const LAT_MAX = 17.9738, LAT_MIN = 14.5347;
  const LON_MIN = -94.157, LON_MAX = -90.3932;
  // El estado de Chiapas no es cuadrado (proporción real ~1.05 ancho/alto), así que se centra
  // dentro del lienzo cuadrado con relleno asimétrico en vez de estirarlo para llenar el cuadrado.
  const innerW = 400, innerH = 380;
  const padX = (MAP_W - innerW) / 2, padY = (MAP_H - innerH) / 2;

  const x = padX + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * innerW;
  const y = padY + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * innerH;
  return { x, y };
}

export function clampMapView() {
  mapView.scale = Math.min(6, Math.max(0.5, mapView.scale));
  const marginX = mapView.scale > 1 ? (mapView.scale - 1) * MAP_W * 0.15 : 0;
  const marginY = mapView.scale > 1 ? (mapView.scale - 1) * MAP_H * 0.15 : 0;
  const minX = -(mapView.scale - 1) * MAP_W - marginX;
  const maxX = marginX;
  const minY = -(mapView.scale - 1) * MAP_H - marginY;
  const maxY = marginY;
  mapView.x = Math.min(maxX, Math.max(minX, mapView.x));
  mapView.y = Math.min(maxY, Math.max(minY, mapView.y));
}

export function applyMapTransform() {
  const g = document.getElementById('map-zoom-group');
  if (g) g.setAttribute('transform', `translate(${mapView.x},${mapView.y}) scale(${mapView.scale})`);
}

export function getMapCoords(clientX, clientY) {
  const svg = document.getElementById('geo-svg');
  const rect = svg.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width * MAP_W;
  const y = (clientY - rect.top) / rect.height * MAP_H;
  return {
    x: (x - mapView.x) / mapView.scale,
    y: (y - mapView.y) / mapView.scale
  };
}

export function renderGeoMap() {
  const layerPoints = document.getElementById('layer-points');
  const layerHeatmap = document.getElementById('layer-heatmap');
  const layerCoverage = document.getElementById('layer-coverage');
  const layerClusters = document.getElementById('layer-clusters');

  const pointsData = state.map((tx) => {
    const pos = projectPoint(tx.lat, tx.lon);
    const s = statusOf(tx);
    const color = s === 'crit' ? 'var(--red)' : s === 'warn' ? 'var(--amber)' : 'var(--phosphor)';
    return { ...pos, tx, s, color };
  });

  // Puntos
  const pointsHtml = pointsData.map((p, i) => {
    const labelUp = i % 2 === 0;
    const callY = labelUp ? -12 : 16;
    const lineY2 = labelUp ? -8 : 8;
    const showLabel = mapOptions.labels && mapView.scale >= 1.2;

    return `
      <g class="geo-point" data-id="${p.tx.id}" style="cursor:pointer;">
        <line x1="0" y1="0" x2="0" y2="${lineY2}" stroke="var(--panel-line)" stroke-width="0.8"></line>
        <circle cx="0" cy="0" r="6" fill="${p.color}" stroke="var(--dot-border)" stroke-width="1.5" filter="url(#glow)"></circle>
        ${showLabel ? `<text x="0" y="${callY}" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="var(--map-label)" style="user-select:none;">${p.tx.call}</text>` : ''}
        <title>${p.tx.shortName} · ${p.tx.freq} · ${p.tx.municipio} · ${p.s.toUpperCase()}</title>
      </g>
    `;
  }).join('');

  // Cobertura
  let coverageHtml = '';
  if (mapOptions.coverage) {
    const radius = 20 + (15 / mapView.scale);
    coverageHtml = pointsData.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="${radius}" fill="none" stroke="${p.color}" stroke-width="0.8" opacity="0.3" stroke-dasharray="4,4"></circle>
    `).join('');
  }

  // Heatmap
  let heatmapHtml = '';
  if (mapOptions.heatmap) {
    heatmapHtml = pointsData.map(p => {
      const weight = p.s === 'crit' ? 3 : p.s === 'warn' ? 2 : 1;
      return `<circle cx="${p.x}" cy="${p.y}" r="35" fill="url(#heat-grad)" opacity="${0.2 * weight}" filter="url(#glow)"></circle>`;
    }).join('');
  }

  // Clusters
  let clustersHtml = '';
  if (mapOptions.clusters && mapView.scale < 1.5) {
    const clusterThreshold = 30 / mapView.scale;
    const used = new Set();
    const clusters = [];

    for (let i = 0; i < pointsData.length; i++) {
      if (used.has(i)) continue;
      const cluster = [i];
      for (let j = i + 1; j < pointsData.length; j++) {
        if (used.has(j)) continue;
        const dx = pointsData[i].x - pointsData[j].x;
        const dy = pointsData[i].y - pointsData[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < clusterThreshold) {
          cluster.push(j);
          used.add(j);
        }
      }
      if (cluster.length > 1) {
        used.add(i);
        const cx = cluster.reduce((sum, idx) => sum + pointsData[idx].x, 0) / cluster.length;
        const cy = cluster.reduce((sum, idx) => sum + pointsData[idx].y, 0) / cluster.length;
        const statuses = cluster.map(idx => pointsData[idx].s);
        const hasCrit = statuses.includes('crit');
        const hasWarn = statuses.includes('warn');
        const color = hasCrit ? 'var(--red)' : hasWarn ? 'var(--amber)' : 'var(--phosphor)';
        const count = cluster.length;
        clusters.push({ x: cx, y: cy, count, color, ids: cluster.map(idx => pointsData[idx].tx.id) });
      }
    }

    // openDetail se expone en window (ver main.js): este HTML se inserta como texto,
    // así que el onclick solo puede resolver funciones globales, no del módulo.
    clustersHtml = clusters.map(c => `
      <g class="geo-cluster" style="cursor:pointer;" onclick="openDetail(${c.ids[0]})">
        <circle cx="${c.x}" cy="${c.y}" r="${8 + c.count * 1.5}" fill="${c.color}" opacity="0.25" stroke="${c.color}" stroke-width="2"></circle>
        <circle cx="${c.x}" cy="${c.y}" r="${5 + c.count}" fill="${c.color}" opacity="0.15"></circle>
        <text x="${c.x}" y="${c.y + 3}" text-anchor="middle" font-family="var(--mono)" font-size="${9 + c.count}" fill="var(--text)" font-weight="700">${c.count}</text>
      </g>
    `).join('');
  }

  layerPoints.innerHTML = pointsHtml;
  layerCoverage.innerHTML = coverageHtml;
  layerHeatmap.innerHTML = heatmapHtml;
  layerClusters.innerHTML = clustersHtml;

  const points = layerPoints.querySelectorAll('.geo-point');
  points.forEach((el, i) => {
    const tx = state[i];
    const pos = projectPoint(tx.lat, tx.lon);
    el.setAttribute('transform', `translate(${pos.x},${pos.y})`);
  });

  layerHeatmap.style.display = mapOptions.heatmap ? 'block' : 'none';
  layerCoverage.style.display = mapOptions.coverage ? 'block' : 'none';
  layerClusters.style.display = (mapOptions.clusters && mapView.scale < 1.5) ? 'block' : 'none';

  applyMapTransform();
}
