import { DocumentExistsMiddleware, ValidateObjectIdMiddleware, IMiddleware} from '../../libs/rest/middleware/index.js';
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
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from '../offer/offer.entity.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

@injectable()
export class FavoriteController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: ILogger,
    @inject(Component.UserService) private readonly userService: IUserService,
    @inject(Component.OfferService) private readonly offerService: IOfferService,
    @inject(Component.PrivateRouteMiddleware) private readonly privateRouteMiddleware: IMiddleware,
  ) {
    super(logger);

    this.logger.info('Register routes for FavoriteController...');
    const validateObjectIdMiddleware = new ValidateObjectIdMiddleware('offerId');
    const documentExistsMiddleware = new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index, middlewares: [this.privateRouteMiddleware] });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Post,
      handler: this.addFavorite,
      middlewares: [this.privateRouteMiddleware, validateObjectIdMiddleware, documentExistsMiddleware]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.removeFavorite,
      middlewares: [this.privateRouteMiddleware, validateObjectIdMiddleware, documentExistsMiddleware]
    });
  }

  public async index({ user }: Request, res: Response): Promise<void> {
    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'FavoriteController');
    }
    const favorites = await this.userService.getFavorites(user.id);
    favorites.forEach((offer) => {
      offer.isFavorite = true;
    });
    const favoritesWithFlag = favorites as unknown as DocumentType<OfferEntity>[];

    this.ok(res, plainToInstance(OfferShortRdo, favoritesWithFlag, { excludeExtraneousValues: true }));
  }

  public async addFavorite({ params, user }: Request, res: Response): Promise<void> {
    const { offerId } = params as { offerId: string };

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'FavoriteController');
    }

    const offer = await this.offerService.findById(offerId) as DocumentType<OfferEntity>;

    await this.userService.addToFavorites(user.id, offerId);
    offer.isFavorite = true;
    this.ok(res, plainToInstance(OfferRdo, offer, { excludeExtraneousValues: true }));
  }

  public async removeFavorite({ params, user }: Request, res: Response): Promise<void> {
    const { offerId } = params as { offerId: string };

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'FavoriteController');
    }

    const offer = await this.offerService.findById(offerId) as DocumentType<OfferEntity>;

    await this.userService.removeFromFavorites(user.id, offerId);
    offer.isFavorite = false;
    this.ok(res, plainToInstance(OfferRdo, offer, { excludeExtraneousValues: true }));
  }
}
