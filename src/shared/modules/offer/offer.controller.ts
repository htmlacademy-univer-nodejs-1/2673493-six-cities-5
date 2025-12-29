import { ValidateDtoMiddleware, ValidateObjectIdMiddleware, DocumentExistsMiddleware, IMiddleware } from '../../libs/rest/middleware/index.js';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { City, Component } from '../../types/index.js';
import { ILogger } from '../../libs/logger/index.js';
import { IOfferService } from './offer-service.interface.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { plainToInstance } from 'class-transformer';
import { OfferRdo } from './rdo/offer.rdo.js';
import { OfferShortRdo } from './rdo/offer-short.rdo.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { IUserService, UserEntity} from '../user/index.js';

type ParamOfferId = {
  offerId: string;
}

@injectable()
export class OfferController extends BaseController {
  constructor(
  @inject(Component.Logger) protected readonly logger: ILogger,
  @inject(Component.OfferService) private readonly offerService: IOfferService,
  @inject(Component.UserService) private readonly userService: IUserService,
  @inject(Component.PrivateRouteMiddleware) private readonly privateRouteMiddleware: IMiddleware,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController...');
    const validateObjectIdMiddleware = new ValidateObjectIdMiddleware('offerId');
    const documentExistsMiddleware = new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        this.privateRouteMiddleware,
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({ path: '/premium', method: HttpMethod.Get, handler: this.getPremium });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [validateObjectIdMiddleware, documentExistsMiddleware]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        this.privateRouteMiddleware,
        validateObjectIdMiddleware,
        new ValidateDtoMiddleware(UpdateOfferDto),
        documentExistsMiddleware
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        this.privateRouteMiddleware,
        validateObjectIdMiddleware,
        documentExistsMiddleware
      ]
    });
  }

  public async index(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    if (limit !== undefined && (isNaN(limit) || limit < 0)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Invalid limit parameter', 'OfferController');
    }

    const offers = await this.offerService.find(limit);
    const offersRdo = plainToInstance(OfferShortRdo, offers, { excludeExtraneousValues: true });

    let favoriteIds = new Set<string>();
    if (req.user) {
      const currentUser = await this.userService.findById(req.user.id);
      favoriteIds = new Set(currentUser?.favorites.map((offerId) => offerId.toString()));
    }

    offersRdo.forEach((offer) => {
      offer.isFavorite = favoriteIds.has(offer.id);
    });

    this.ok(res, offersRdo);
  }

  public async create(
    { body, user }: Request<unknown, unknown, CreateOfferDto>,
    res: Response
  ): Promise<void> {
    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }

    const result = await this.offerService.create(body, user.id);
    result.isFavorite = false;
    this.created(res, plainToInstance(OfferRdo, result, { excludeExtraneousValues: true }));
  }

  public async show(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params as ParamOfferId;
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Offer not found', 'OfferController');
    }

    const offerRdo = plainToInstance(OfferRdo, offer, { excludeExtraneousValues: true });

    if (req.user) {
      const currentUser = await this.userService.findById(req.user.id);
      const favoriteIds = new Set(currentUser?.favorites.map((id) => id.toString()));
      offerRdo.isFavorite = favoriteIds.has(offerRdo.id);
    } else {
      offerRdo.isFavorite = false;
    }

    this.ok(res, offerRdo);
  }

  public async update(
    { body, params, user }: Request<unknown, unknown, UpdateOfferDto>,
    res: Response
  ): Promise<void> {
    const { offerId } = params as ParamOfferId;
    const offer = await this.offerService.findById(offerId);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }

    const host = offer?.host as unknown as UserEntity;
    const isAuthor = host?._id?.toString() === user.id || (host as unknown as string) === user.id;

    if (!isAuthor) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You are not the author of this offer.',
        'OfferController'
      );
    }

    const updatedOffer = await this.offerService.updateById(offerId, body);

    if (updatedOffer) {
      const currentUser = await this.userService.findById(user.id);
      const favoriteIds = new Set(currentUser?.favorites.map((id) => id.toString()));
      updatedOffer.isFavorite = favoriteIds.has(updatedOffer._id.toString());
    }

    this.ok(res, plainToInstance(OfferRdo, updatedOffer, { excludeExtraneousValues: true }));
  }

  public async delete({ params, user }: Request, res: Response): Promise<void> {
    const { offerId } = params as ParamOfferId;
    const offer = await this.offerService.findById(offerId);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }

    const host = offer?.host as unknown as UserEntity;
    const isAuthor = host?._id?.toString() === user.id || (host as unknown as string) === user.id;

    if (!isAuthor) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You are not the author of this offer.',
        'OfferController'
      );
    }

    await this.offerService.deleteById(offerId);
    this.noContent(res);
  }

  public async getPremium(req: Request, res: Response): Promise<void> {
    const city = req.query.city as string;
    if (!city || !Object.values(City).includes(city as City)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid or missing city parameter',
        'OfferController'
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    const offersRdo = plainToInstance(OfferShortRdo, offers, { excludeExtraneousValues: true });

    let favoriteIds = new Set<string>();
    if (req.user) {
      const currentUser = await this.userService.findById(req.user.id);
      favoriteIds = new Set(currentUser?.favorites.map((offerId) => offerId.toString()));
    }

    offersRdo.forEach((offer) => {
      offer.isFavorite = favoriteIds.has(offer.id);
    });

    this.ok(res, offersRdo);
  }
}
