import { injectable, inject } from 'inversify';
import express, { Express } from 'express';
import { ILogger } from '../shared/libs/logger/index.js';
import { IConfig, RestSchema } from '../shared/libs/config/index.js';
import { Component } from '../shared/types/index.js';
import { IExceptionFilter } from '../shared/libs/rest/exception-filter/index.js';
import { IController } from '../shared/libs/rest/controller/index.js';
import { ICommandHandler } from '../cli/command-handler.interface.js';
import { IDatabaseClient } from '../shared/libs/database-client/index.js';
import { getMongoURI } from '../shared/libs/utils.js';

@injectable()
export class Application {
  private readonly server: Express;
  private readonly commands: Record<string, ICommandHandler> = {};

  constructor(
    @inject(Component.Logger) private readonly logger: ILogger,
    @inject(Component.Config) private readonly config: IConfig<RestSchema>,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: IExceptionFilter,
    @inject(Component.DatabaseClient) private readonly databaseClient: IDatabaseClient,
    @inject(Component.UserController) private readonly userController: IController,
    @inject(Component.OfferController) private readonly offerController: IController,
    @inject(Component.CommentController) private readonly commentController: IController,
    @inject(Component.FavoriteController) private readonly favoriteController: IController,
    @inject(Component.HelpCommand) helpCommand: ICommandHandler,
    @inject(Component.VersionCommand) versionCommand: ICommandHandler,
    @inject(Component.ImportCommand) importCommand: ICommandHandler,
    @inject(Component.GenerateCommand) generateCommand: ICommandHandler,
  ) {
    this.server = express();
    this.registerCommands(helpCommand, versionCommand, importCommand, generateCommand);
  }

  private registerCommands(
    help: ICommandHandler,
    version: ICommandHandler,
    imprt: ICommandHandler,
    generate: ICommandHandler
  ): void {
    this.commands[help.name] = help;
    this.commands[version.name] = version;
    this.commands[imprt.name] = imprt;
    this.commands[generate.name] = generate;
  }

  private async _initServer() {
    const port = this.config.get('PORT');
    this.server.listen(port);
    this.logger.info(`🚀Server started on http://localhost:${port}`);
  }

  private async _initMiddleware() {
    this.server.use(express.json());
    this.logger.info('Global middleware initialized.');
  }

  private async _initRoutes() {
    this.server.use('/users', this.userController.router);
    this.server.use('/offers', this.offerController.router);
    this.server.use('/offers', this.commentController.router);
    this.server.use('/favorites', this.favoriteController.router);
    this.logger.info('Routes initialized.');
  }

  private async _initExceptionFilters() {
    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.logger.info('Exception filters initialized.');
  }

  private async processCommand(argv: string[]): Promise<void> {
    const [,, commandName, ...params] = argv;
    const command = this.commands[commandName] ?? this.commands['--help'];
    await command.execute(...params);
  }

  public async init() {
    this.logger.info('Application initialization');

    if (process.argv.length > 2) {
      await this.processCommand(process.argv);
      return;
    }

    await this._initDb();
    await this._initMiddleware();
    await this._initRoutes();
    await this._initExceptionFilters();
    await this._initServer();
  }

  private async _initDb() {
    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(mongoUri);
  }
}
