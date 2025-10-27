export function getRandomNumber(min: number, max: number, precision = 0): number {
  const factor = Math.pow(10, precision);
  return Math.floor((Math.random() * (max - min + 1) + min) * factor) / factor;
}

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export const CITIES_COORDINATES = {
  'Paris': { latitude: 48.85661, longitude: 2.351499 },
  'Cologne': { latitude: 50.938361, longitude: 6.959974 },
  'Brussels': { latitude: 50.846557, longitude: 4.351697 },
  'Amsterdam': { latitude: 52.370216, longitude: 4.895168 },
  'Hamburg': { latitude: 53.550341, longitude: 10.000654 },
  'Dusseldorf': { latitude: 51.225402, longitude: 6.776314 },
};
