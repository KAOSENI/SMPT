// src/scripts/charts.js
//
// Antes, cada gráfica se regeneraba como un string SVG nuevo en cada tick
// (echarts.init(null,...) -> renderToSVGString() -> dispose()), y como
// detail.js metía ese string vía innerHTML, el navegador borraba y volvía
// a dibujar el SVG completo cada 1.5s -> el parpadeo que se veía.
//
// Ahora cada gráfica es una instancia VIVA de ECharts (igual que el patrón
// que ya usa Sidebar.astro para el gauge/pie/barras): se monta una sola vez
// sobre un <div>, y en cada tick solo se le pasan los datos nuevos con
// chart.setOption(...) — ECharts actualiza la línea internamente, sin
// destruir y recrear el SVG.

import * as echarts from 'echarts';

export const HISTORY_MAX = 30;

// HTML del "cascarón" de una gráfica: se inserta UNA sola vez al abrir un
// transmisor. containerId debe ser único (ej. "chart-power").
export function chartSkeletonHtml(containerId, label) {
  return `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
        <span style="font-family:var(--mono); font-size:10px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.05em;">${label}</span>
        <span id="${containerId}-value" style="font-family:var(--mono); font-size:12px; font-weight:600;">—</span>
      </div>
      <div id="${containerId}" class="echarts-svg-wrapper" style="width:100%; height:70px; border-radius:6px; overflow:hidden;"></div>
    </div>
  `;
}

// Monta la instancia viva sobre el contenedor ya presente en el DOM.
// Devuelve la instancia (o null si el contenedor todavía no existe).
export function mountLineChart(containerId) {
  const dom = document.getElementById(containerId);
  if (!dom) return null;
  return echarts.init(dom, null, { renderer: 'svg' });
}

// Actualiza una instancia viva con datos nuevos — NO recrea el SVG,
// solo cambia la serie (ECharts hace la transición internamente).
//
// El texto junto al título NO muestra el valor actual (eso ya se ve en el
// medidor/metric-box de arriba, mostrarlo dos veces es redundante) — muestra
// el CAMBIO entre el primer y el último punto del historial visible, con
// una flecha de tendencia. Es información que el medidor no da: hacia dónde
// se está moviendo, no solo dónde está parado ahora mismo.
export function updateLineChart(chart, containerId, values, thresholdValue, color, fmt) {
  if (!chart) return;
  const first = values && values.length ? values[0] : 0;
  const last = values && values.length ? values[values.length - 1] : 0;
  const delta = last - first;

  const valueLabel = document.getElementById(`${containerId}-value`);
  if (valueLabel) {
    const arrow = delta > 0.05 ? '▲' : delta < -0.05 ? '▼' : '—';
    const sign = delta > 0 ? '+' : '';
    const deltaText = (typeof fmt === 'function') ? fmt(delta) : String(delta);
    valueLabel.textContent = `${arrow} ${sign}${deltaText}`;
    valueLabel.style.color = color;
    valueLabel.title = 'Cambio respecto al inicio del historial visible';
  }

  chart.setOption({
    grid: { left: 0, right: 0, top: 10, bottom: 0 },
    xAxis: { type: 'category', boundaryGap: false, show: false },
    yAxis: {
      type: 'value',
      show: false,
      min: (value) => Math.min(value.min, thresholdValue) * 0.95,
      max: (value) => Math.max(value.max, thresholdValue) * 1.05,
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        animationDuration: 400,
        lineStyle: { color, width: 2, cap: 'round' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color },
              { offset: 1, color: 'transparent' },
            ],
          },
          opacity: 0.15,
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { color: 'var(--panel-line, #e5e7eb)', width: 1, type: 'dashed' },
          data: [{ yAxis: thresholdValue }],
        },
      },
    ],
  });
}

export function disposeLineChart(chart) {
  if (chart && !chart.isDisposed()) chart.dispose();
}