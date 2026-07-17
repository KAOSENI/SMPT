// src/scripts/charts.js

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
// el CAMBIO respecto a la muestra anterior (un tick atrás, ~1.5s), con una
// flecha de tendencia. Es información que el medidor no da: hacia dónde se
// está moviendo justo ahora, no solo dónde está parado.
export function updateLineChart(chart, containerId, values, thresholdValue, color, fmt) {
  // Check if chart is valid and not disposed
  if (!chart || chart.isDisposed()) return;
  
  const len = values ? values.length : 0;
  const last = len ? values[len - 1] : 0;
  const prev = len > 1 ? values[len - 2] : last;
  const delta = last - prev;

  const valueLabel = document.getElementById(`${containerId}-value`);
  if (valueLabel) {
    const arrow = delta > 0.05 ? '▲' : delta < -0.05 ? '▼' : '—';
    const sign = delta > 0 ? '+' : '';
    const deltaText = (typeof fmt === 'function') ? fmt(delta) : String(delta);
    valueLabel.textContent = `${arrow} ${sign}${deltaText}`;
    valueLabel.style.color = color;
    valueLabel.title = 'Cambio respecto a la muestra anterior';
  }

  // Rango del eje: basado en los datos reales, no en el umbral de alarma.
  // Antes el eje SIEMPRE se estiraba para incluir thresholdValue — cuando
  // el valor actual estaba lejos de su umbral (p. ej. una alarma con la
  // potencia muy por debajo de su mínimo), los datos reales quedaban
  // comprimidos en una franja delgadita pegada a un borde, casi invisible.
  // Ahora el umbral solo se dibuja (línea punteada) si cae dentro del
  // rango real ya calculado — si no, simplemente no se traza esa línea,
  // en vez de deformar la escala para forzarla a caber.
  const safeValues = (values && values.length) ? values : [0];
  const dataMin = Math.min(...safeValues);
  const dataMax = Math.max(...safeValues);
  const span = Math.max(dataMax - dataMin, Math.abs(dataMax) * 0.05, 1);
  const padding = span * 0.25;
  const axisMin = dataMin - padding;
  const axisMax = dataMax + padding;
  const thresholdInRange = typeof thresholdValue === 'number' && thresholdValue >= axisMin && thresholdValue <= axisMax;

  chart.setOption({
    // La causa real del choque era hover + animación al mismo tiempo, no
    // la animación por sí sola: al pasar el mouse, ECharts dispara una
    // animación de "énfasis" (resaltar/engrosar la línea) que podía
    // pisarse con la animación de la actualización periódica (cada 1.5s,
    // vía tick.js) — dos animaciones del mismo elemento a la vez, ahí
    // truena ECharts (interpolate1DArray leyendo .length de undefined).
    // silent:true en la serie (más abajo) es lo que en realidad evita
    // esto: la serie deja de procesar eventos de mouse, así que el hover
    // nunca dispara esa animación de énfasis — sin esa mitad de la
    // colisión, la animación de transición de datos por sí sola es segura
    // y se puede dejar activa.
    tooltip: { show: false },
    grid: { left: 0, right: 34, top: 10, bottom: 4 },
    xAxis: { type: 'category', boundaryGap: false, show: false },
    yAxis: {
      type: 'value',
      // Antes show:false — sin ningún número, no había forma de saber si
      // la gráfica trabajaba en un rango de 0-100, 1-2, etc. Ahora se ven
      // 2-3 etiquetas pequeñas (mismo formato que el valor de arriba: %,
      // :1, °C) a la derecha, suficiente para ubicar la escala sin
      // convertir la mini-gráfica en un eje completo y pesado.
      show: true,
      min: axisMin,
      max: axisMax,
      splitNumber: 2,
      position: 'right',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        fontSize: 9,
        color: 'var(--text-dim, #6b7280)',
        margin: 6,
        formatter: (v) => ((typeof fmt === 'function') ? fmt(v) : String(Math.round(v))),
      },
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        showSymbol: false,
        silent: true,
        animationDuration: 400,
        animationEasing: 'cubicOut',
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
          // ECharts le pone por defecto una etiqueta con el valor exacto
          // al lado de la línea — ESE era el número junto a la línea
          // punteada del umbral, no el tooltip. La línea punteada ya
          // comunica "aquí está el límite" por sí sola, no hace falta el
          // número (y la etiqueta del eje, a la derecha, ya muestra la
          // escala completa).
          label: { show: false },
          lineStyle: { color: 'var(--panel-line, #e5e7eb)', width: 1, type: 'dashed' },
          data: thresholdInRange ? [{ yAxis: thresholdValue }] : [],
        },
      },
    ],
  });
}

export function disposeLineChart(chart) {
  if (chart && !chart.isDisposed()) chart.dispose();
}