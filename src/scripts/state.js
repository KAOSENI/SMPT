// Estado "vivo" de los 11 transmisores: valores actuales de potencia/ROE/temperatura,
// histórico acumulado en la sesión, umbrales configurables, fases y equipos instalados.
// Este es el único lugar donde vive el arreglo `state` — todo lo demás lo importa de aquí.

import { STATIONS, EQUIPMENT_KEYS } from './data/stations.js';
import { rand, seedHistory } from './utils.js';
import { loadConfig } from './persist.js';

// Configuración guardada en una sesión anterior (localStorage), indexada
// por indicativo (`call`). Se lee una sola vez al cargar el módulo.
const savedConfig = loadConfig();

export const state = STATIONS.map((s, i) => {
  const power = s.powerKW ? Math.min(100, s.powerKW * 8 + rand(-3, 3)) : rand(70, 98);
  const vswr = rand(1.0, 1.6);
  const temp = rand(28, 46);
  const equipment = {};
  EQUIPMENT_KEYS.forEach(k => { equipment[k] = { installed: false, on: false }; });

  const tx = {
    id: i,
    name: `${s.name} (${s.call})`,
    shortName: s.name,
    call: s.call,
    band: s.band,
    municipio: s.municipio,
    freq: s.freqLabel,
    lat: s.lat, lon: s.lon,
    power, powerKW: s.powerKW, vswr, temp,
    uptime: Math.floor(rand(30, 900)),
    history: { power: seedHistory(power), vswr: seedHistory(vswr), temp: seedHistory(temp) },
    logs: [],
    thresholds: { powerMin: 72, vswrMax: 1.5, tempMax: 42 },
    phaseA: true, phaseB: true,
    config: { phaseMonitoring: 2 },
    equipment: equipment,
    _lastStatus: null,
  };

  // Si este transmisor tiene configuración guardada de una sesión anterior,
  // se aplica sobre los defaults de arriba (Object.assign conserva las
  // llaves que no vinieran guardadas, útil si se agregan equipos nuevos
  // más adelante y localStorage todavía tiene el formato viejo).
  const saved = savedConfig[s.call];
  if (saved) {
    if (saved.thresholds) Object.assign(tx.thresholds, saved.thresholds);
    if (typeof saved.phaseMonitoring === 'number') tx.config.phaseMonitoring = saved.phaseMonitoring;
    if (typeof saved.phaseA === 'boolean') tx.phaseA = saved.phaseA;
    if (typeof saved.phaseB === 'boolean') tx.phaseB = saved.phaseB;
    if (saved.equipment) {
      EQUIPMENT_KEYS.forEach(k => {
        if (saved.equipment[k]) Object.assign(tx.equipment[k], saved.equipment[k]);
      });
    }
  }

  return tx;
});