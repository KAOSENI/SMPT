/// <reference types="astro/client" />

// Sidebar.astro guarda ahí las instancias vivas de ECharts (gauge, pie, barras)
// para poder llamarlas de nuevo en el resize y en las actualizaciones periódicas.
// Sin esta declaración, TypeScript no sabe que esas propiedades existen en
// `window` y marca error aunque en tiempo de ejecución funcione bien.
declare global {
  interface Window {
    // Gráficas ECharts
    _gaugeChart?: import('echarts').ECharts;
    _pie?: import('echarts').ECharts;
    _barsChart?: import('echarts').ECharts;
    _statusPie?: import('echarts').ECharts;
    
    // Estado global de la aplicación
    __APP_STATE__?: any[];
    
    // Funciones de actualización del sidebar
    updateBarsChart?: () => void;
    updateStatusPie?: (ok: number, warn: number, crit: number) => void;
    updateSidebarGauge?: (availability: number) => void;
    __updateSidebarStatus?: (ok: number, warn: number, crit: number) => void;
    
    // Ventana flotante de estadísticas
    openStatsModal?: () => void;
    initSidebarCharts?: () => void | Promise<void>;
    closeStatsModal?: () => void;
    __refreshStatsModal?: () => void;
    
    // Otras funciones globales (ya existentes)
    openDetail?: (id: number | string) => void;
    closeDetail?: () => void;
  }
}

export {};