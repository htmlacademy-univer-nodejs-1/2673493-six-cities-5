import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { ILogger } from '../../libs/logger/index.js';
import { IUserService } from './user-service.interface.js';
import { IConfig, RestSchema } from '../../libs/config/index.js';
import { Component } from '../../types/index.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { UserRdo } from './rdo/user.rdo.js';
import { plainToInstance } from 'class-transformer';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/index.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: ILogger,
    @inject(Component.UserService) private readonly userService: IUserService,
    @inject(Component.Config) private readonly config: IConfig<RestSchema>,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController...');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)]
    });
    this.addRoute({ path: '/me', method: HttpMethod.Get, handler: this.checkStatus });
  }

  public async create(
    { body }: Request<unknown, unknown, CreateUserDto>,
    res: Response,
  ): Promise<void> {
    const existedUser = await this.userService.findByEmail(body.email);

    if (existedUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.config.get('SALT'));
    const responseData = plainToInstance(UserRdo, result, { excludeExtraneousValues: true });
    this.created(res, responseData);
  }

  public async login(
    { body }: Request<unknown, unknown, LoginUserDto>,
    res: Response,
  ): Promise<void> {
    const user = await this.userService.verifyUser(body, this.config.get('SALT'));

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    this.ok(res, { token: 'secret-token' });
  }

  public async checkStatus(_req: Request, res: Response): Promise<void> {
    const hardcodedUserId = '662fca6a15456f59e9a4f4d2';
    const user = await this.userService.findById(hardcodedUserId);

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    this.ok(res, plainToInstance(UserRdo, user, { excludeExtraneousValues: true }));
  }
}
