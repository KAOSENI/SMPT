// src/scripts/persist.js
//
// Guarda en localStorage lo que el usuario configura a mano (tema visual,
// umbrales, fases, equipos instalados/encendidos) para que sobreviva a un
// refresh de página o a volver a abrir el sitio más tarde.
//
// A propósito NO se guarda nada de la simulación en vivo (potencia, ROE,
// temperatura, histórico, uptime): esos valores son demostrativos y cada
// sesión debe arrancar con una simulación fresca (ver README).
//
// Todo está envuelto en try/catch porque localStorage puede fallar (modo
// privado/incógnito, cuota llena, navegador con storage deshabilitado) — si
// eso pasa, la app simplemente no persiste entre sesiones, pero sigue
// funcionando con normalidad.

const CONFIG_KEY = 'smpt:config:v1';
const THEME_KEY = 'smpt:theme:v1';
const LAYOUT_KEY = 'smpt:layout:v1';
const TOASTS_KEY = 'smpt:toasts-enabled:v1';

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ver nota de arriba: fallo silencioso a propósito.
  }
}

export function loadTheme() {
  return safeGet(THEME_KEY);
}

export function saveTheme(theme) {
  safeSet(THEME_KEY, theme);
}

// Se identifica cada transmisor por su `call` (indicativo), no por índice
// numérico, para que la configuración guardada siga aplicando aunque el
// orden del arreglo STATIONS cambie más adelante.
export function saveConfig(state) {
  const data = {};
  state.forEach(tx => {
    data[tx.call] = {
      thresholds: tx.thresholds,
      phaseMonitoring: tx.config.phaseMonitoring,
      phaseA: tx.phaseA,
      phaseB: tx.phaseB,
      equipment: Object.fromEntries(
        Object.entries(tx.equipment).map(([key, eq]) => [key, { installed: eq.installed, on: eq.on }])
      ),
    };
  });
  safeSet(CONFIG_KEY, JSON.stringify(data));
}

// Devuelve un objeto { [call]: {...} } con lo guardado en una sesión
// anterior, o {} si no hay nada todavía (primera visita) o si el JSON
// guardado está corrupto.
export function loadConfig() {
  const raw = safeGet(CONFIG_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Preferencias de disposición de la página (qué secciones se ven y cómo se
// acomodan el mapa/panel lateral/cuadrícula). Ver src/scripts/layout-prefs.js
// para la lógica que las aplica. Devuelve null si no hay nada guardado
// todavía (primera visita) o si el JSON está corrupto, para que quien la
// llame use sus propios valores por defecto.
export function loadLayoutPrefs() {
  const raw = safeGet(LAYOUT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLayoutPrefs(prefs) {
  safeSet(LAYOUT_KEY, JSON.stringify(prefs));
}

// Notificaciones emergentes (toast) — activadas por defecto. Se guarda
// como texto '0'/'1' en vez de JSON porque es un valor único y simple.
export function loadToastsEnabled() {
  const raw = safeGet(TOASTS_KEY);
  return raw !== '0'; // por defecto activado si no hay nada guardado
}

export function saveToastsEnabled(enabled) {
  safeSet(TOASTS_KEY, enabled ? '1' : '0');
}