import { Controller, Get } from '@nestjs/common';
import UsersRepo from '../../databases/users.repo';
import { UserType } from 'api';

@Controller('webapi')
export class WebapiController {
  constructor (private usersRepo: UsersRepo) {}

  @Get('/onlines')
  public async handleGetOnlines () {
    return this.usersRepo.crud()
      .where({ type: UserType.DOCTOR, ready: true })
      .project({ _id: 1, name: 1, imageUrl: 1, specialization: 1 })
      .limit(10)
      .populate(['specialization']);
  }
}
