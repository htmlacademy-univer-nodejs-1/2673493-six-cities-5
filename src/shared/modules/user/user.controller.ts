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
import { LoggedUserRdo } from './rdo/logged-user.rdo.js';
import { plainToInstance } from 'class-transformer';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { ValidateDtoMiddleware, ValidateObjectIdMiddleware, UploadFileMiddleware, DocumentExistsMiddleware } from '../../libs/rest/middleware/index.js';
import { ITokenService, TokenPayload } from '../../libs/token-service/index.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: ILogger,
    @inject(Component.UserService) private readonly userService: IUserService,
    @inject(Component.Config) private readonly config: IConfig<RestSchema>,
    @inject(Component.TokenService) private readonly tokenService: ITokenService,
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

    const documentExistsMiddleware = new DocumentExistsMiddleware(this.userService, 'User', 'userId');
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        documentExistsMiddleware,
        new UploadFileMiddleware(this.config, 'avatar'),
      ]
    });
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

    const tokenPayload: TokenPayload = {
      email: user.email,
      id: user.id
    };

    const token = await this.tokenService.sign(tokenPayload);
    const responseData = plainToInstance(LoggedUserRdo, { token }, { excludeExtraneousValues: true });
    this.ok(res, responseData);
  }

  public async checkStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    const user = await this.userService.findByEmail(req.user.email);

    this.ok(res, plainToInstance(UserRdo, user, { excludeExtraneousValues: true }));
  }

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!req.file) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'No file uploaded');
    }

    const filename = req.file.filename;
    const avatarPath = `/static/${filename}`;
    const updatedUser = await this.userService.setAvatar(userId, avatarPath);
    this.created(res, plainToInstance(UserRdo, updatedUser, { excludeExtraneousValues: true }));
  }
}
