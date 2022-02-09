import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const UserId = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === 'ws') {
      const client = ctx.switchToWs().getClient();
      return client.userProps.userid;
    } else {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    }
  }
);

export default UserId;
