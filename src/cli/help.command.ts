import { ICommandHandler } from './command-handler.interface.js';
import chalk from 'chalk';

export class HelpCommand implements ICommandHandler {
  public readonly name = '--help';
  public async execute(): Promise<void> {
    console.log(`
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
