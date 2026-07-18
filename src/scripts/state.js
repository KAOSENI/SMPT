// src/scripts/state.js
// Estado "vivo" de los transmisores.

import { getStations } from './data/stations-manager.js';
import { EQUIPMENT_KEYS } from './data/stations.js';
import { rand, seedHistory } from './utils.js';
import { loadConfig } from './persist.js';

// --- FUNCIÓN PARA DETECTAR NAVEGADOR ---
function isBrowser() {
  try {
    return typeof window !== 'undefined' && 
           typeof window.localStorage !== 'undefined' &&
           window.localStorage !== null;
  } catch (e) {
    return false;
  }
}

// --- CARGA DE CONFIGURACIÓN ---
const savedConfig = isBrowser() ? loadConfig() : {};

// --- CONSTRUIR ESTADO ---
function buildState() {
  const stations = getStations();
  
  return stations.map((s, index) => {
    // Asegurar que cada estación tenga un ID
    const id = s.id !== undefined ? s.id : index;
    
    const power = s.powerKW ? Math.min(100, s.powerKW * 8 + rand(-3, 3)) : rand(70, 98);
    const vswr = rand(1.0, 1.6);
    const temp = rand(28, 46);
    
    // Crear equipment con todas las claves (SIEMPRE)
    const equipment = {};
    EQUIPMENT_KEYS.forEach(k => { 
      equipment[k] = { installed: false, on: false }; 
    });

    const tx = {
      id: id,
      name: `${s.name} (${s.call})`,
      shortName: s.name,
      call: s.call,
      band: s.band,
      municipio: s.municipio,
      freq: s.freqLabel,
      lat: s.lat, 
      lon: s.lon,
      power: power, 
      powerKW: s.powerKW, 
      vswr: vswr, 
      temp: temp,
      uptime: Math.floor(rand(30, 900)),
      history: { 
        power: seedHistory(power), 
        vswr: seedHistory(vswr), 
        temp: seedHistory(temp) 
      },
      logs: [],
      thresholds: { powerMin: 72, vswrMax: 1.5, tempMax: 42 },
      phaseA: true, 
      phaseB: true,
      config: { phaseMonitoring: 2 },
      equipment: equipment,
      _lastStatus: null,
      degradedMs: 0,
    };

    // Aplicar configuración guardada (solo si existe)
    const saved = savedConfig[s.call];
    if (saved) {
      if (saved.thresholds) Object.assign(tx.thresholds, saved.thresholds);
      if (typeof saved.phaseMonitoring === 'number') tx.config.phaseMonitoring = saved.phaseMonitoring;
      if (typeof saved.phaseA === 'boolean') tx.phaseA = saved.phaseA;
      if (typeof saved.phaseB === 'boolean') tx.phaseB = saved.phaseB;
      if (saved.equipment) {
        EQUIPMENT_KEYS.forEach(k => {
          if (saved.equipment[k]) {
            Object.assign(tx.equipment[k], saved.equipment[k]);
          }
        });
      }
    }

    return tx;
  });
}

// --- VALIDAR Y CORREGIR EL ESTADO ---
function validateAndFixState(stateArray) {
  stateArray.forEach((tx, index) => {
    // Si no tiene equipment, crearlo
    if (!tx.equipment || typeof tx.equipment !== 'object') {
      tx.equipment = {};
      EQUIPMENT_KEYS.forEach(k => { 
        tx.equipment[k] = { installed: false, on: false }; 
      });
    }
    
    // Asegurar que todas las claves de equipment existen
    EQUIPMENT_KEYS.forEach(k => {
      if (!tx.equipment[k]) {
        tx.equipment[k] = { installed: false, on: false };
      }
    });
    
    // Si no tiene id, asignarlo
    if (tx.id === undefined) {
      tx.id = index;
    }
  });
  return stateArray;
}

// --- ESTADO INICIAL ---
export let state = validateAndFixState(buildState());

// --- GUARDAR CONFIGURACIÓN ---
export function saveStateConfig() {
  if (!isBrowser()) return;
  const config = {};
  state.forEach(tx => {
    config[tx.call] = {
      thresholds: tx.thresholds,
      equipment: tx.equipment,
      phaseA: tx.phaseA,
      phaseB: tx.phaseB,
      phaseMonitoring: tx.config.phaseMonitoring,
    };
  });
  try {
    window.localStorage.setItem('smrt_transmitter_config', JSON.stringify(config));
  } catch (e) {}
}

// --- RECONSTRUIR ESTADO COMPLETO (desde cero) ---
export function rebuildState() {
  const newState = buildState();
  validateAndFixState(newState);
  
  state.length = 0;
  newState.forEach(tx => state.push(tx));
  
  return state;
}

// --- EXPONER STATE PARA DEPURACIÓN ---
if (isBrowser()) {
  window.__state = state;
}