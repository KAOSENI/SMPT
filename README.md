<div align="center">

<img src="./logo-schrtyc.png" alt="Logo del Sistema Chiapaneco de Radio, Televisión y Cinematografía" width="120" />

# Red de Transmisores — Panel de Monitoreo

**Panel de monitoreo en tiempo real para los 11 transmisores del Sistema Chiapaneco de Radio, Televisión y Cinematografía.**

[![Deploy to GitHub Pages](https://img.shields.io/github/actions/workflow/status/KAOSENI/SMPT/main.yml?branch=main&label=deploy&logo=github)](https://github.com/KAOSENI/SMPT/actions/workflows/main.yml)
[![Versión](https://img.shields.io/github/package-json/v/KAOSENI/SMPT?label=versi%C3%B3n&color=0a6e4b)](https://github.com/KAOSENI/SMPT/commits/main)
[![Astro](https://img.shields.io/badge/Astro-7.0.7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Licencia](https://img.shields.io/github/license/KAOSENI/SMPT)](./LICENSE)

**[Ver en producción](https://kaoseni.github.io/SMPT/)**

</div>

---

## Índice

- [Qué es esto](#qué-es-esto)
- [Características](#características)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Requisitos](#requisitos)
- [Uso local](#uso-local)
- [Qué archivo tocar para cada cosa](#qué-archivo-tocar-para-cada-cosa)
- [Persistencia de datos](#persistencia-de-datos)
- [PWA e instalación](#pwa-e-instalación)
- [Desplegar en GitHub Pages](#desplegar-en-github-pages)
- [Notas sobre los datos](#notas-sobre-los-datos)
- [Licencia](#licencia)

---

## Qué es esto

Prototipo de plataforma de monitoreo para los 11 transmisores (AM/FM) del
Sistema Chiapaneco de Radio, Televisión y Cinematografía. Nació como un solo
archivo HTML y se migró a un proyecto **Astro** modular, para poder editar
cada apartado por separado y desplegarlo automáticamente en GitHub Pages.

## Características

| Apartado | Descripción |
|---|---|
| **Mapa interactivo** | Ubicación real de los 11 transmisores sobre el contorno de Chiapas, con zoom y arrastre. |
| **Cuadrícula de transmisores** | Tarjetas con mini-gráficas de historial en vivo por transmisor. |
| **Panel de detalle** | Métricas, alimentación eléctrica, cadena de equipos, eventos e historial — layout de 2 columnas en pantallas anchas. |
| **Panel de configuración** | Umbrales de alerta, monitoreo de fase eléctrica, equipos instalados, con opción de restablecer valores por defecto. |
| **Panel lateral** | Disponibilidad de red (gauge), distribución de estados (dona) y bitácora de eventos. |
| **Notificaciones** | Avisos tipo *toast* para cambios de estado relevantes. |
| **Ventana "Acerca de"** | Explicación de términos técnicos, siglas y créditos del proyecto. |
| **Temas de color** | Claro / Fósforo / Oscuro, sin flash al cargar la página. |
| **Persistencia local** | La configuración (umbrales, fases, equipos, tema) sobrevive a un refresh o a cerrar y volver a abrir el sitio. |
| **PWA real** | Instalable en escritorio/móvil (`site.webmanifest` + favicon completo) y disponible sin conexión mediante *service worker* (`public/sw.js`). |

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| **[Astro](https://astro.build/)** | Framework del sitio: componentes `.astro`, generación estática (SSG) para GitHub Pages. |
| **JavaScript (ESM)** | Toda la lógica de la app (`src/scripts/*.js`), en módulos resueltos por Astro/Vite. |
| **TypeScript (modo estricto)** | Chequeo de tipos en los `.astro` y en `src/env.d.ts` (declaraciones globales de `window`). |
| **[ECharts](https://echarts.apache.org/)** | Todas las gráficas: mini-históricos de tarjeta, gráficas de detalle, gauge/dona del panel lateral. |
| **[Lucide (@lucide/astro)](https://lucide.dev/)** | Iconografía SVG en los componentes `.astro`. |
| **CSS puro** | Sin framework de estilos; un archivo por apartado en `src/styles/*.css`. |
| **SVG a mano** | Contorno de Chiapas en el mapa, sin librería de mapas externa. |
| **Service Worker** (Vanilla, sin librerías) | Cachea recursos sobre la marcha para que el panel cargue instalado/offline. Ver `public/sw.js`. |
| **Vite** | Motor de build/dev-server de Astro (bundling, hot-reload). |
| **GitHub Actions + Pages** | Build y despliegue automático en cada push a `main`. |

## Requisitos

- Node.js 22 o superior
- npm

## Uso local

```bash
npm install
npm run dev       # servidor local con recarga en caliente, http://localhost:4321
npm run build     # genera el sitio estático final en dist/
npm run preview   # sirve dist/ localmente para probar el build de producción
```

## Qué archivo tocar para cada cosa

No hace falta regenerar todo el proyecto para corregir un detalle — cada
apartado vive en su propio archivo:

| Quiero cambiar... | Archivo |
|---|---|
| Agregar/quitar un transmisor, o un tipo de equipo | `src/scripts/data/stations.js` |
| El estado "vivo" de los transmisores (valores actuales, histórico, umbrales, fases, equipos) | `src/scripts/state.js` |
| Funciones auxiliares pequeñas (números aleatorios, histórico inicial) | `src/scripts/utils.js` |
| Las reglas de cuándo algo es "advertencia" o "crítico" | `src/scripts/status.js` |
| El contorno de Chiapas o la proyección del mapa | `src/scripts/data/chiapas-path.js`, `src/scripts/map.js` |
| Zoom, arrastre, menú de opciones del mapa | `src/scripts/map-interaction.js` |
| Las tarjetas de la cuadrícula de transmisores | `src/scripts/grid.js`, `src/components/TransmitterGrid.astro` |
| La ventana de datos de un transmisor | `src/scripts/detail.js`, `src/components/DetailModal.astro` |
| La ventana de Configuración de un transmisor | `src/scripts/settings.js`, `src/components/SettingsModal.astro` |
| Cambios de estado de un transmisor (umbrales, fases, equipos) | `src/scripts/controls.js` |
| Guardar/leer configuración entre sesiones (`localStorage`) | `src/scripts/persist.js` |
| Notificaciones tipo *toast* | `src/scripts/toast.js` |
| La ventana "Acerca de" | `src/scripts/about.js`, `src/components/AboutModal.astro`, `src/styles/about.css` |
| La bitácora de eventos / resumen del panel lateral | `src/scripts/events.js` |
| El panel de estadísticas/KPIs globales del dashboard | `src/scripts/dashboard.js`, `src/components/DashboardStats.astro` |
| Las gráficas de histórico | `src/scripts/charts.js` |
| La simulación en vivo (qué tan rápido cambian los datos) | `src/scripts/tick.js` |
| Los tres temas de color (Claro/Fósforo/Oscuro) | `src/styles/theme.css`, `src/scripts/theme.js` |
| El favicon, PWA e íconos de instalación | `public/site.webmanifest`, `public/favicon*`, `src/layouts/Layout.astro` |
| El comportamiento offline / caché del service worker | `public/sw.js`, `src/scripts/pwa.js` |
| El diseño/CSS de una sección (mapa, sidebar, tarjetas, modales...) | `src/styles/*.css` (un archivo por apartado) |
| El HTML de una sección de la página | `src/components/*.astro` |
| El orden de las secciones en la página | `src/pages/index.astro` |

Todo lo demás (cómo se conectan los módulos entre sí, la inicialización) vive
en `src/scripts/main.js`, con comentarios explicando cada import.

> **Nota sobre las gráficas en vivo:** se montan **una sola vez** como
> instancias vivas de ECharts; en cada tick solo reciben datos nuevos con
> `chart.setOption(...)`, sin destruir y recrear el SVG. Cada tarjeta y cada
> panel de detalle están divididos en "cascarón" (se crea una vez) y "datos"
> (se actualizan en cada tick) — si tocas `grid.js`, `detail.js` o
> `charts.js`, conviene respetar esa separación para no reintroducir el
> parpadeo.

## Persistencia de datos

La configuración que ajustas a mano en la ventana de **Configuración**
(umbrales, monitoreo de fase, equipos instalados/encendidos) y el tema
visual elegido se guardan en `localStorage` del navegador (`src/scripts/persist.js`),
identificados por el indicativo de cada transmisor. Así sobreviven a un
refresh de página o a cerrar y volver a abrir el sitio.

Los valores simulados en vivo (potencia, ROE, temperatura, histórico,
uptime, eventos) **no se guardan a propósito**: son demostrativos y cada
sesión arranca con una simulación fresca. Si en el futuro se conecta un
servidor real con telemetría, esa sería la fuente de verdad de esos datos,
no `localStorage`.

## PWA e instalación

El panel es instalable como aplicación (ícono en escritorio/menú de inicio,
sin la barra de direcciones del navegador) desde Chrome/Edge ("Instalar
app") o desde Safari en iOS ("Compartir → Agregar a pantalla de inicio").

Un *service worker* (`public/sw.js`) cachea los recursos del sitio sobre la
marcha, así que una vez que lo visitaste una vez con conexión, vuelve a
cargar aunque no tengas internet — útil para revisar la última lectura
visible sin depender de la red. Al entrar con conexión siempre se pide la
versión más nueva primero (no se queda pegado a una versión vieja en caché);
solo recurre a lo cacheado cuando de verdad no hay red.

> Los datos que muestra el panel son simulados en el propio navegador (ver
> [Notas sobre los datos](#notas-sobre-los-datos)) — "funcionar offline"
> aquí es que la interfaz siga cargando, no que haya telemetría real
> llegando sin internet.

## Desplegar en GitHub Pages

1. Sube este proyecto a un repositorio de GitHub.
2. Abre `astro.config.mjs` y ajusta:
   ```js
   site: 'https://TU-USUARIO.github.io',
   base: '/TU-REPO',
   ```
   (Si tu repo se llama exactamente `TU-USUARIO.github.io`, deja `base: '/'`.)
3. En GitHub: **Settings → Pages → Build and deployment → Source →
   "GitHub Actions"**. (Si queda en "Deploy from a branch", GitHub dispara
   también su propio build automático de Jekyll en cada push, que siempre
   falla porque este no es un sitio Jekyll — solo debe quedar seleccionado
   "GitHub Actions".)
4. Haz push a la rama `main`. El workflow en `.github/workflows/main.yml`
   ya incluido compila el proyecto y lo publica automáticamente en cada
   push — no necesitas subir la carpeta `dist/` a mano.

## Notas sobre los datos

- Las 11 estaciones y sus coordenadas fueron verificadas contra el sitio
  oficial del Sistema Chiapaneco de Radio, TV y Cinematografía y Wikipedia.
- Los valores de potencia/ROE/temperatura y los eventos son **simulados**
  con fines de demostración — no provienen de telemetría real.
- Por defecto ningún transmisor tiene equipos "instalados": eso se activa
  por transmisor desde su ventana de Configuración, ya que no todos cuentan
  con los mismos equipos ni con monitoreo de fase eléctrica.

## Licencia

Este proyecto está bajo la licencia **GNU GPLv3** — ver [`LICENSE`](./LICENSE)
para el texto completo.

---

<div align="center">

Sergio Iván Díaz Hernández · 2026

</div>