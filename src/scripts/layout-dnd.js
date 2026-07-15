// src/scripts/layout-dnd.js
//
// Arrastrar y soltar para reacomodar las secciones de la página (panel de
// métricas, mapa, panel lateral, cuadrícula de transmisores). Usa Pointer
// Events (no la API HTML5 Drag and Drop) a propósito: Pointer Events
// funciona igual con mouse, trackpad y dedo/touch, y la API nativa de
// arrastre no dispara en touch sin trabajo extra — como el sitio es una PWA
// pensada también para tablet/celular, esto importa.
//
// El arrastre en sí NO mueve nodos del DOM: solo calcula el nuevo orden y
// se lo entrega a setOrder() en layout-prefs.js, que lo aplica vía CSS
// (propiedad `order`) — así el mismo mecanismo que evita el flash del
// acomodo por defecto al cargar la página (ver Layout.astro) sigue siendo
// la única fuente de verdad.

import { getLayoutPrefs, setOrder } from './layout-prefs.js';
import { openLayoutModal } from './layout-modal.js';

let dragging = null; // { key, handle, section, pointerId, ghost }
let dropTargetSection = null;

function sectionFor(key) {
  return document.getElementById(`layout-section-${key}`);
}

function clearDropTarget() {
  dropTargetSection?.classList.remove('layout-drop-target');
  dropTargetSection = null;
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

  if (section === dropTargetSection) return;
  clearDropTarget();

  if (section && section !== dragging.section) {
    section.classList.add('layout-drop-target');
    dropTargetSection = section;
  }
}

function onPointerUp() {
  if (!dragging) return;

  const draggedKey = dragging.key;
  const targetKey = dropTargetSection?.dataset.layoutKey;

  dragging.section.classList.remove('layout-dragging');
  dragging.handle.releasePointerCapture?.(dragging.pointerId);
  dragging.ghost.remove();
  clearDropTarget();

  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerUp);
  dragging = null;

  if (!targetKey || targetKey === draggedKey) return;

  // Quita la sección arrastrada de su posición y la inserta justo antes de
  // la sección donde se soltó — reordenamiento simple de "insertar antes".
  const { order } = getLayoutPrefs();
  const next = order.filter((key) => key !== draggedKey);
  const targetIndex = next.indexOf(targetKey);
  next.splice(targetIndex, 0, draggedKey);
  setOrder(next);
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
  dragging = { key, handle, section, pointerId: e.pointerId, ghost };
  section.classList.add('layout-dragging');
  handle.setPointerCapture?.(e.pointerId);

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}

function setEditing(on) {
  document.documentElement.classList.toggle('layout-editing', on);
}

export function initLayoutDnd() {
  document.querySelectorAll('[data-layout-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', onPointerDown);
  });

  document.getElementById('layout-btn')?.addEventListener('click', () => {
    setEditing(!document.documentElement.classList.contains('layout-editing'));
  });

  document.getElementById('layout-edit-visibility-btn')?.addEventListener('click', () => {
    openLayoutModal();
  });

  document.getElementById('layout-edit-done-btn')?.addEventListener('click', () => {
    setEditing(false);
  });
}