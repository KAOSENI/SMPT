# Correcciones: errores de TypeScript + parpadeo de gráficas

## 1. Errores marcados en Sidebar.astro (28 en total)

Corrí el verificador real (`astro-check`) para confirmarlos, no adiviné.
Los 28 eran de 3 tipos, todos por TypeScript en modo estricto — por eso
"funcionaba correctamente" (JavaScript no valida tipos en tiempo de
ejecución) pero el editor sí los marcaba:

- **`window._gaugeChart`, `window._pie`, `window._barsChart`,
  `window.updateBarsChart`** — TypeScript no sabe que le agregaste esas
  propiedades a `window`. Se corrige declarándolas explícitamente.
  → **Nuevo archivo: `src/env.d.ts`**

- **`parseInt(elemento?.textContent)`** — `textContent` puede ser `null` o
  `undefined`, y `parseInt` exige un `string`. Se agregó `|| '0'` antes de
  cada `parseInt` (5 casos: fm, am, ok, warn, crit).

- **`sidebarEl.style...`** — venía de `document.querySelector('.sidebar')`,
  que TypeScript tipa como `Element` genérico (sin `.style`). Se cambió el
  guard a `instanceof HTMLElement`, que si acota el tipo correctamente.

→ **Archivo modificado: `src/components/Sidebar.astro`**

Después de esto: **0 errores** en Sidebar.astro (verificado con
`astro-check` de nuevo).

### Encontrado de paso (no corregido, no era parte de lo pedido)
- `src/components/DashboardStats.astro` usa iconos de lucide marcados como
  deprecados (`AlertCircle`, `AlertTriangle`, `CheckCircle` → sus
  reemplazos son `CircleAlert`, `TriangleAlert`, `CircleCheck`). Son solo
  avisos, no errores.
- `src/pages/prueba-echarts.astro` tiene 1 error real (`Object is possibly
  'null'` en la línea 273) y variables sin usar. Parece un archivo de
  prueba/scratch — dime si quieres que lo revise.

## 2. Las gráficas se borraban y redibujaban en cada actualización

Esto pasaba en **dos lugares**, no solo uno:

1. **Las 11 tarjetas de la cuadrícula principal** (`grid.js`) — cada una
   tiene su mini-gráfica de historial. `renderGrid()` se llama en cada
   tick, y hacía `card.innerHTML = ...` con la tarjeta COMPLETA, incluida
   la gráfica — así que las 11 gráficas se destruían y recreaban cada 1.5s.
2. **El panel de detalle** (`detail.js`) — mismo problema con sus 3
   gráficas (Potencia/ROE/Temperatura), porque `tick.js` llama a
   `openDetail(id)` de nuevo en cada ciclo mientras el panel sigue abierto.

### La causa de fondo
`charts.js` generaba cada gráfica como un **string de SVG nuevo** en cada
llamada (`echarts.init(null,...) → renderToSVGString() → dispose()`) — un
modo pensado para renderizado del lado del servidor (SSR), no para
actualizaciones en vivo.

### La corrección
Se cambió al mismo patrón que ya usan correctamente el gauge/anillo/barras
del panel lateral: **una instancia viva de ECharts montada una sola vez**
sobre su contenedor, que en cada tick solo recibe datos nuevos con
`chart.setOption(...)` — ECharts actualiza la línea internamente sin
destruir el SVG.

Para lograrlo, cada tarjeta y cada panel de detalle ahora se dividen en:
- **Cascarón** (nombre, frecuencia, contenedor de la gráfica): se crea
  UNA sola vez.
- **Datos** (número de potencia, color del punto de estado, la serie de
  la gráfica): se actualizan en cada tick, sin tocar el cascarón.

→ **Archivos modificados: `src/scripts/charts.js`, `src/scripts/grid.js`,
`src/scripts/detail.js`**

### Cómo lo verifiqué
No solo compilé — armé un bundle real del código y lo ejecuté en un DOM
simulado, comparando el nodo `<svg>` de una gráfica ANTES y DESPUÉS de que
ocurriera un tick real (1.5s, el mismo intervalo que usa la app). En las
dos versiones anteriores el nodo cambiaba (se recreaba); ahora es
exactamente el mismo nodo — la prueba directa de que ya no parpadea.

## Cómo aplicar esto

1. Copia estos archivos sobre tu repo, respetando las rutas.
2. `npm install` no es necesario (no se agregó ninguna dependencia nueva).
3. `npm run dev` o `npm run build` para probar.
