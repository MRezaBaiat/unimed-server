import GenericError from './generic-error';
import { HttpStatus } from '@nestjs/common';

export default class BadRequestError extends GenericError {
  constructor(message?, id?: string | number) {
    super(message, HttpStatus.BAD_REQUEST, id);
  }
}
