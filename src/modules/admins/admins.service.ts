import { Injectable } from '@nestjs/common';
import AdminCreateDto from './dto/admin.create.dto';
import AdminsRepo from '../../databases/admins.repo';
import { AuthService } from '../auth/auth.service';
import { Admin, Privileges, QueryResponse } from 'api';
import SearchQuery from '../../databases/utils/search.query';

const defaultPrivilegeTestFunctionString = '(function(privilegeOptions,req){ return privilegeOptions[req.method.toLowerCase()].allowed; })';

@Injectable()
export class AdminsService {
  constructor (private adminsRepo: AdminsRepo, private authService: AuthService) {}

  public async createAdmin (data: AdminCreateDto) {
    const admin = await this.adminsRepo.crud().create(data);
    return this.authService.generateAccessToken(admin);
  }

  public async getPrivileges (adminId: string): Promise<Privileges | undefined> {
    const admin = await this.adminsRepo.crud().withId(adminId).project({ privileges: 1 }).findOne();
    if (admin) {
      admin.privileges.defaultTestFunction = defaultPrivilegeTestFunctionString;
    }
    return admin ? admin.privileges : undefined;
  }
}
