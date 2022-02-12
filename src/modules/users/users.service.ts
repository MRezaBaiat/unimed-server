import { Injectable } from '@nestjs/common';
import { ChatType, QueryResponse, User, UserType } from 'api';
import UsersRepo from '../../databases/users.repo';
import SearchQuery from '../../databases/utils/search.query';
import { FilesService } from '../files/files.service';
import { ClientsSocketService } from '../socket/clients.socket.service';
import { smartDate } from 'javascript-dev-kit';
import { Request } from '../index';

@Injectable()
export class UsersService {
  constructor (private usersRepo: UsersRepo, private filesService: FilesService, private socketService: ClientsSocketService) {}

  public async createNew (user: Partial<User>) {
    return this.usersRepo.crud().create(user);
  }

  public async deleteUser (userId: string) {
    const user = await this.usersRepo.crud().withId(userId).findOne();
    if (!user) {
      console.log('no user with id ', userId);
      return;
    }
    if (user.imageUrl) {
      await this.filesService.delete(user.imageUrl);
    }
    await this.usersRepo.crud().withId(userId).deleteOne();
    await this.socketService.deleteSession(userId);
  }

  public deleteProfileImage = async (userId: string) => {
    const user = await this.usersRepo.crud().withId(userId)
      .project({ imageUrl: 1 })
      .findOne();
    if (!user || !user.imageUrl) {
      return;
    }
    await this.filesService.delete(user.imageUrl);
  };

  public async updateProfileImage (req: Request, userId: string) {
    await this.deleteProfileImage(userId);
    const res = await this.filesService.upload(req, { fileType: ChatType.IMAGE });
    await this.usersRepo.crud().withId(userId)
      .set({ imageUrl: res.url })
      .updateOne();
    return res.url;
  }

  public async getNotificationSettings (userId: string) {
    const user = await this.usersRepo.crud().withId(userId).project({ 'settings.notifications': 1 }).findOne();
    if (!user.settings || !user.settings.notifications) {
      return {
        newPatient: { notification: true, sms: false },
        workTimeClose: { notification: true, sms: false },
        workTimeEnded: { notification: true, sms: false },
        workTimeStarted: { notification: true, sms: false }
      };
    }
    return user.settings.notifications;
  }

  public async createJoiningDateReport (): Promise<{[key: string]: number}> {
    const users = await this.usersRepo.crud().where({})
      .project({ creationDate: 1 })
      .findMany();
    const vals: {[key: string]: number} = {};
    users.forEach((u) => {
      const d = smartDate(u.createdAt);
      const val = d.jYear() + '/' + d.jMonth();
      if (!vals[val]) {
        vals[val] = 0;
      }
      vals[val] += 1;
    });
    return vals;
  }
}
