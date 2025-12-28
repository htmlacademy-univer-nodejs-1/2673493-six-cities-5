import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Component } from '../../types/index.js';
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

type ParamOfferId = {
  offerId: string;
}

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: ILogger,
    @inject(Component.OfferService) private readonly offerService: IOfferService,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController...');

    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({ path: '/', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/premium', method: HttpMethod.Get, handler: this.getPremium });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Get, handler: this.show });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Patch, handler: this.update });
    this.addRoute({ path: '/:offerId', method: HttpMethod.Delete, handler: this.delete });
  }

  public async index(req: Request, res: Response): Promise<void> {
    const count = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offers = await this.offerService.find(count);
    this.ok(res, plainToInstance(OfferShortRdo, offers, { excludeExtraneousValues: true }));
  }

  public async create(
    { body }: Request<unknown, unknown, CreateOfferDto>,
    res: Response
  ): Promise<void> {
    const result = await this.offerService.create({
      ...body,
      host: '662fca6a15456f59e9a4f4d2',
    });
    this.created(res, plainToInstance(OfferRdo, result, { excludeExtraneousValues: true }));
  }


  public async show({ params }: Request, res: Response): Promise<void> {
    const { offerId } = params as ParamOfferId;
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController'
      );
    }

    this.ok(res, plainToInstance(OfferRdo, offer, { excludeExtraneousValues: true }));
  }

  public async update(
    { body, params }: Request<unknown, unknown, UpdateOfferDto>,
    res: Response
  ): Promise<void> {
    const { offerId } = params as ParamOfferId;
    const updatedOffer = await this.offerService.updateById(offerId, body);

    if (!updatedOffer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController'
      );
    }

    this.ok(res, plainToInstance(OfferRdo, updatedOffer, { excludeExtraneousValues: true }));
  }

  public async delete({ params }: Request, res: Response): Promise<void> {
    const { offerId } = params as ParamOfferId;
    const offer = await this.offerService.deleteById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found.`,
        'OfferController'
      );
    }
    this.noContent(res);
  }

  public async getPremium(req: Request, res: Response): Promise<void> {
    const city = req.query.city as string;
    if (!city) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'City query parameter is required.',
        'OfferController'
      );
    }
    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, plainToInstance(OfferShortRdo, offers, { excludeExtraneousValues: true }));
  }
}
