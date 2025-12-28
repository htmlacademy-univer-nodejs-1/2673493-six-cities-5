export class HttpError extends Error {
  public httpStatusCode: number;
  public details: string;

  constructor(httpStatusCode: number, message: string, details = '') {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.details = details;
  }
}
