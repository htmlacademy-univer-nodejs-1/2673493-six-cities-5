import { Response, Router } from 'express';
import { IRoute } from '../types/route.interface.js';

export interface IController {
  readonly router: Router;
  addRoute(route: IRoute): void;
  send<T>(res: Response, statusCode: number, data: T): void;
  ok<T>(res: Response, data: T): void;
  created<T>(res: Response, data: T): void;
  noContent(res: Response): void;
}
