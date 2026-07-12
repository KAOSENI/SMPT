// Catálogo de las 11 estaciones del Sistema Chiapaneco de Radio, Televisión y
// Cinematografía, y el catálogo de equipos que puede tener cada transmisor.
// Editar SOLO este archivo para agregar/quitar transmisores o tipos de equipo.

// ============================================================
// DATOS DE ESTACIONES
// ============================================================
export const STATIONS = [
  { call:"XHTGU-FM", name:"Radio Chiapas",         band:"FM", freqLabel:"93.9 MHz",  municipio:"Tuxtla Gutierrez",       lat:16.7729, lon:-93.1281, powerKW:null },
  { call:"XERA-AM",  name:"Radio Uno",              band:"AM", freqLabel:"760 kHz",   municipio:"San Cristobal de las Casas", lat:16.7370, lon:-92.6376, powerKW:null },
  { call:"XEPLE-AM", name:"Radio Palenque",         band:"AM", freqLabel:"1040 kHz",  municipio:"Palenque",               lat:17.5091, lon:-91.9822, powerKW:5 },
  { call:"XEOCH-AM", name:"Kin Radio",             band:"AM", freqLabel:"600 kHz",   municipio:"Ocosingo",               lat:16.9078, lon:-92.0930, powerKW:10 },
  { call:"XHTCH-FM", name:"Oceano FM",              band:"FM", freqLabel:"102.7 MHz", municipio:"Tapachula",              lat:14.9036, lon:-92.2724, powerKW:null },
  { call:"XHNAL-FM", name:"Digital 89",             band:"FM", freqLabel:"89.5 MHz",  municipio:"Tonala",                 lat:16.0814, lon:-93.7502, powerKW:null },
  { call:"XETEC-AM", name:"Radio Tecpatan",         band:"AM", freqLabel:"1140 kHz",  municipio:"Tecpatan",               lat:17.1361, lon:-93.3111, powerKW:null },
  { call:"XHSDM-FM", name:"La Voz de la Selva",     band:"FM", freqLabel:"95.7 MHz",  municipio:"Sto. Domingo, Ocosingo", lat:16.9000, lon:-91.8500, powerKW:1 },
  { call:"XHCTN-FM", name:"Brisas de Montebello",   band:"FM", freqLabel:"89.9 MHz",  municipio:"La Trinitaria",          lat:16.1167, lon:-92.0500, powerKW:2.5 },
  { call:"XHPIC-FM", name:"Frecuencia V Norte",     band:"FM", freqLabel:"102.1 MHz", municipio:"Pichucalco",             lat:17.5100, lon:-93.1160, powerKW:null },
  { call:"XHSIL-FM", name:"Radio Siltepec",         band:"FM", freqLabel:"99.9 MHz",  municipio:"Siltepec",               lat:15.5572, lon:-92.3229, powerKW:null },
];

export const EQUIPMENT_LABELS = {
  stl:       { name:"Enlace estudio–transmisor (STL)", sub:"Recibe la señal de audio desde la cabina", critical:false },
  processor: { name:"Procesador de audio",               sub:"Normaliza y prepara el audio antes de modular", critical:false },
  exciter:   { name:"Excitador",                          sub:"Genera la señal de RF de baja potencia", critical:true },
  amplifier: { name:"Amplificador de potencia",           sub:"Eleva la señal a la potencia de transmisión", critical:true },
  antenna:   { name:"Sistema de antena / combinador",     sub:"Radía la señal final al aire", critical:true },
  backup:    { name:"Respaldo de energía (UPS / planta)", sub:"Entra en caso de falla de suministro", critical:false },
};

export const EQUIPMENT_KEYS = ['stl','processor','exciter','amplifier','antenna','backup'];
