import { createHmac } from 'node:crypto';

export function getRandomNumber(min: number, max: number, precision = 0): number {
  const randomValue = Math.random() * (max - min) + min;
  return parseFloat(randomValue.toFixed(precision));
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


export function createSHA256(line: string, salt: string): string {
  const shaHasher = createHmac('sha256', salt);
  return shaHasher.update(line).digest('hex');
}

export function getMongoURI(user: string, password: string, host: string, port: number, dbname: string): string {
  return `mongodb://${user}:${password}@${host}:${port}/${dbname}?authSource=admin`;
}
