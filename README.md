# Red de Transmisores — Panel de Monitoreo (Astro)

Prototipo de plataforma de monitoreo para los 11 transmisores del Sistema
Chiapaneco de Radio, Televisión y Cinematografía. Migrado de un solo archivo
HTML a un proyecto Astro para poder editar cada apartado por separado y
desplegarlo en GitHub Pages.

**En producción:** https://kaoseni.github.io/SMPT/

## Tecnologías utilizadas

- **[Astro](https://astro.build/)** `^7.0.7` — framework del sitio, componentes `.astro` con HTML/CSS/JS interoperando, generación estática (SSG) para GitHub Pages.
- **JavaScript (ESM)** — toda la lógica de la app (`src/scripts/*.js`), módulos importados/exportados sin bundler propio, resueltos por Astro/Vite.
- **TypeScript en modo estricto** — activado vía `tsconfig.json` (extiende `astro/tsconfigs/strict`); se usa para el chequeo de tipos de los `.astro` y de `src/env.d.ts` (declaraciones globales de `window` para las instancias de ECharts), aunque los scripts en sí están en `.js`.
- **[ECharts](https://echarts.apache.org/)** `^6.1.0` — todas las gráficas: mini-gráficas de historial en las tarjetas, gráficas de Potencia/ROE/Temperatura del panel de detalle, y el gauge/anillo/barras del panel lateral.
- **[Lucide (@lucide/astro)](https://lucide.dev/)** `^1.24.0` — set de iconos SVG usados en los componentes `.astro` (encabezado, dashboard, modales).
- **CSS puro** — sin framework de estilos; un archivo por apartado en `src/styles/*.css`, más `theme.css` para los 3 temas de color (Claro/Fósforo/Oscuro).
- **SVG** — usado directamente para el contorno de Chiapas en el mapa (`src/scripts/data/chiapas-path.js`, `src/scripts/map.js`), sin librería de mapas externa.
- **Node.js** `>=22.12.0` — entorno de desarrollo/build.
- **GitHub Actions + GitHub Pages** — despliegue automático (`.github/workflows/main.yml`) al hacer push a `main`.

## Requisitos

- Node.js 22 o superior
- npm

## Uso local

```bash
npm install
npm run dev       # servidor local con recarga en caliente, http://localhost:4321
npm run build     # genera el sitio estatico final en dist/
npm run preview   # sirve dist/ localmente para probar el build de produccion
```

## Que archivo tocar para cada cosa

No hace falta regenerar todo el proyecto para corregir un detalle — cada
apartado vive en su propio archivo:

| Quiero cambiar...                                              | Archivo |
|-------------------------------------------------------------------|---------|
| Agregar/quitar un transmisor, o un tipo de equipo                 | `src/scripts/data/stations.js` |
| El estado "vivo" de los transmisores (valores actuales, historico, umbrales, fases, equipos) | `src/scripts/state.js` |
| Funciones auxiliares pequeñas (numeros aleatorios, historico inicial) | `src/scripts/utils.js` |
| Las reglas de cuando algo es "advertencia" o "critico"             | `src/scripts/status.js` |
| El contorno de Chiapas o la proyeccion del mapa                    | `src/scripts/data/chiapas-path.js`, `src/scripts/map.js` |
| Zoom, arrastre, menu de opciones del mapa                          | `src/scripts/map-interaction.js` |
| Las tarjetas de la cuadricula de transmisores (11 tarjetas con mini-grafica) | `src/scripts/grid.js`, `src/components/TransmitterGrid.astro` |
| La ventana de datos de un transmisor                                | `src/scripts/detail.js` |
| La ventana de Configuracion de un transmisor                        | `src/scripts/settings.js` |
| Cambios de estado de un transmisor (umbrales, fases, equipos instalados/encendidos) | `src/scripts/controls.js` |
| La bitacora de eventos / resumen del panel lateral                  | `src/scripts/events.js` |
| El panel de estadisticas/KPIs globales del dashboard (arriba de la pagina) | `src/scripts/dashboard.js`, `src/components/DashboardStats.astro` |
| Las graficas de historico (mini-graficas de tarjeta y las 3 del panel de detalle) | `src/scripts/charts.js` |
| La simulacion en vivo (que tan rapido cambian los datos)             | `src/scripts/tick.js` y `src/pages/index.astro` (intervalo) |
| Los tres temas de color (Claro/Fosforo/Oscuro)                       | `src/styles/theme.css`, `src/scripts/theme.js` |
| El diseno/CSS del mapa, la barra lateral, las tarjetas, etc.          | `src/styles/*.css` (un archivo por apartado) |
| El HTML de una seccion de la pagina (encabezado, mapa, sidebar...)   | `src/components/*.astro` |
| El orden de las secciones en la pagina                                | `src/pages/index.astro` |

Todo lo demas (como se conectan los modulos entre si, la inicializacion) vive
en `src/scripts/main.js`, con comentarios explicando cada import.

### Nota sobre las graficas en vivo

Las graficas (mini-graficas de las tarjetas y las 3 del panel de detalle) se
montan **una sola vez** como instancias vivas de ECharts sobre su contenedor;
en cada tick solo reciben datos nuevos con `chart.setOption(...)`, sin
destruir y recrear el SVG. Por eso cada tarjeta y cada panel de detalle estan
divididos en "cascaron" (se crea una vez) y "datos" (se actualizan en cada
tick) — si vas a tocar `grid.js`, `detail.js` o `charts.js`, conviene
respetar esa separacion para no reintroducir el parpadeo.

## Desplegar en GitHub Pages

1. Sube este proyecto a un repositorio de GitHub.
2. Abre `astro.config.mjs` y ajusta:
   ```js
   site: 'https://TU-USUARIO.github.io',
   base: '/TU-REPO',
   ```
   (Si tu repo se llama exactamente `TU-USUARIO.github.io`, deja `base: '/'`.)
3. En GitHub: **Settings -> Pages -> Build and deployment -> Source ->
   "GitHub Actions"**.
4. Haz push a la rama `main`. El workflow en
   `.github/workflows/main.yml` ya incluido compila el proyecto y lo
   publica automaticamente en cada push — no necesitas subir la carpeta
   `dist/` a mano.

## Notas sobre los datos

- Las 11 estaciones y sus coordenadas fueron verificadas contra el sitio
  oficial del Sistema Chiapaneco de Radio, TV y Cinematografia y Wikipedia.
- Los valores de potencia/ROE/temperatura y los eventos son **simulados**
  con fines de demostracion — no provienen de telemetria real.
- Por defecto ningun transmisor tiene equipos "instalados": eso se activa
  por transmisor desde su ventana de Configuracion, ya que no todos cuentan
  con los mismos equipos ni con monitoreo de fase electrica.