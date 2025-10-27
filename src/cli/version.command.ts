import { readFileSync } from 'node:fs';
import { ICommandHandler } from './command-handler.interface.js';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export class VersionCommand implements ICommandHandler {
  public readonly name = '--version';

  private getVersion(): string {
    const currentFilePath = fileURLToPath(import.meta.url);
    const packageJsonPath = resolve(currentFilePath, '../../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  }

  public async execute(): Promise<void> {
    const version = this.getVersion();
    console.log(chalk.blue.bold(version));
  }
}
