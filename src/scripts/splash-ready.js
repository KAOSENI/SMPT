// src/scripts/splash-ready.js
//
// El splash (ver SplashScreen.astro) tapa la pantalla ~0.9s al cargar la
// página y, al terminar, marca window.__splashReady = true y dispara el
// evento 'splash-ready'. Este módulo es el punto de entrada que usan
// main.js y Sidebar.astro para esperar ese momento antes de montar
// cualquier gráfica de ECharts — así se les da tiempo de sobra al
// navegador para terminar de resolver el layout antes de que ECharts
// intente medir el contenedor (si no, clientWidth/clientHeight pueden leer
// 0 en ese instante, y ECharts lo reporta como advertencia en consola).
//
// Contempla el caso en que este código corra DESPUÉS de que el splash ya
// haya terminado (por ejemplo, si la carga del módulo tardó): en ese caso
// window.__splashReady ya es true y se ejecuta de inmediato, sin quedarse
// esperando un evento que ya pasó.
export function onSplashReady(callback) {
  if (typeof window === 'undefined') return;
  if (window.__splashReady) {
    callback();
    return;
  }
  window.addEventListener('splash-ready', callback, { once: true });
}
