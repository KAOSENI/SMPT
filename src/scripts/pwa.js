// src/scripts/pwa.js
//
// Registra el service worker (public/sw.js) para que el panel sea
// instalable como app (PWA) y quede disponible sin conexión con el último
// contenido cacheado. Ver sw.js para la estrategia de cacheo, y
// public/site.webmanifest para el nombre/íconos/colores de la app instalada.

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // En desarrollo (astro dev / vite) no registramos el SW: interceptar las
  // peticiones del propio servidor de desarrollo (HMR, módulos, etc.)
  // provoca errores de red y respuestas inválidas que no tienen que ver
  // con la app en sí. El SW solo tiene sentido en el build de producción.
  if (import.meta.env.DEV) return;

  // El sitio se publica bajo /SMPT (ver "base" en astro.config.mjs), así
  // que el service worker debe registrarse con ese mismo scope — si no,
  // el navegador lo rechaza por quedar fuera de su alcance permitido.
  //
  // import.meta.env.BASE_URL es literalmente el valor de "base" tal cual
  // se escribió en astro.config.mjs (aquí "/SMPT", SIN slash final).
  // Astro no le agrega la barra por nosotros, así que hay que normalizarla
  // aquí — si no, "${base}sw.js" queda como "/SMPTsw.js" en vez de
  // "/SMPT/sw.js".
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch((err) => {
      console.warn('[PWA] No se pudo registrar el service worker:', err);
    });
  });
}