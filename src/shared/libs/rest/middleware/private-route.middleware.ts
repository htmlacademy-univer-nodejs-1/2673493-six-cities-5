import { IMiddleware } from './middleware.interface.js';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';

@injectable()
export class PrivateRouteMiddleware implements IMiddleware {
  public execute({ user }: Request, _res: Response, next: NextFunction): void {
    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'PrivateRouteMiddleware'
      );
    }
    return next();
  }
}
