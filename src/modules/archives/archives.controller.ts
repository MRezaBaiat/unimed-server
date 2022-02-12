import { Body, Controller, Delete, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import { ArchivesService } from './archives.service';
import UserId from '../../decorators/userid.decorator';
import ArchivesRepo from '../../databases/archives.repo';
import { ObjectId } from '../../databases/utils';
import BadRequestError from '../../errors/badrequest-error';
import { FilesService } from '../files/files.service';

@UseGuards(JwtAuthGuard)
@Controller('archives')
export class ArchivesController {
  constructor (private archivesService: ArchivesService, private archivesRepo: ArchivesRepo, private filesService: FilesService) {}

  @Post('/')
  public async handleCreateArchive (@Body() body, @UserId() userId) {
    const { title, note, patientId, chatId, visitId } = body;
    const file = chatId && visitId && {
      chatId,
      visitId
    };

    await this.archivesService.create(userId, patientId, title, note, file);
    return true;
  }

  @Patch('/')
  public async handleUpdateArchive (@Body() body, @UserId() userId) {
    const { _id, patientId, title, note } = body;
    return this.archivesRepo.crud().withId(_id)
      .where({ patient: ObjectId(patientId), doctor: ObjectId(userId) })
      .set({ title, note })
      .updateOne();
  }

  @Delete('/')
  public async handleDeleteArchive (@Body() body, @UserId() userId) {
    const { _id, patientId } = body;
    const archive = await this.archivesRepo.crud().withId(_id)
      .where({ patient: ObjectId(patientId), doctor: ObjectId(_id) })
      .project({ _id: 1, file: 1 })
      .findOne();

    if (!archive) {
      throw new BadRequestError('no such archive was found');
    }
    if (archive.file) {
      await this.filesService.delete(archive.file.url);
    }
    return this.archivesRepo.crud().withId(_id).deleteOne();
  }
}
