// src/scripts/data/stations-manager.js
// Gestor dinámico del catálogo de transmisores.

import { STATIONS as DEFAULT_STATIONS } from './stations.js';

const STORAGE_KEY = 'smrt_stations';

function isBrowser() {
  try {
    return typeof window !== 'undefined' && 
           typeof window.localStorage !== 'undefined' &&
           window.localStorage !== null;
  } catch (e) {
    return false;
  }
}

// Asignar IDs a los transmisores por defecto (solo la primera vez)
function ensureDefaultStationsWithIds() {
  // Verificar si los DEFAULT_STATIONS ya tienen IDs
  const hasIds = DEFAULT_STATIONS.every(s => s.id !== undefined);
  if (hasIds) return DEFAULT_STATIONS;
  
  // Asignar IDs basados en el índice (empezando desde 1)
  return DEFAULT_STATIONS.map((s, index) => ({
    ...s,
    id: index + 1
  }));
}

export function getStations() {
  if (!isBrowser()) {
    return JSON.parse(JSON.stringify(ensureDefaultStationsWithIds()));
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  
  // Guardar datos por defecto con IDs
  const defaultWithIds = ensureDefaultStationsWithIds();
  saveStations(defaultWithIds);
  return JSON.parse(JSON.stringify(defaultWithIds));
}

export function saveStations(stations) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
  } catch (e) {}
}

export function resetToDefaultStations() {
  const defaultWithIds = ensureDefaultStationsWithIds();
  saveStations(defaultWithIds);
  return JSON.parse(JSON.stringify(defaultWithIds));
}

export function addStation(stationData = {}) {
  const stations = getStations();
  const maxId = stations.reduce((max, s) => Math.max(max, s.id || 0), 0);
  const newId = maxId + 1;
  
  const newStation = {
    id: newId,
    call: stationData.call || `XH${String(newId).padStart(3, '0')}-FM`,
    name: stationData.name || `Radio ${newId}`,
    band: stationData.band || 'FM',
    freqLabel: stationData.freqLabel || `${(87.5 + (newId - 1) * 0.1).toFixed(1)} MHz`,
    municipio: stationData.municipio || 'Nuevo',
    lat: stationData.lat || 16.0 + (Math.random() - 0.5) * 2,
    lon: stationData.lon || -92.0 + (Math.random() - 0.5) * 2,
    powerKW: stationData.powerKW || null,
  };
  stations.push(newStation);
  saveStations(stations);
  return newStation;
}

export function removeStation(id) {
  const stations = getStations();
  if (stations.length <= 1) {
    throw new Error('No se puede eliminar el último transmisor');
  }
  const filtered = stations.filter(s => s.id !== id);
  if (filtered.length === stations.length) {
    throw new Error('Transmisor no encontrado');
  }
  saveStations(filtered);
  return filtered;
}

export function getStationIds() {
  return getStations().map(s => s.id);
}

export function stationExists(id) {
  return getStations().some(s => s.id === id);
}