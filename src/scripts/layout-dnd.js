// src/scripts/layout-dnd.js
//
// Arrastrar y soltar para reacomodar las secciones de la página (panel de
// métricas, mapa, panel lateral, cuadrícula de transmisores). Usa Pointer
// Events (no la API HTML5 Drag and Drop) a propósito: Pointer Events
// funciona igual con mouse, trackpad y dedo/touch, y la API nativa de
// arrastre no dispara en touch sin trabajo extra — como el sitio es una PWA
// pensada también para tablet/celular, esto importa.
//
// Mientras se arrastra, el acomodo se previsualiza EN VIVO (no hasta
// soltar): en cuanto el puntero pasa a otra sección, se calcula cómo
// quedaría el orden y se aplica de una vez (ver previewOrder() en
// layout-prefs.js), animando el movimiento de cada sección con la técnica
// FLIP (se mide la posición antes y después del cambio, y se anima la
// diferencia con un transform) para que se vea como un reacomodo fluido en
// vez de un salto brusco. Solo al soltar se persiste de verdad (setOrder).
// Si se suelta fuera de un destino válido, se anima de vuelta al orden
// original.

import { getLayoutPrefs, setOrder, previewOrder } from './layout-prefs.js';

const SECTION_KEYS = ['dashboard', 'map', 'sidebar', 'grid'];
const FLIP_DURATION = '0.28s';

let dragging = null; // { key, handle, section, pointerId, ghost, originalOrder, previewedOrder }
let dropTargetSection = null;

function sectionFor(key) {
  return document.getElementById(`layout-section-${key}`);
}

function clearDropTarget() {
  dropTargetSection?.classList.remove('layout-drop-target', 'layout-drop-before', 'layout-drop-after');
  dropTargetSection = null;
}

// Marca de qué lado quedaría el elemento arrastrado si se soltara ahora
// (barra de color a la izquierda/arriba o derecha/abajo del destino — ver
// .layout-drop-before/.layout-drop-after en layout-edit.css) — antes solo
// había un contorno alrededor de toda la sección, sin indicar el lado,
// que era justo la ambigüedad que hacía difícil saber si algo quedaría a
// la izquierda o a la derecha del mapa.
function updateSideIndicator(section, insertAfter) {
  section.classList.toggle('layout-drop-before', !insertAfter);
  section.classList.toggle('layout-drop-after', insertAfter);
}

// Quita a `draggedKey` de `baseOrder` y lo inserta justo antes (o después,
// si insertAfter) de `targetKey` — mismo cálculo tanto para la vista
// previa en vivo como para el resultado final al soltar, así nunca hay un
// salto entre lo que se veía mientras se arrastraba y lo que queda al
// soltar.
function computeInsertOrder(baseOrder, draggedKey, targetKey, insertAfter) {
  const next = baseOrder.filter((key) => key !== draggedKey);
  const targetIndex = next.indexOf(targetKey);
  next.splice(insertAfter ? targetIndex + 1 : targetIndex, 0, draggedKey);
  return next;
}

// De qué lado de la sección destino está el puntero — determina si el
// elemento arrastrado se inserta antes (queda a la izquierda / arriba) o
// después (queda a la derecha / abajo) de esa sección. Antes siempre se
// insertaba "antes" sin importar en qué mitad estuviera el puntero, lo que
// hacía ambiguo poner algo a la izquierda vs. a la derecha del mapa.
function resolveInsertAfter(targetSection, pointerX) {
  const rect = targetSection.getBoundingClientRect();
  return pointerX > rect.left + rect.width / 2;
}

function captureRects() {
  const rects = {};
  SECTION_KEYS.forEach((key) => {
    const el = sectionFor(key);
    if (el) rects[key] = el.getBoundingClientRect();
  });
  return rects;
}

// Técnica FLIP (First, Last, Invert, Play): `beforeRects` es la posición de
// cada sección ANTES del cambio que ya se aplicó; aquí se mide la de
// DESPUÉS y se anima la diferencia. Si una sección no se movió, no se le
// toca nada (evita transiciones de "0px a 0px" innecesarias).
function playFlip(beforeRects) {
  const afterRects = captureRects();

  SECTION_KEYS.forEach((key) => {
    const el = sectionFor(key);
    const before = beforeRects[key];
    const after = afterRects[key];
    if (!el || !before || !after) return;

    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    // Fuerza a que el navegador aplique ese transform ANTES de animar,
    // si no, con transition:none recién puesto, saltaría directo al
    // estado final sin mostrar el punto de partida.
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.style.transition = `transform ${FLIP_DURATION} ease`;
    el.style.transform = '';

    // Limpieza: al terminar, se quita el transition inline para no dejar
    // pisada permanentemente la transición de outline-color que ya trae
    // .layout-section por CSS (ver layout-edit.css).
    el.addEventListener('transitionend', function onDone(ev) {
      if (ev.propertyName !== 'transform') return;
      el.style.transition = '';
      el.removeEventListener('transitionend', onDone);
    }, { once: true });
  });
}

// Aplica un nuevo orden (vista previa en vivo, no persistida) animando la
// transición con FLIP.
function previewWithAnimation(order) {
  const before = captureRects();
  previewOrder(order);
  requestAnimationFrame(() => playFlip(before));
}

// Pequeño "fantasma" que sigue al puntero mientras se arrastra, para que
// quede claro qué sección se está moviendo (la sección original se queda
// atenuada en su lugar — ver .layout-dragging en layout-edit.css).
function createGhost(handle, x, y) {
  const ghost = document.createElement('div');
  ghost.className = 'layout-drag-ghost';
  ghost.innerHTML = handle.innerHTML;
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
  document.body.appendChild(ghost);
  return ghost;
}

function moveGhost(ghost, x, y) {
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
}

// Aplica de inmediato el nuevo `previewedOrder` (para que onPointerUp
// siempre tenga el valor correcto aunque se suelte antes de que la
// animación alcance a dispararse) pero la animación en sí se retrasa un
// poco: si se reaplicara en cada pointermove sin esperar, mientras una
// sección todavía está a medio animar (con un transform temporal — ver
// playFlip) el puntero puede terminar "leyendo" con elementFromPoint una
// sección distinta a la que está en reposo ahí, disparando OTRO reacomodo
// a mitad de la animación anterior y así en bucle — eso es el parpadeo
// que cambiaba de posición varias veces solo. Esperar un pequeño respiro
// después del último cambio de destino evita ese rebote.
function schedulePreview(order) {
  dragging.previewedOrder = order;
  if (dragging.previewTimer) clearTimeout(dragging.previewTimer);
  dragging.previewTimer = setTimeout(() => {
    dragging.previewTimer = null;
    previewWithAnimation(order);
  }, 90);
}

function onPointerMove(e) {
  if (!dragging) return;
  e.preventDefault();

  moveGhost(dragging.ghost, e.clientX, e.clientY);

  // Oculta momentáneamente el fantasma para que elementFromPoint detecte lo
  // que hay DEBAJO del puntero (la sección), no el fantasma mismo.
  dragging.ghost.style.visibility = 'hidden';
  const el = document.elementFromPoint(e.clientX, e.clientY);
  dragging.ghost.style.visibility = 'visible';

  const section = el?.closest('.layout-section[data-layout-key]');

  // La sección que se arrastra ya se movió (por la vista previa) al lugar
  // donde quedaría — así que en algún momento el puntero termina sobre su
  // propio hueco atenuado. Antes eso se trataba como "no hay destino" y
  // borraba dropTargetSection: si soltabas justo ahí, el cambio se
  // revertía sin avisar. Ahora simplemente no hay nada nuevo que calcular
  // — se mantiene el último destino válido tal cual.
  if (section === dragging.section) return;

  // OJO: si el puntero está fuera de toda sección, `section` es `null` —
  // y antes de que se detectara CUALQUIER destino, `dropTargetSection`
  // TAMBIÉN es `null`. `null === null` da verdadero por accidente y
  // entraba a calcular resolveInsertAfter(null, ...), que revienta. El
  // `section &&` de abajo evita ese caso.
  if (section && section === dropTargetSection) {
    // Mismo destino de antes, pero el puntero pudo haber cruzado a la otra
    // mitad (antes/después) — si cambió el lado, sí hay que recalcular.
    const insertAfter = resolveInsertAfter(section, e.clientX);
    if (insertAfter === dragging.insertAfter) return;
    dragging.insertAfter = insertAfter;
    updateSideIndicator(section, insertAfter);
    const targetKey = section.dataset.layoutKey;
    const nextOrder = computeInsertOrder(dragging.originalOrder, dragging.key, targetKey, insertAfter);
    schedulePreview(nextOrder);
    return;
  }

  clearDropTarget();

  if (section) {
    section.classList.add('layout-drop-target');
    dropTargetSection = section;

    // Vista previa en vivo: se recalcula el orden como si se soltara AQUÍ
    // mismo, ahora (del lado del puntero, izquierda/arriba o
    // derecha/abajo del destino), y se anima el reacomodo — así el
    // usuario ve de antemano dónde quedaría cada cosa en vez de enterarse
    // hasta soltar.
    const insertAfter = resolveInsertAfter(section, e.clientX);
    dragging.insertAfter = insertAfter;
    updateSideIndicator(section, insertAfter);
    const targetKey = section.dataset.layoutKey;
    const nextOrder = computeInsertOrder(dragging.originalOrder, dragging.key, targetKey, insertAfter);
    schedulePreview(nextOrder);
  } else {
    // El puntero salió de cualquier sección: vuelve a mostrar el acomodo
    // original mientras se sigue arrastrando (no se pierde el gesto, solo
    // dice "si sueltas aquí, no cambia nada").
    dragging.insertAfter = null;
    schedulePreview(dragging.originalOrder);
  }
}

function onPointerUp() {
  if (!dragging) return;

  const draggedKey = dragging.key;
  const originalOrder = dragging.originalOrder;
  const previewedOrder = dragging.previewedOrder;
  const hadValidTarget = !!dropTargetSection;

  if (dragging.previewTimer) clearTimeout(dragging.previewTimer);
  dragging.section.classList.remove('layout-dragging');
  dragging.handle.releasePointerCapture?.(dragging.pointerId);
  dragging.ghost.remove();
  clearDropTarget();

  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerUp);
  dragging = null;

  if (hadValidTarget && previewedOrder) {
    // La vista previa ya dejó todo exactamente donde debe quedar — solo
    // falta guardarlo (no hay salto visual, setOrder() vuelve a aplicar
    // el mismo acomodo que ya se veía).
    setOrder(previewedOrder);
  } else {
    // Se soltó sin un destino válido (o nunca se pasó por otra sección):
    // anima de vuelta al orden original en vez de dejarlo a medias.
    previewWithAnimation(originalOrder);
  }
}

function onPointerDown(e) {
  // Solo botón principal / touch primario; ignora clic derecho, etc.
  if (e.button !== undefined && e.button !== 0) return;

  const handle = e.currentTarget;
  const key = handle.dataset.layoutHandle;
  const section = sectionFor(key);
  if (!section) return;

  e.preventDefault();
  const ghost = createGhost(handle, e.clientX, e.clientY);
  const { order } = getLayoutPrefs();
  dragging = {
    key,
    handle,
    section,
    pointerId: e.pointerId,
    ghost,
    originalOrder: order.slice(),
    previewedOrder: null,
    insertAfter: null,
    previewTimer: null,
  };
  section.classList.add('layout-dragging');
  handle.setPointerCapture?.(e.pointerId);

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}

function setEditing(on) {
  document.documentElement.classList.toggle('layout-editing', on);
}

// Se activa desde el botón "Editar disposición" dentro de la pestaña
// Interfaz del modal de Configuración (ver settings.js) — antes había un
// ícono aparte en el encabezado para esto, pero quedaba duplicado con la
// visibilidad de secciones que ya vive en Configuración, así que ahora
// todo el ajuste de disposición se dispara desde un solo lugar.
export function startLayoutEditing() {
  setEditing(true);
}

export function initLayoutDnd() {
  document.querySelectorAll('[data-layout-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', onPointerDown);
  });

  document.getElementById('layout-edit-done-btn')?.addEventListener('click', () => {
    setEditing(false);
  });
}