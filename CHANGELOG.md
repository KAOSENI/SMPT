# Changelog

Resumen de los cambios trabajados en esta sesión, agrupados por área. No sigue un formato de versión estricto — es una bitácora de lo hecho para referencia rápida.

## Agregado

- **Disposición de la página configurable**: arrastrar y soltar para reordenar mapa/panel lateral/cuadrícula/métricas, ocultar secciones, con retroalimentación visual (atenuado + resaltado de color con el color real del tema) mientras se arrastra.
- **Modo compacto de la cuadrícula**: cuando la cuadrícula queda junto al mapa, las tarjetas se acoplan a la misma altura que el mapa (`clamp(320px, 46vw, 540px)`, la misma fórmula que define su lado); si no caben a tamaño completo, se comprimen automáticamente en más columnas — pero conservando siempre la gráfica real (nunca un diseño reducido tipo "solo barra").
- **Badge de potencia en el encabezado**: cuando el medidor "Potencia actual" se oculta (modo junto al mapa), su valor se sigue viendo junto al punto de estado, sin agregar alto a la tarjeta.
- **Motivo de alarma en las tarjetas**: además del estado (ok/advertencia/crítico), se muestra qué parámetro específico lo causó (ROE, temperatura, fase, equipo apagado, etc.), reutilizando la misma lógica que decide el color.
- **"Estadísticas detalladas" con contenido nuevo**: promedios de la red, potencia total autorizada (dato real de `stations.js`), tiempo acumulado en advertencia/crítico por sesión, diagnóstico de conexión (en línea/sin conexión, en vivo), origen de los datos, y tabla completa de los 11 transmisores ordenada por severidad.
- **Persistencia local ampliada**: además de tema y configuración por transmisor, ahora también se guardan la disposición de la página y si las notificaciones están activadas.
- **PWA real**: manifest completo (`start_url`, `scope`, `id`), service worker (`public/sw.js`) con caché "sobre la marcha", meta tags de instalación para iOS.
- **Favicon y meta tags**: `<meta name="description">`, Open Graph/Twitter Card con imagen absoluta, favicon usando el escudo existente.
- **Splash de carga**: logo del sistema al abrir la página (~1s); el montaje de las gráficas de ECharts se difiere hasta que termina, para darle tiempo al navegador de resolver el layout antes de medir contenedores.
- **Notificaciones (toast)**: reposicionadas a la esquina inferior derecha; nuevo toggle para desactivarlas por completo desde "Disposición de la página".
- **Licencia GPLv3** rellenada con nombre de autor y año (antes tenía los placeholders sin completar del texto genérico de la FSF).

## Cambiado

- **Panel de detalle**: layout de 2 columnas en pantallas anchas (antes una sola columna centrada de 620px sin importar el ancho de pantalla).
- **Modal de "Estadísticas detalladas"**: se quitó todo lo que ya era redundante con la barra lateral y el panel de métricas (disponibilidad, conteo ok/warn/crit, total, última actualización); ensanchado a 1040px en desktop (antes 620px, muy angosto para la tabla de 7 columnas).
- **Gráficas de las tarjetas y del panel de detalle**: el número junto al título ya no repite el valor actual (redundante con el medidor/metric-box) — ahora muestra el cambio respecto a la muestra anterior (un tick atrás, ~1.5s), con flecha de tendencia. Antes comparaba contra el punto más viejo de toda la ventana de historial (se sentía como "siempre contra el valor inicial de la página").
- **Ancho máximo de `main`**: de un tope fijo de 1320px a `min(1800px, 96vw)`, para aprovechar mejor pantallas anchas.
- **Layout mapa + sidebar + cuadrícula**: de CSS Grid con áreas fijas a Flexbox — al ocultar una sección, las demás se reacomodan solas en vez de dejar una columna vacía reservada.

## Corregido

- **GitHub Pages desplegaba dos veces por push**: la fuente de Pages seguía en "Deploy from a branch", disparando también el build automático de Jekyll (que siempre fallaba). Se documentó el cambio a "GitHub Actions" en Settings → Pages.
- **Evento de sistema mal atribuido**: un mensaje de "sistema de monitoreo iniciado" quedaba permanentemente asignado al transmisor #0 en su bitácora, sin corresponderle.
- **Mini-gráfica de las tarjetas desconectada del dato real**: mostraba ruido aleatorio (`tx.waveform`) sin relación con la potencia real mostrada en el medidor. Ahora usa el historial real (`tx.history.power`).
- **Botón de cerrar sin animación** en el modal de Configuración (el hover solo aplicaba al `#close-btn` del modal de Detalle, con selector por ID en vez de por clase).
- **Flash de tema y de disposición al cargar** la página: ambos se aplican ahora antes del primer pintado (script bloqueante en `<head>`), no después.
- **Errores de ECharts "Can't get DOM width or height"**: tenían dos causas distintas.
  - *Timing*: las gráficas se montaban antes de que el navegador terminara de resolver el layout — resuelto atando el montaje al splash de carga.
  - *Secciones ocultas*: si el usuario ocultaba una sección, sus gráficas se seguían montando de todas formas dentro de un contenedor en 0×0 permanente. Ahora cada función de montaje revisa si su sección está oculta, y se vuelve a llamar automáticamente cuando la sección se vuelve a mostrar.
- **Crash de ECharts al pasar el mouse sobre las gráficas** (`interpolate1DArray`, "'setOption' should not be called during main process"): la animación de "énfasis" al hacer hover chocaba con la animación de la actualización periódica (cada 1.5s). Se resolvió con `silent:true` en la serie (ya no reacciona al mouse), lo que permitió mantener la animación de transición de datos sin reabrir el problema.
- **Última fila de tarjetas no tocaba el borde inferior** cuando la cuadrícula está junto al mapa: `align-content` por defecto empaqueta las filas arriba; se agregó `align-content: space-between` y se quitó un `padding-bottom` que dejaba 8px de más antes del borde real.
- **`<DashboardStats client:load />`**: advertencia de Astro por usar una directiva de hidratación en un componente Astro plano (no soporta ni necesita hidratación). Se quitó `client:load`.

## Documentación

- `README.md` actualizado varias veces conforme se agregaban features (disposición configurable, PWA, estadísticas detalladas, persistencia ampliada), sin emojis, con badges dinámicos.
- Anteproyecto de residencia profesional: ajustada la redacción de la actividad 1 (de comprometerse a "un transmisor de radio y uno de televisión" a un criterio de accesibilidad/cercanía/viabilidad, más realista dado el presupuesto disponible).
