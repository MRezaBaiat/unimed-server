import GenericError from './generic-error';
import { HttpStatus } from '@nestjs/common';

export default class InternalServerError extends GenericError {
  constructor(message?) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
