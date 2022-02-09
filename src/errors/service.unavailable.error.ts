import { HttpException, HttpStatus } from '@nestjs/common';

export class ServiceUnavailableError extends HttpException {
  constructor (message?) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
