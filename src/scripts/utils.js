// Funciones auxiliares pequeñas y sin dependencias, usadas por varios módulos.

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function seedHistory(value, n = 20) {
  return Array.from({ length: n }, () => value + rand(-value * 0.03, value * 0.03));
}
