import { IOfferService } from './offer-service.interface.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { ILogger } from '../../libs/logger/index.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DEFAULT_OFFER_COUNT, PREMIUM_OFFER_COUNT } from './offer.constant.js';
import { CommentEntity } from '../comment/comment.entity.js';

@injectable()
export class DefaultOfferService implements IOfferService {
  constructor(
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.Logger) private readonly logger: ILogger
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create({
      ...dto,
      publicationDate: new Date(),
      rating: 1,
    });
    this.logger.info(`New offer created: ${dto.name}`);

    await result.populate('host');

    return result as unknown as DocumentType<OfferEntity>;
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findById(offerId)
      .populate('host')
      .exec() as unknown as Promise<DocumentType<OfferEntity> | null>;
  }

  public async find(count?: number): Promise<DocumentType<OfferEntity>[]> {
    const limit = count ?? DEFAULT_OFFER_COUNT;
    return this.offerModel
      .find()
      .sort({ publicationDate: -1 })
      .limit(limit)
      .populate('host')
      .exec() as unknown as Promise<DocumentType<OfferEntity>[]>;
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate('host')
      .exec() as unknown as Promise<DocumentType<OfferEntity> | null>;
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    await this.commentModel.deleteMany({ offerId }).exec();

    return this.offerModel
      .findByIdAndDelete(offerId)
      .exec() as unknown as Promise<DocumentType<OfferEntity> | null>;
  }

  public async findPremiumByCity(city: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ publicationDate: -1 })
      .limit(PREMIUM_OFFER_COUNT)
      .populate('host')
      .exec() as unknown as Promise<DocumentType<OfferEntity>[]>;
  }

  public async incCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, {
        $inc: { commentsCount: 1 }
      }, { new: true })
      .exec() as unknown as Promise<DocumentType<OfferEntity> | null>;
  }

  public async updateRating(offerId: string, rating: number): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, { rating }, { new: true })
      .exec() as unknown as Promise<DocumentType<OfferEntity> | null>;
  }

  public async exists(offerId: string): Promise<boolean> {
    const result = await this.offerModel.exists({ _id: offerId });
    return result !== null;
  }
}
