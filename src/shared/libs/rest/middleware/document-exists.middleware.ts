import { IMiddleware } from './middleware.interface.js';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { DocumentExists } from './document-exists.interface.js';

export class DocumentExistsMiddleware implements IMiddleware {
  constructor(
    private readonly service: DocumentExists,
    private readonly entityName: string,
    private readonly paramName: string,
  ) {}

  public async execute({ params }: Request, _res: Response, next: NextFunction): Promise<void> {
    const documentId = params[this.paramName];
    if (!await this.service.exists(documentId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `${this.entityName} with id ${documentId} not found.`,
        'DocumentExistsMiddleware'
      );
    }

    next();
  }
}
