import { ILogger } from '../shared/libs/logger/index.js';
import { ICommandHandler } from '../cli/command-handler.interface.js';
import { IConfig, RestSchema } from '../shared/libs/config/index.js';
import { injectable, inject } from 'inversify';
import { Component } from '../shared/types/index.js';

@injectable()
export class Application {
  private readonly logger: ILogger;
  private readonly config: IConfig<RestSchema>;
  private readonly commands: Record<string, ICommandHandler> = {};

  constructor(
    @inject(Component.Logger) logger: ILogger,
    @inject(Component.Config) config: IConfig<RestSchema>,
    @inject(Component.HelpCommand) helpCommand: ICommandHandler,
    @inject(Component.VersionCommand) versionCommand: ICommandHandler,
    @inject(Component.ImportCommand) importCommand: ICommandHandler,
    @inject(Component.GenerateCommand) generateCommand: ICommandHandler
  ) {
    this.logger = logger;
    this.config = config;

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

  private async processCommand(argv: string[]): Promise<void> {
    const [,, commandName, ...params] = argv;
    const command = this.commands[commandName] ?? this.commands['--help'];
    await command.execute(...params);
  }

  public async init() {
    this.logger.info('Application initialized.');
    this.logger.info(`Get value from config PORT: ${this.config.get('PORT')}`);

    try {
      await this.processCommand(process.argv);
    } catch (error) {
      this.logger.error('An error occurred during command processing', error as Error);
    }
  }
}
