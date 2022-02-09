import GenericError from './generic-error';
import { HttpStatus } from '@nestjs/common';

export default class AuthenticationError extends GenericError {
  constructor(message) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
