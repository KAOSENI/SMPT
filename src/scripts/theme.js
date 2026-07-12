// Selector de tema visual (Claro / Fósforo / Oscuro). Ver las variables en
// src/styles/theme.css para los tres juegos de colores.

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.themeBtn === theme));
  });
}

export function wireThemeButtons() {
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.addEventListener('click', () => setTheme(b.dataset.themeBtn));
  });
}
