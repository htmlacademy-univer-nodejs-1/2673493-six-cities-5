import { User } from '../../types/index.js';

export type TokenPayload = Pick<User, 'email'> & { id: string };

export interface ITokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
