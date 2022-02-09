import GenericError from './generic-error';
export default class ValidationError extends GenericError {
    model: any;
    constructor(message: any, model?: any);
}
