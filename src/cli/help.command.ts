import { ICommandHandler } from './command-handler.interface';
import chalk from 'chalk';

export class HelpCommand implements ICommandHandler {
  public readonly name = '--help';
  public execute(): void {
    console.log(`
      ${chalk.bold('Программа для подготовки данных для REST API сервера.')}

      ${chalk.yellow('Пример:')}
          main.js --<command> [--arguments]

      ${chalk.yellow('Команды:')}
          ${chalk.green('--version:')}                   # выводит номер версии
          ${chalk.green('--help:')}                      # печатает этот текст
          ${chalk.green('--import:')}             # импортирует данные из TSV
    `);
  }
}
