// Calcula el estado (ok / warn / crit) de un transmisor a partir de sus métricas,
// sus umbrales configurados, sus fases eléctricas y los equipos instalados/encendidos.
// Editar SOLO este archivo para cambiar las reglas de qué cuenta como advertencia o crítico.

import { EQUIPMENT_LABELS } from './data/stations.js';

export function statusOf(tx) {
  const eq = tx.equipment;
  const pm = tx.config.phaseMonitoring;
  const th = tx.thresholds;

  let base = 'ok';
  const critVswr = th.vswrMax + 0.3;
  const critTemp = th.tempMax + 8;
  if (tx.vswr > critVswr || tx.temp > critTemp) base = 'crit';
  else if (tx.vswr > th.vswrMax || tx.temp > th.tempMax || tx.power < th.powerMin) base = 'warn';

  if (pm > 0) {
    const aOk = tx.phaseA, bOk = (pm === 2) ? tx.phaseB : true;
    if (!aOk && !bOk) return 'crit';
    if (!aOk || !bOk) {
      if (base === 'crit') return 'crit';
      return 'warn';
    }
  }

  let criticalInstalledOff = false;
  let nonCriticalInstalledOff = false;

  for (const [key, eqState] of Object.entries(eq)) {
    if (!eqState.installed) continue;
    if (!eqState.on) {
      if (EQUIPMENT_LABELS[key].critical) criticalInstalledOff = true;
      else nonCriticalInstalledOff = true;
    }
  }

  if (criticalInstalledOff) return 'crit';
  if (nonCriticalInstalledOff) {
    if (base === 'crit') return 'crit';
    return 'warn';
  }

  return base;
}
