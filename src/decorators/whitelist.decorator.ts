import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Privileges } from 'api';
import AccessDeniedError from '../errors/access-denied-error';
import { defaultPrivilegeTestFunctionString } from '../utils';

type Type = keyof Privileges;

const decorator = createParamDecorator(
  async (type: Type, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const privileges: Privileges = request.privileges;
    const method = request.method.toLowerCase();
    const options = privileges[type];
    const details = options[method];
    details.test = eval(details.test || privileges.defaultTestFunction || defaultPrivilegeTestFunctionString);
    if (!details.test(options, request)) {
      throw new AccessDeniedError('You do not have enough privileges to do so!');
    }
    return details.whiteList;
  }
);

const WhiteList = (type: Type) => {
  return decorator(type);
};

export default WhiteList;
