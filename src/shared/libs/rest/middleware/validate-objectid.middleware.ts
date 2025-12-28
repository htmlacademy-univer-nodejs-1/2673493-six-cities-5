import { IMiddleware } from './middleware.interface.js';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

export class ValidateObjectIdMiddleware implements IMiddleware {
  constructor(private param: string) {}

  public execute({ params }: Request, _res: Response, next: NextFunction): void {
    const objectId = params[this.param];

    if (Types.ObjectId.isValid(objectId)) {
      return next();
    }

    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `${objectId} is not a valid ObjectID`,
      'ValidateObjectIdMiddleware'
    );
  }
}
