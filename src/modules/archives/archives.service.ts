import { Injectable } from '@nestjs/common';
import ArchivesRepo from '../../databases/archives.repo';
import UsersRepo from '../../databases/users.repo';
import { Archive, Helper, UserType } from 'api';
import BadRequestError from '../../errors/badrequest-error';
import { ObjectId } from '../../databases/utils';
import VisitsRepo from '../../databases/visits.repo';
import { FilesService } from '../files/files.service';

@Injectable()
export class ArchivesService {
  constructor (private archivesRepo: ArchivesRepo, private usersRepo: UsersRepo, private visitsRepo: VisitsRepo, private filesService: FilesService) {}

  public async create (doctorId: string, patientId: string, title: string, note: string, file?: {visitId: string, chatId: string}) {
    const patient = await this.usersRepo.crud().withId(patientId).project({ _id: 1, type: 1 }).findOne();
    if (!patient || patient.type !== UserType.PATIENT) {
      throw new BadRequestError();
    }
    const archive: Partial<Archive> = {
      createdAt: Date.now(),
      doctor: ObjectId(doctorId),
      patient: ObjectId(patientId),
      title: title,
      note: note
    };
    if (file) {
      const visit = await this.visitsRepo.crud().withId(file.visitId)
        .where({ doctor: ObjectId(doctorId), patient: ObjectId(patientId) })
        .project({ conversations: 1 })
        .findOne();

      if (!visit) {
        throw new BadRequestError('visit was not found');
      }
      const chat = visit.conversations.find(c => c.chat.id === file.chatId);
      if (!chat) {
        throw new BadRequestError('chat was not found');
      }
      if (!chat.chat.url) {
        throw new BadRequestError('chat was not a file');
      }
      const fileName = Helper.generateUUID();
      /* const { size, url } = await this.filesService.copy(chat.chat.url, { path: `/archives/notes/${doctorId}_${patientId}/`, fileName });
      archive.file = {
        url,
        file_name: fileName,
        file_size: size,
        mediaInfo: chat.chat.mediaInfo
      }; */
    }
    return this.archivesRepo.crud().create(archive);
  };
}
