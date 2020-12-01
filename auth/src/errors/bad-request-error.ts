import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode = 400;
  message = '';

  constructor(message: string) {
    super(message);

    this.message = message;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    console.log(this.message);
    return [{ message: this.message }];
  }
}