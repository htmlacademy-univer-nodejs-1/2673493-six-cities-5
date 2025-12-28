import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { ICommentService } from './comment-service.interface.js';
import { Component } from '../../types/index.js';
import { ILogger } from '../../libs/logger/index.js';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { IOfferService } from '../offer/offer-service.interface.js';
import { DEFAULT_COMMENT_COUNT } from './comment.constant.js';

@injectable()
export class DefaultCommentService implements ICommentService {
  constructor(
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.OfferService) private readonly offerService: IOfferService,
    @inject(Component.Logger) private readonly logger: ILogger,
  ) {}

  public async create(dto: CreateCommentDto, userId: string): Promise<DocumentType<CommentEntity>> {
    const comment = await this.commentModel.create({
      ...dto,
      user: userId,
      publicationDate: new Date(),
    });

    await this.offerService.incCommentCount(dto.offerId);

    const [aggregateResult] = await this.commentModel.aggregate([
      { $match: { offerId: new Types.ObjectId(dto.offerId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]).exec();

    const newRating = aggregateResult ? Number(aggregateResult.avgRating.toFixed(1)) : 0;

    await this.offerService.updateRating(dto.offerId, newRating);

    this.logger.info(`New comment created for offer ${dto.offerId}`);

    await comment.populate('user');

    return comment as unknown as DocumentType<CommentEntity>;
  }

  public async findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel
      .find({ offerId })
      .sort({ publicationDate: -1 })
      .limit(DEFAULT_COMMENT_COUNT)
      .populate('user')
      .exec() as unknown as Promise<DocumentType<CommentEntity>[]>;
  }
}
