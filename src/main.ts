import 'reflect-metadata';
import { ICommandHandler } from './cli/command-handler.interface.js';
import { HelpCommand } from './cli/help.command.js';
import { VersionCommand } from './cli/version.command.js';
import { ImportCommand } from './cli/import.command.js';
import { GenerateCommand } from './cli/generate.command.js';
import { Container } from 'inversify';
import { Application } from './app/application.js';
import { ILogger, PinoLogger } from './shared/libs/logger/index.js';
import { IConfig, RestConfig, RestSchema } from './shared/libs/config/index.js';
import { Component } from './shared/types/index.js';
import { execSync } from 'node:child_process';
import { IDatabaseClient, MongoDatabaseClient } from './shared/libs/database-client/index.js';
import { DefaultUserService, UserEntity, UserModel, IUserService } from './shared/modules/user/index.js';
import { DefaultOfferService, OfferEntity, OfferModel, IOfferService } from './shared/modules/offer/index.js';
import { types } from '@typegoose/typegoose';

async function bootstrap() {
  if (process.platform === 'win32') {
    execSync('chcp 65001');
  }
  const container = new Container();
  container.bind<Application>(Component.Application).to(Application).inSingletonScope();
  container.bind<ILogger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<IConfig<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  container.bind<ICommandHandler>(Component.HelpCommand).to(HelpCommand).inSingletonScope();
  container.bind<ICommandHandler>(Component.VersionCommand).to(VersionCommand).inSingletonScope();
  container.bind<ICommandHandler>(Component.ImportCommand).to(ImportCommand).inSingletonScope();
  container.bind<ICommandHandler>(Component.GenerateCommand).to(GenerateCommand).inSingletonScope();

  container.bind<IDatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();
  container.bind<IUserService>(Component.UserService).to(DefaultUserService).inSingletonScope();
  container.bind<types.ModelType<UserEntity>>(Component.UserModel).toConstantValue(UserModel as any);
  container.bind<IOfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
  container.bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel as any);

  const application = container.get<Application>(Component.Application);
  await application.init();
}

bootstrap();
