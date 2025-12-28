export class HttpError extends Error {
  public httpStatusCode: number;
  public details?: string | object[];

  constructor(httpStatusCode: number, message: string, details?: string | object[]) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.details = details;
  }
}
