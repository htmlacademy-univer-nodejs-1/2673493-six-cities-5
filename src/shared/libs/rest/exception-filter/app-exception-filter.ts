import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IExceptionFilter } from './exception-filter.interface.js';
import { ILogger } from '../../logger/index.js';
import { Component } from '../../../types/index.js';
import { HttpError } from '../errors/http-error.js';

@injectable()
export class AppExceptionFilter implements IExceptionFilter {
  constructor(
    @inject(Component.Logger) private readonly logger: ILogger
  ) {
    this.logger.info('Register AppExceptionFilter');
  }

  private handleHttpError(error: HttpError, _req: Request, res: Response, _next: NextFunction) {
    this.logger.error(`[${error.details}] ${error.httpStatusCode} — ${error.message}`, error);
    res
      .status(error.httpStatusCode)
      .json({error: error.message, details: error.details});
  }

  private handleOtherError(error: Error, _req: Request, res: Response, _next: NextFunction) {
    this.logger.error(error.message, error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({error: error.message});
  }

  public catch(error: Error | HttpError, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, req, res, next);
    }

    this.handleOtherError(error, req, res, next);
  }
}
