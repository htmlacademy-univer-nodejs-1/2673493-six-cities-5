import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Component } from '../../types/index.js';
import { ILogger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { IUserService } from '../user/user-service.interface.js';
import { IOfferService } from '../offer/offer-service.interface.js';
import { plainToInstance } from 'class-transformer';
import { OfferShortRdo } from '../offer/rdo/offer-short.rdo.js';
import { OfferRdo } from '../offer/rdo/offer.rdo.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

@injectable()
export class FavoriteController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: ILogger,
    @inject(Component.UserService) private readonly userService: IUserService,
    @inject(Component.OfferService) private readonly offerService: IOfferService,
  ) {
    super(logger);

    this.logger.info('Register routes for FavoriteController...');
    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Post, handler: this.addFavorite });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.removeFavorite });
  }

  public async index(_req: Request, res: Response): Promise<void> {
    const userId = '662fca6a15456f59e9a4f4d2';
    const favorites = await this.userService.getFavorites(userId);
    this.ok(res, plainToInstance(OfferShortRdo, favorites, { excludeExtraneousValues: true }));
  }

  public async addFavorite({ params }: Request, res: Response): Promise<void> {
    const { offerId } = params as { offerId: string };
    const userId = '662fca6a15456f59e9a4f4d2';

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${offerId} not found.`, 'FavoriteController');
    }

    await this.userService.addToFavorites(userId, offerId);
    offer.isFavorite = true;

    this.ok(res, plainToInstance(OfferRdo, offer, { excludeExtraneousValues: true }));
  }

  public async removeFavorite({ params }: Request, res: Response): Promise<void> {
    const { offerId } = params as { offerId: string };
    const userId = '662fca6a15456f59e9a4f4d2';

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${offerId} not found.`, 'FavoriteController');
    }

    await this.userService.removeFromFavorites(userId, offerId);
    offer.isFavorite = false;

    this.ok(res, plainToInstance(OfferRdo, offer, { excludeExtraneousValues: true }));
  }
}
