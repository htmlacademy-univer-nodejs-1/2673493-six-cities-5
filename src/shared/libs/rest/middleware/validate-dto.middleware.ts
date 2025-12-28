import { IMiddleware } from './middleware.interface.js';
import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

export class ValidateDtoMiddleware implements IMiddleware {
  constructor(private dto: ClassConstructor<object>) {}

  public async execute({ body }: Request, _res: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dto, body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const errorDetails = errors.map((error) => ({
        property: error.property,
        value: error.value,
        messages: error.constraints ? Object.values(error.constraints) : [],
      }));

      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Validation error',
        errorDetails,
      );
    }

    next();
  }
}
