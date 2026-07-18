// src/scripts/status.js
// Calcula el estado (ok / warn / crit) de un transmisor a partir de sus métricas,
// sus umbrales configurados, sus fases eléctricas y los equipos instalados/encendidos.

import { EQUIPMENT_LABELS } from './data/stations.js';

// Evalúa CADA parámetro por separado (ROE, temperatura, potencia, fases,
// equipos) y junta todo en una sola lista de "motivos", cada uno con su
// propia severidad (1 = advertencia, 2 = crítico).
export function evaluateStatus(tx) {
  // --- VALIDACIÓN: Si tx es undefined o no tiene equipment, devolver ok ---
  if (!tx || typeof tx !== 'object' || !tx.equipment) {
    return { status: 'ok', reasons: [] };
  }

  const eq = tx.equipment;
  const pm = tx.config?.phaseMonitoring || 0;
  const th = tx.thresholds || { powerMin: 72, vswrMax: 1.5, tempMax: 42 };
  const reasons = [];

  const critVswr = th.vswrMax + 0.3;
  const critTemp = th.tempMax + 8;

  if (tx.vswr > critVswr) reasons.push({ severity: 2, text: 'ROE muy elevado' });
  else if (tx.vswr > th.vswrMax) reasons.push({ severity: 1, text: 'ROE elevado' });

  if (tx.temp > critTemp) reasons.push({ severity: 2, text: 'Temperatura muy alta' });
  else if (tx.temp > th.tempMax) reasons.push({ severity: 1, text: 'Temperatura alta' });

  if (tx.power < th.powerMin) reasons.push({ severity: 1, text: 'Potencia baja' });

  if (pm > 0) {
    const aOk = tx.phaseA, bOk = (pm === 2) ? tx.phaseB : true;
    if (!aOk && !bOk) reasons.push({ severity: 2, text: 'Fase A y B caídas' });
    else if (!aOk) reasons.push({ severity: 1, text: pm === 2 ? 'Fase A caída' : 'Fase eléctrica caída' });
    else if (!bOk) reasons.push({ severity: 1, text: 'Fase B caída' });
  }

  for (const [key, eqState] of Object.entries(eq)) {
    if (!eqState || !eqState.installed || eqState.on) continue;
    const label = EQUIPMENT_LABELS[key];
    if (label) {
      reasons.push({ severity: label.critical ? 2 : 1, text: `${label.name} apagado` });
    }
  }

  const maxSeverity = reasons.reduce((m, r) => Math.max(m, r.severity), 0);
  const status = maxSeverity === 2 ? 'crit' : maxSeverity === 1 ? 'warn' : 'ok';
  const topReasons = reasons.filter(r => r.severity === maxSeverity).map(r => r.text);

  return { status, reasons: topReasons };
}

export function statusOf(tx) {
  return evaluateStatus(tx).status;
}

// Motivo(s) específico(s) por los que un transmisor está en advertencia o
// crítico (p. ej. "ROE elevado", "Temperatura alta"). Arreglo vacío si el
// transmisor está en ok.
export function statusReasons(tx) {
  return evaluateStatus(tx).reasons;
}