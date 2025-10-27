#!/usr/bin/env node
import { HelpCommand } from './cli/help.command.js';
import { VersionCommand } from './cli/version.command.js';
import { ImportCommand } from './cli/import.command.js';
import { GenerateCommand } from './cli/generate.command.js';
import { ICommandHandler } from './cli/command-handler.interface.js';

class CLIApp {
  private commands: Record<string, ICommandHandler>;
  constructor() {
    this.commands = {
      '--help': new HelpCommand(),
      '--version': new VersionCommand(),
      '--import': new ImportCommand(),
      '--generate': new GenerateCommand(),
    };
  }

  public async processCommand(argv: string[]): Promise<void> {
    const [,, commandName, ...params] = argv;
    const command = this.commands[commandName] ?? this.commands['--help'];
    await command.execute(...params);
  }
}

const cliApp = new CLIApp();
cliApp.processCommand(process.argv);
