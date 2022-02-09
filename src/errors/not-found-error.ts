import GenericError from './generic-error';
import { HttpStatus } from '@nestjs/common';

export default class NotFoundError extends GenericError {
  constructor(message?) {
    super(message, HttpStatus.NOT_FOUND);
  }
}
