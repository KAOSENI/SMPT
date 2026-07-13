// src/scripts/pwa.js
//
// Registra el service worker (public/sw.js) para que el panel sea
// instalable como app (PWA) y quede disponible sin conexión con el último
// contenido cacheado. Ver sw.js para la estrategia de cacheo, y
// public/site.webmanifest para el nombre/íconos/colores de la app instalada.

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // El sitio se publica bajo /SMPT (ver "base" en astro.config.mjs), así
  // que el service worker debe registrarse con ese mismo scope — si no,
  // el navegador lo rechaza por quedar fuera de su alcance permitido.
  const base = import.meta.env.BASE_URL;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch((err) => {
      console.warn('[PWA] No se pudo registrar el service worker:', err);
    });
  });
}
