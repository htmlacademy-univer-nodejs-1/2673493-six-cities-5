import { DocumentExistsMiddleware, ValidateDtoMiddleware, ValidateObjectIdMiddleware, IMiddleware } from '../../libs/rest/middleware/index.js';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Component } from '../../types/index.js';
import { ILogger } from '../../libs/logger/index.js';
import { ICommentService } from './comment-service.interface.js';
import { IOfferService } from '../offer/offer-service.interface.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { plainToInstance } from 'class-transformer';
import { CommentRdo } from './rdo/comment.rdo.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

type ParamOfferId = {
  offerId: string;
}

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: ILogger,
    @inject(Component.CommentService) private readonly commentService: ICommentService,
    @inject(Component.OfferService) private readonly offerService: IOfferService,
    @inject(Component.PrivateRouteMiddleware) private readonly privateRouteMiddleware: IMiddleware,
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController...');
    const validateObjectIdMiddleware = new ValidateObjectIdMiddleware('offerId');
    const documentExistsMiddleware = new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId');

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [validateObjectIdMiddleware, documentExistsMiddleware]
    });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        this.privateRouteMiddleware,
        validateObjectIdMiddleware,
        new ValidateDtoMiddleware(CreateCommentDto),
        documentExistsMiddleware
      ]
    });
  }

  public async index(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params as ParamOfferId;

    const comments = await this.commentService.findByOfferId(offerId);
    this.ok(res, plainToInstance(CommentRdo, comments, { excludeExtraneousValues: true }));
  }

  public async create(
    req: Request<unknown, unknown, CreateCommentDto>,
    res: Response
  ): Promise<void> {
    const { body, user } = req;
    const { offerId } = req.params as ParamOfferId;

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'CommentController');
    }

    const result = await this.commentService.create({ ...body, offerId }, user.id);
    this.created(res, plainToInstance(CommentRdo, result, { excludeExtraneousValues: true }));
  }
}
