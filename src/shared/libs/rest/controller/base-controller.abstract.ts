import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { IController } from './controller.interface.js';
import { ILogger } from '../../logger/index.js';
import { IRoute } from '../types/route.interface.js';
import { injectable } from 'inversify';

@injectable()
export abstract class BaseController implements IController {
  private readonly _router: Router;

  constructor(
    protected readonly logger: ILogger,
  ) {
    this._router = Router();
  }

  get router() {
    return this._router;
  }

  public addRoute(route: IRoute) {
    const wrapperAsyncHandler = asyncHandler(route.handler.bind(this));
    const middlewareHandlers = route.middlewares?.map(
      (middleware) => asyncHandler(middleware.execute.bind(middleware))
    ) ?? [];
    const allHandlers = [...middlewareHandlers, wrapperAsyncHandler];
    this._router[route.method](route.path, ...allHandlers);
    this.logger.info(`Route registered: ${route.method.toUpperCase()} ${route.path}`);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    res
      .type('application/json')
      .status(statusCode)
      .json(data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public noContent(res: Response): void {
    res
      .status(StatusCodes.NO_CONTENT)
      .send();
  }
}
