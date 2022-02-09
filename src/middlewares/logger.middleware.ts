import morgan from 'morgan';

/* @Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use (req, res, next) {
    console.log('Request...');
    next();
  }
} */

// :method :url :status :response-time ms - :res[content-length]
const logger = morgan('dev');
export function LoggerMiddleware (req, res, next) {
  logger(req, res, next);
}
