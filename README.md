# Red de Transmisores — Panel de Monitoreo (Astro)

Prototipo de plataforma de monitoreo para los 11 transmisores del Sistema
Chiapaneco de Radio, Televisión y Cinematografía. Migrado de un solo archivo
HTML a un proyecto Astro para poder editar cada apartado por separado y
desplegarlo en GitHub Pages.

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
| Las reglas de cuando algo es "advertencia" o "critico"             | `src/scripts/status.js` |
| El contorno de Chiapas o la proyeccion del mapa                    | `src/scripts/data/chiapas-path.js`, `src/scripts/map.js` |
| Zoom, arrastre, menu de opciones del mapa                          | `src/scripts/map-interaction.js` |
| La ventana de datos de un transmisor                                | `src/scripts/detail.js` |
| La ventana de Configuracion de un transmisor                        | `src/scripts/settings.js` |
| La bitacora de eventos / resumen del panel lateral                  | `src/scripts/events.js` |
| Las graficas de historico                                            | `src/scripts/charts.js` |
| La simulacion en vivo (que tan rapido cambian los datos)             | `src/scripts/tick.js` y `src/pages/index.astro` (intervalo) |
| Los tres temas de color (Claro/Fosforo/Oscuro)                       | `src/styles/theme.css`, `src/scripts/theme.js` |
| El diseno/CSS del mapa, la barra lateral, las tarjetas, etc.          | `src/styles/*.css` (un archivo por apartado) |
| El HTML de una seccion de la pagina (encabezado, mapa, sidebar...)   | `src/components/*.astro` |
| El orden de las secciones en la pagina                                | `src/pages/index.astro` |

Todo lo demas (como se conectan los modulos entre si, la inicializacion) vive
en `src/scripts/main.js`, con comentarios explicando cada import.

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
   `.github/workflows/deploy.yml` ya incluido compila el proyecto y lo
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
