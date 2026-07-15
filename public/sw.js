// public/sw.js
//
// Service worker mínimo para que el panel sea instalable (PWA) y quede
// disponible sin conexión con el último contenido que se alcanzó a cachear.
//
// No hay un paso de build que genere una lista de archivos con hash para
// precachear, así que en vez de eso se cachea "sobre la marcha": la primera
// vez que se pide un recurso del mismo origen se guarda en caché, y las
// siguientes veces se sirve desde ahí. Estrategia:
//   - Navegación (abrir/recargar la página): red primero, caché de respaldo
//     si no hay conexión.
//   - Todo lo demás (JS, CSS, imágenes, íconos): caché primero, red de
//     respaldo (y se guarda en caché para la próxima vez).
//
// Importante: los datos que se ven en el panel son SIMULADOS en el propio
// navegador (no vienen de un servidor), así que "funcionar offline" aquí
// significa que la interfaz carga igual sin conexión — no que haya
// telemetría real llegando sin internet.

const CACHE_NAME = 'smpt-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo interceptar GET del mismo origen. Todo lo demás (POST, orígenes
  // externos, etc.) pasa de largo sin tocarlo.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(self.registration.scope))
            // Si tampoco hay nada cacheado (primera visita sin conexión),
            // respondWith() necesita SÍ o SÍ una Response; devolver
            // undefined provoca "Failed to convert value to 'Response'".
            .then((finalResponse) => finalResponse || Response.error())
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        // Igual que arriba: si falla el fetch y no había nada en caché,
        // hay que devolver una Response válida, no `undefined`.
        .catch(() => cached || Response.error());
    })
  );
});