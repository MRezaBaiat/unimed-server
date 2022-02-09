import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import AdminsRepo from '../databases/admins.repo';

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard('jwt') {
  constructor (private adminsRepo: AdminsRepo) {
    super();
  }

  // @ts-ignore
  async canActivate (context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const success = await super.canActivate(context);
    if (!success) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const userId = request.user;
    const admin = await this.adminsRepo.crud().withId(userId)
      .project({ privileges: 1 })
      .findOne();
    if (!admin) {
      return false;
    }
    request.privileges = admin.privileges;
    return true;
  }
}
