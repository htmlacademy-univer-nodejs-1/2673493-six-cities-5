import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';
import { setTimeout } from 'node:timers/promises';
import { ILogger } from '../logger/index.js';
import { Component } from '../../types/index.js';
import { IDatabaseClient } from './database-client.interface.js';

const RETRY_COUNT = 5;
const RETRY_TIMEOUT = 1000;

@injectable()
export class MongoDatabaseClient implements IDatabaseClient {
  private mongoose!: typeof mongoose;
  private isConnected: boolean;

  constructor(@inject(Component.Logger) private readonly logger: ILogger) {
    this.isConnected = false;
  }

  public isConnectedToDatabase() {
    return this.isConnected;
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnectedToDatabase()) {
      this.logger.info('MongoDB client already connected.');
      return;
    }

    this.logger.info('Trying to connect to MongoDB...');

    let attempt = 0;
    while (attempt < RETRY_COUNT) {
      try {
        this.mongoose = await mongoose.connect(uri);
        this.isConnected = true;
        this.logger.info('Database connection established.');
        return;
      } catch (error) {
        attempt++;
        this.logger.error(`Failed to connect to the database. Attempt ${attempt}`, error as Error);
        await setTimeout(RETRY_TIMEOUT);
      }
    }

    throw new Error(`Unable to establish database connection after ${RETRY_COUNT} attempts.`);
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnectedToDatabase()) {
      this.logger.info('Not connected to the database – passed.');
      return;
    }

    await this.mongoose.disconnect?.();
    this.isConnected = false;
    this.logger.info('Database connection closed.');
  }
}
