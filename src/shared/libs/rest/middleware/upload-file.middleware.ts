import { IMiddleware } from './middleware.interface.js';
import { NextFunction, Request, Response } from 'express';
import multer, { diskStorage } from 'multer';
import { extension } from 'mime-types';
import { nanoid } from 'nanoid';
import { IConfig } from '../../config/config.interface.js';
import { RestSchema } from '../../config/rest.schema.js';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

export class UploadFileMiddleware implements IMiddleware {
  private readonly uploadDirectory: string;

  constructor(
    private readonly configService: IConfig<RestSchema>,
    private readonly fieldName: string,
  ) {
    this.uploadDirectory = this.configService.get('UPLOAD_DIRECTORY');
  }

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const storage = diskStorage({
      destination: this.uploadDirectory,
      filename: (_req, file, callback) => {
        const fileExtension = extension(file.mimetype);
        const filename = nanoid();
        callback(null, `${filename}.${fileExtension}`);
      }
    });

    const upload = multer({
      storage,
      fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          return cb(null, true);
        }

        return cb(new HttpError(StatusCodes.BAD_REQUEST, 'Invalid file type. Only .jpg and .png are allowed.'));
      }
    }).single(this.fieldName);

    upload(req, res, (error: unknown) => {
      if (error instanceof Error) {
        return next(new HttpError(StatusCodes.BAD_REQUEST, error.message));
      }
      next();
    });
  }
}
