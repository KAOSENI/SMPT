// Estado "vivo" de los 11 transmisores: valores actuales de potencia/ROE/temperatura,
// histórico acumulado en la sesión, umbrales configurables, fases y equipos instalados.
// Este es el único lugar donde vive el arreglo `state` — todo lo demás lo importa de aquí.

import { STATIONS, EQUIPMENT_KEYS } from './data/stations.js';
import { rand, seedHistory } from './utils.js';

export const state = STATIONS.map((s, i) => {
  const power = s.powerKW ? Math.min(100, s.powerKW * 8 + rand(-3, 3)) : rand(70, 98);
  const vswr = rand(1.0, 1.6);
  const temp = rand(28, 46);
  const equipment = {};
  EQUIPMENT_KEYS.forEach(k => { equipment[k] = { installed: false, on: false }; });
  return {
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
    waveform: Array.from({ length: 16 }, () => rand(20, 100)),
    history: { power: seedHistory(power), vswr: seedHistory(vswr), temp: seedHistory(temp) },
    logs: [],
    thresholds: { powerMin: 72, vswrMax: 1.5, tempMax: 42 },
    phaseA: true, phaseB: true,
    config: { phaseMonitoring: 2 },
    equipment: equipment,
    _lastStatus: null,
  };
});
