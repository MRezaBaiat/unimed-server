import { HttpStatus } from '@nestjs/common';

export default class GenericError {
  message;
  statusCode;
  id;
  constructor(
    message,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    id?: string | number,
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.id = id;
  }
}
