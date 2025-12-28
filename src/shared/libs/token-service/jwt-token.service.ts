import { ITokenService, TokenPayload } from './token-service.interface.js';
import { inject, injectable } from 'inversify';
import { IConfig, RestSchema } from '../config/index.js';
import { Component } from '../../types/index.js';
import { ILogger } from '../logger/index.js';
import { SignJWT, jwtVerify } from 'jose';

@injectable()
export class JWTTokenService implements ITokenService {
  private readonly secret: Uint8Array;

  constructor(
    @inject(Component.Config) private readonly config: IConfig<RestSchema>,
    @inject(Component.Logger) private readonly logger: ILogger,
  ) {
    this.secret = new TextEncoder().encode(this.config.get('JWT_SECRET'));
  }

  public async sign(payload: TokenPayload): Promise<string> {
    this.logger.info(`Attempting to sign JWT for user ${payload.email}`);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.config.get('JWT_EXPIRES_IN'))
      .sign(this.secret);

    this.logger.info(`JWT for user ${payload.email} signed successfully.`);
    return token;
  }

  public async verify(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify<TokenPayload>(token, this.secret);
      return payload;
    } catch (error) {
      this.logger.error('Failed to verify token.', error as Error);
      throw new Error('Invalid token');
    }
  }
}
