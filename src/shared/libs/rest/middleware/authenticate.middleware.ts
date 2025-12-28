import { IMiddleware } from './middleware.interface.js';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Component } from '../../../types/index.js';
import { ITokenService } from '../../token-service/index.js';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

@injectable()
export class AuthenticateMiddleware implements IMiddleware {
  constructor(
    @inject(Component.TokenService) private readonly tokenService: ITokenService
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers?.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authorizationHeader.split(' ')[1];

    try {
      const payload = await this.tokenService.verify(token);
      req.user = payload;
      return next();
    } catch (error) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid token',
        'AuthenticateMiddleware'
      );
    }
  }
}
