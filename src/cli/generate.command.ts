import { ICommandHandler } from './command-handler.interface.js';
import axios from 'axios';
import { Amenity, HousingType, Offer, User } from '../shared/types/index.js';
import chalk from 'chalk';
import { createWriteStream, type WriteStream } from 'node:fs';
import { CITIES_COORDINATES, getRandomItem, getRandomNumber } from '../shared/libs/utils.js';

type MockServerOffer = Omit<Offer, 'publicationDate'> & {
  publicationDate: string;
};

export class GenerateCommand implements ICommandHandler {
  public readonly name = '--generate';
  private initialData: MockServerOffer[] = [];

  private names: string[] = [];
  private descriptions: string[] = [];
  private types: HousingType[] = [];
  private amenities: Amenity[][] = [];
  private hosts: User[] = [];

  private getRandomBoolean(): boolean {
    return Math.random() > 0.5;
  }

  private prepareGenerationData() {
    this.names = this.initialData.map((offer) => offer.name);
    this.descriptions = this.initialData.map((offer) => offer.description);
    this.types = this.initialData.map((offer) => offer.type);
    this.amenities = this.initialData.map((offer) => offer.amenities);
    this.hosts = this.initialData.map((offer) => offer.host);
  }

  private generateOffer(baseOffer: MockServerOffer): string {
    const name = getRandomItem(this.names);
    const description = getRandomItem(this.descriptions);
    const publicationDate = new Date().toISOString();
    const city = getRandomItem(Object.keys(CITIES_COORDINATES));
    const previewSrc = getRandomItem(baseOffer.images);
    const images = baseOffer.images.join(',');
    const isPremium = this.getRandomBoolean();
    const isFavorite = this.getRandomBoolean();
    const rating = getRandomNumber(1, 5, 1);
    const type = getRandomItem(this.types);
    const bedroomsCount = getRandomNumber(1, 8);
    const guestCount = getRandomNumber(1, 10);
    const price = getRandomNumber(100, 100000);
    const amenities = getRandomItem(this.amenities).join(',');
    const host: User = getRandomItem(this.hosts);
    const hostData = [host.name, host.email, host.avatarSrc ?? '', host.password, host.type].join(';'); // Добавил ?? '' для надежности
    const commentsCount = 0;
    const coordinates = `${CITIES_COORDINATES[city as keyof typeof CITIES_COORDINATES].latitude};${CITIES_COORDINATES[city as keyof typeof CITIES_COORDINATES].longitude}`;

    return [
      name, description, publicationDate, city, previewSrc, images, isPremium,
      isFavorite, rating, type, bedroomsCount, guestCount, price, amenities,
      hostData, commentsCount, coordinates
    ].join('\t');
  }

  private async write(count: number, writer: WriteStream): Promise<void> {
    const baseOffer = getRandomItem(this.initialData);
    if (!baseOffer) {
      return;
    }

    for (let i = 0; i < count; i++) {
      const offerLine = this.generateOffer(baseOffer);
      const isWritten = writer.write(`${offerLine}\n`);
      if (!isWritten) {
        await new Promise((resolve) => writer.once('drain', resolve));
      }
    }
  }

  private async load(url: string): Promise<void> {
    try {
      const { data } = await axios.get<MockServerOffer[]>(url);
      this.initialData = data;
    } catch {
      console.log(chalk.red(`Не удалось загрузить данные из ${url}`));
      throw new Error('Data loading failed');
    }
  }

  public async execute(...params: string[]): Promise<void> {
    const [countStr, filepath, url] = params;
    const count = Number.parseInt(countStr, 10);

    if (isNaN(count) || !filepath || !url) {
      console.log(chalk.red('Неверные параметры. Использование: --generate <n> <filepath> <url>'));
      return;
    }

    try {
      await this.load(url);
      this.prepareGenerationData();
      const writeStream = createWriteStream(filepath, {
        flags: 'w',
        encoding: 'utf-8',
        autoClose: true,
      });

      await this.write(count, writeStream);
      console.log(chalk.green(`Файл ${filepath} успешно сгенерирован.`));

    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`Не удалось сгенерировать данные: ${error.message}`));
      }
    }
  }
}
