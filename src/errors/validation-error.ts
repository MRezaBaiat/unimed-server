import GenericError from './generic-error';
import { HttpStatus } from '@nestjs/common';

export default class ValidationError extends GenericError {
  model;
  constructor(message, model?) {
    super(message, HttpStatus.BAD_REQUEST);
    this.model = model;
  }
}
