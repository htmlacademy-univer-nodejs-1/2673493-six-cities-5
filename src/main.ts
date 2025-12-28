import 'reflect-metadata';
import { Container } from 'inversify';
import { Application } from './app/application.js';
import { ILogger, PinoLogger } from './shared/libs/logger/index.js';
import { IConfig, RestConfig, RestSchema } from './shared/libs/config/index.js';
import { Component } from './shared/types/index.js';
import { IDatabaseClient, MongoDatabaseClient } from './shared/libs/database-client/index.js';
import { DefaultUserService, UserEntity, UserModel, IUserService, UserController } from './shared/modules/user/index.js';
import { DefaultOfferService, OfferEntity, OfferModel, IOfferService, OfferController } from './shared/modules/offer/index.js';
import { ICommentService, DefaultCommentService, CommentEntity, CommentModel, CommentController } from './shared/modules/comment/index.js';
import { types } from '@typegoose/typegoose';
import { IExceptionFilter, AppExceptionFilter } from './shared/libs/rest/exception-filter/index.js';
import { IController } from './shared/libs/rest/controller/index.js';
import { FavoriteController } from './shared/modules/favorites/index.js';
import { ICommandHandler } from './cli/command-handler.interface.js';
import { HelpCommand } from './cli/help.command.js';
import { VersionCommand } from './cli/version.command.js';
import { ImportCommand } from './cli/import.command.js';
import { GenerateCommand } from './cli/generate.command.js';
import { execSync } from 'node:child_process';
import { ITokenService, JWTTokenService } from './shared/libs/token-service/index.js';
import { IMiddleware } from './shared/libs/rest/middleware/index.js';
import { AuthenticateMiddleware } from './shared/libs/rest/middleware/index.js';
import { PrivateRouteMiddleware } from './shared/libs/rest/middleware/index.js';

async function bootstrap() {
  if (process.platform === 'win32') {
    execSync('chcp 65001');
  }
  const container = new Container();

  container.bind<Application>(Component.Application).to(Application).inSingletonScope();
  container.bind<ILogger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<IConfig<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  container.bind<IDatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();
  container.bind<IExceptionFilter>(Component.ExceptionFilter).to(AppExceptionFilter).inSingletonScope();

  container.bind<ICommandHandler>(Component.HelpCommand).to(HelpCommand).inSingletonScope();
  container.bind<ICommandHandler>(Component.VersionCommand).to(VersionCommand).inSingletonScope();
  container.bind<ICommandHandler>(Component.ImportCommand).to(ImportCommand).inSingletonScope();
  container.bind<ICommandHandler>(Component.GenerateCommand).to(GenerateCommand).inSingletonScope();

  container.bind<IUserService>(Component.UserService).to(DefaultUserService).inSingletonScope();
  container.bind<IOfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
  container.bind<ICommentService>(Component.CommentService).to(DefaultCommentService).inSingletonScope();

  container.bind<types.ModelType<UserEntity>>(Component.UserModel).toConstantValue(UserModel as unknown as types.ModelType<UserEntity>);
  container.bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel as unknown as types.ModelType<OfferEntity>);
  container.bind<types.ModelType<CommentEntity>>(Component.CommentModel).toConstantValue(CommentModel as unknown as types.ModelType<CommentEntity>);

  container.bind<IController>(Component.UserController).to(UserController).inSingletonScope();
  container.bind<IController>(Component.OfferController).to(OfferController).inSingletonScope();
  container.bind<IController>(Component.FavoriteController).to(FavoriteController).inSingletonScope();
  container.bind<IController>(Component.CommentController).to(CommentController).inSingletonScope();
  container.bind<ITokenService>(Component.TokenService).to(JWTTokenService).inSingletonScope();
  container.bind<IMiddleware>(Component.AuthenticateMiddleware).to(AuthenticateMiddleware).inSingletonScope();
  container.bind<IMiddleware>(Component.PrivateRouteMiddleware).to(PrivateRouteMiddleware).inSingletonScope();

  const application = container.get<Application>(Component.Application);
  await application.init();
}

bootstrap();
