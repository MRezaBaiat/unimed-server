import GenericError from './generic-error';
import { HttpStatus } from '@nestjs/common';

export default class AccessDeniedError extends GenericError {
  constructor(message) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
