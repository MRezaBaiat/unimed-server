import { Injectable } from '@nestjs/common';
import HealthCentersRepo from '../../databases/health.centers.repo';
import { ChatType, HealthCenter, QueryResponse, User } from 'api';
import UsersRepo from '../../databases/users.repo';
import { addWhiteListFilter, arrayIncludes, nameFilter, ObjectId } from '../../databases/utils';
import { FilesService } from '../files/files.service';
import { Request } from '../index';

@Injectable()
export class HealthCentersService {
  constructor (private filesService: FilesService, private healthCentersRepo: HealthCentersRepo, private usersRepo: UsersRepo) {}

  public async getDoctorsInHealthCenter (centerId: string): Promise<User[]> {
    const users = await this.usersRepo.crud()
      .orWhere({ 'details.clinics': arrayIncludes([ObjectId(centerId)]) })
      .orWhere({ 'details.hospitals': arrayIncludes([ObjectId(centerId)]) })
      .project({ _id: 1, name: 1, price: 1, imageUrl: 1, code: 1, 'details.responseDays': 1 })
      .findMany();

    const center = await this.healthCentersRepo.crud().withId(centerId).project({ priorities: 1 }).findOne();
    const prioritized: User[] = [];
    center.priorities.forEach((userId) => {
      const user = users.find(s => String(s._id) === userId);
      if (user) {
        prioritized.push(user);
      }
    });
    users.forEach((user) => {
      if (prioritized.indexOf(user) < 0) {
        prioritized.push(user);
      }
    });
    return prioritized;
  }

  public async updateLogoImage (id: string, req: Request): Promise<string> {
    await this.deleteLogoImage(id);
    const res = await this.filesService.upload(req, { fileType: ChatType.IMAGE });
    await this.healthCentersRepo.crud().withId(id).set({ logoUrl: res.url }).updateOne();
    return res.url;
  };

  public async deleteWallpaperImage (id: string) {
    const center = await this.healthCentersRepo.crud().withId(id).project({ wallpaperUrl: 1 }).findOne();
    if (!center || !center.wallpaperUrl) {
      return;
    }
    await this.filesService.delete(center.wallpaperUrl);
  };

  public async updateWallpaperImage (id: string, req: Request): Promise<string> {
    await this.deleteWallpaperImage(id);
    const res = await this.filesService.upload(req, { fileType: ChatType.IMAGE });
    await this.healthCentersRepo.crud().withId(id).set({ wallpaperUrl: res.url }).updateOne();
    return res.url;
  };

  public async deleteLogoImage (id: string) {
    const center = await this.healthCentersRepo.crud().withId(id).project({ logoUrl: 1 }).findOne();
    if (!center || !center.logoUrl) {
      return;
    }
    await this.filesService.delete(center.logoUrl);
  };

  public async deleteHealthCenter (id: string) {
    const center = await this.healthCentersRepo.crud().withId(id)
      .where({ logoUrl: 1, wallpaperUrl: 1 })
      .findOne();

    if (!center) {
      return;
    }
    const keys = ['0', '1', '2', '3', '4', '5', '6'];
    const conditions = [];
    conditions.push({ 'details.responseDays.0.healthCenter': id });
    conditions.push({ 'details.responseDays.1.healthCenter': id });
    conditions.push({ 'details.responseDays.2.healthCenter': id });
    conditions.push({ 'details.responseDays.3.healthCenter': id });
    conditions.push({ 'details.responseDays.4.healthCenter': id });
    conditions.push({ 'details.responseDays.5.healthCenter': id });
    conditions.push({ 'details.responseDays.6.healthCenter': id });

    const users = await this.usersRepo.crud().where({ $or: [...conditions, { 'details.clinics': arrayIncludes([ObjectId(id)]) }, { 'details.hospitals': arrayIncludes([ObjectId(id)]) }] })
      .project({ _id: 1, details: 1 })
      .findMany();

    users.forEach((user: User) => {
      let arr = user.details.clinics;
      for (let i = arr.length - 1; i >= 0; i--) {
        const s = arr[i];
        if (String(s._id) === String(id)) {
          arr.splice(arr.indexOf(s), 1);
        }
      }
      arr = user.details.hospitals;
      for (let i = arr.length - 1; i >= 0; i--) {
        const s = arr[i];
        if (String(s._id) === String(id)) {
          arr.splice(arr.indexOf(s), 1);
        }
      }
      keys.forEach((day) => {
        arr = user.details.responseDays[day];
        for (let i = arr.length - 1; i >= 0; i--) {
          const s: any = arr[i];
          if (s.healthCenter && String(s.healthCenter._id) === String(id)) {
            arr.splice(arr.indexOf(s), 1);
          }
        }
      });
      this.usersRepo.crud().withId(user._id).set(user).patch();
    });
    if (center.logoUrl) {
      await this.filesService.delete(center.logoUrl);
    }
    if (center.wallpaperUrl) {
      await this.filesService.delete(center.wallpaperUrl);
    }
    return this.healthCentersRepo.crud().withId(id).deleteOne();
  }
}
