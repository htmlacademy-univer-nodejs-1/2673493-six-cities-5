export interface ICommandHandler {
  readonly name: string;
  execute(...params: string[]): void;
}
