import { TokenPayload } from '../libs/token-service/index.js';

declare module 'express-serve-static-core' {
  export interface Request {
    user?: TokenPayload;
  }
}
