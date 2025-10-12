#!/usr/bin/env node
import { HelpCommand } from './cli/help.command.js';
import { VersionCommand } from './cli/version.command.js';
import { ImportCommand } from './cli/import.command.js';
import { ICommandHandler } from './cli/command-handler.interface';

class CLIApp {
  constructor(
    private commands: Record<string, ICommandHandler> = {
      '--help': new HelpCommand(),
      '--version': new VersionCommand(),
      '--import': new ImportCommand()
    }
  ) {}

  public processCommand(argv: string[]): void {
    const [,, commandName, ...params] = argv;
    const command = this.commands[commandName] ?? this.commands['--help'];
    command.execute(...params);
  }
}

const cliApp = new CLIApp();
cliApp.processCommand(process.argv);
