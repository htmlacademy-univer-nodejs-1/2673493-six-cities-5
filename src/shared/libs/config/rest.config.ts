import { ILogger } from '../logger/index.js';
import { IConfig } from './config.interface.js';
import { configRestSchema, RestSchema } from './rest.schema.js';
import { config } from 'dotenv';
import { injectable, inject } from 'inversify';
import { Component } from '../../../shared/types/index.js';

@injectable()
export class RestConfig implements IConfig<RestSchema> {
  private readonly config: RestSchema;

  constructor(@inject(Component.Logger) private readonly logger: ILogger) {
    const parsedOutput = config();

    if (parsedOutput.error) {
      throw new Error('Can\'t read .env file. Perhaps the file does not exists.');
    }

    configRestSchema.load(parsedOutput.parsed ?? {});
    configRestSchema.validate({ allowed: 'strict', output: this.logger.info });

    this.config = configRestSchema.getProperties();
    this.logger.info('.env file found and successfully parsed!');

    if (this.config.SALT === null || this.config.DB_HOST === null || this.config.DB_USER === null || this.config.DB_PASSWORD === null || this.config.DB_NAME === null || this.config.JWT_SECRET === null) {
      this.logger.error('Not all required environment variables are set (SALT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET). Application will be terminated.', new Error('Environment configuration error'));
      throw new Error('Not all required environment variables are set. Check .env file.');
    }
  }

  public get<T extends keyof RestSchema>(key: T): RestSchema[T] {
    return this.config[key];
  }
}
