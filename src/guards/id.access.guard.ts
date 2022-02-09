import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from '../modules';
import { Privileges, PrivilegeOptions } from 'matap-api';
import { defaultPrivilegeTestFunctionString } from '../utils';
import AccessDeniedError from '../errors/access-denied-error';

type Type = keyof Privileges;

@Injectable()
class Guard implements CanActivate {
  private readonly extractor: (req: Request)=> any;
  private readonly type: Type;
  canActivate (context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const privileges: Privileges = request.privileges;
    // @ts-ignore
    const options: PrivilegeOptions = privileges[this.type];
    const method = request.method.toLowerCase();
    const details = options[method];
    details.test = eval(details.test || privileges.defaultTestFunction || defaultPrivilegeTestFunctionString);
    if (!details.test(options, request)) {
      throw new AccessDeniedError('You do not have enough privileges to do so!');
    }
    if (details.whiteList.length === 0) {
      return true;
    }
    const id = String(this.extractor(request));
    return details.whiteList.find(s => String(s) === id);
  }

  constructor (type: Type, extractor: (req: Request)=> any) {
    this.type = type;
    this.extractor = extractor;
  }
}

export const IdAccessGuard = (type: Type, extractor: (req: any)=> any) => {
  return new Guard(type, extractor);
};
