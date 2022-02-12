import { Module } from '@nestjs/common';
import { ArchivesController } from './archives.controller';
import { ArchivesService } from './archives.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [ArchivesController],
  providers: [ArchivesService]
})
export class ArchivesModule {}
