import { createReadStream } from 'node:fs';
import { ICommandHandler } from './command-handler.interface.js';
import type { User, Offer, City, HousingType, Amenity, UserType} from '../shared/types/index.js';
import chalk from 'chalk';
import { createInterface } from 'node:readline';
import { ILogger } from '../shared/libs/logger/index.js';
import { injectable, inject } from 'inversify';
import { Component } from '../shared/types/index.js';
import { CreateOfferDto, IOfferService } from '../shared/modules/offer/index.js';
import { IUserService } from '../shared/modules/user/index.js';
import { IConfig, RestSchema } from '../shared/libs/config/index.js';
import { IDatabaseClient } from '../shared/libs/database-client/index.js';
import { getMongoURI } from '../shared/libs/utils.js';

@injectable()
export class ImportCommand implements ICommandHandler {
  public readonly name = '--import';
  private salt: string;

  constructor(
    @inject(Component.Logger) private readonly logger: ILogger,
    @inject(Component.OfferService) private readonly offerService: IOfferService,
    @inject(Component.UserService) private readonly userService: IUserService,
    @inject(Component.Config) private readonly configService: IConfig<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: IDatabaseClient,
  ) {
    this.salt = this.configService.get('SALT');
  }

  private onComplete(count: number) {
    this.logger.info(`${count} rows imported.`);
    this.logger.info(chalk.green('Импорт данных успешно завершен.'));
  }

  private async saveOffer(offerData: Offer) {
    const user = await this.userService.findOrCreate({
      ...offerData.host,
    }, this.salt);

    const { isFavorite, ...restOffer } = offerData;

    const createdOffer = await this.offerService.create({
      ...restOffer,
    } as CreateOfferDto, user.id);

    if (isFavorite) {
      await this.userService.addToFavorites(user.id, createdOffer.id);
    }
  }

  private getOffer(lineData: string[]): Offer {
    const [
      name,
      description,
      publicationDate,
      city,
      previewSrc,
      images,
      isPremium,
      isFavorite,
      rating,
      type,
      bedroomsCount,
      guestCount,
      price,
      amenities,
      hostData,
      commentsCount,
      coordinatesData
    ] = lineData;

    const [latitude, longitude] = coordinatesData.split(';');
    const [hostName, hostEmail, hostAvatar, hostPassword, hostType] = hostData.split(';');
    const host: User = {
      name: hostName,
      email: hostEmail,
      avatarSrc: hostAvatar,
      password: hostPassword,
      type: hostType as UserType,
    };

    return {
      name,
      description,
      publicationDate: new Date(publicationDate),
      city: city as City,
      previewSrc,
      images: images.split(','),
      isPremium: isPremium.toLowerCase() === 'true',
      isFavorite: isFavorite.toLowerCase() === 'true',
      rating: parseFloat(rating),
      type: type as HousingType,
      bedroomsCount: parseInt(bedroomsCount, 10),
      guestCount: parseInt(guestCount, 10),
      price: parseFloat(price),
      amenities: amenities.split(',') as Amenity[],
      host,
      commentsCount: parseInt(commentsCount, 10),
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    };
  }

  public async execute(...params: string[]): Promise<void> {
    const [filepath] = params;

    if (!filepath) {
      this.logger.warn('Incorrect parameters. Usage: --import <filepath>');
      return;
    }

    const mongoUri = getMongoURI(
      this.configService.get('DB_USER'),
      this.configService.get('DB_PASSWORD'),
      this.configService.get('DB_HOST'),
      this.configService.get('DB_PORT'),
      this.configService.get('DB_NAME'),
    );

    try {
      await this.databaseClient.connect(mongoUri);

      const readStream = createReadStream(filepath.trim(), { encoding: 'utf-8' });
      const rl = createInterface({
        input: readStream,
        crlfDelay: Infinity,
      });

      let importedRowCount = 0;

      for await (const line of rl) {
        if (line.trim() === '') {
          continue;
        }
        try {
          const offer = this.getOffer(line.split('\t'));
          await this.saveOffer(offer);
          importedRowCount++;
        } catch (e) {
          this.logger.error(`Error importing line: ${line}`, e as Error);
          this.logger.error((e as Error).message, e as Error);
        }
      }

      this.onComplete(importedRowCount);
    } catch (error) {
      this.logger.error('Failed to import data.', error as Error);
    } finally {
      await this.databaseClient.disconnect();
    }
  }
}
