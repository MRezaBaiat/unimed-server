import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import ConfigsModule from '../configs/configs.module';
import { DatabaseModule } from '../../databases/database.module';

@Module({
  imports: [],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
