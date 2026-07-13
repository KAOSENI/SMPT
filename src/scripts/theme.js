// Selector de tema visual (Claro / Fósforo / Oscuro). Ver las variables en
// src/styles/theme.css para los tres juegos de colores. Se persiste en
// localStorage para que la próxima visita recuerde el tema elegido.

import { saveTheme, loadTheme } from './persist.js';

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.themeBtn === theme));
  });
  saveTheme(theme);
}

export function wireThemeButtons() {
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.addEventListener('click', () => setTheme(b.dataset.themeBtn));
  });
}

export { loadTheme };
