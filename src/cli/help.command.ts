import { ICommandHandler } from './command-handler.interface.js';
import chalk from 'chalk';
import { ILogger } from '../shared/libs/logger/index.js';
import { injectable, inject } from 'inversify';
import { Component } from '../shared/types/index.js';

@injectable()
export class HelpCommand implements ICommandHandler {
  public readonly name = '--help';

  constructor(@inject(Component.Logger) private readonly logger: ILogger) {}

  public async execute(): Promise<void> {
    this.logger.info(`
      ${chalk.bold('Программа для подготовки данных для REST API сервера.')}

      ${chalk.yellow('Пример:')}
          main.js --<command> [--arguments]

      ${chalk.yellow('Команды:')}
          ${chalk.green('--version:')}                   # выводит номер версии
          ${chalk.green('--help:')}                      # печатает этот текст
          ${chalk.green('--import <path>:')}             # импортирует данные из TSV
          ${chalk.green('--generate <n> <path> <url>:')} # генерирует n тестовых предложений в файл path из данных по url
    `);
  }
}
