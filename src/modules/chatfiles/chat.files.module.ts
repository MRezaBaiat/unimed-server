import { Module } from '@nestjs/common';
import ChatFilesController from './chat.files.controller';
import ChatFilesService from './chat.files.service';
import { FilesModule } from '../files/files.module';
import { VisitsService } from '../visits/visits.service';
import { DiscountsService } from '../discounts/discounts.service';
import { TransactionsService } from '../transactions/transactions.service';

@Module({
  imports: [FilesModule],
  controllers: [ChatFilesController],
  providers: [ChatFilesService, VisitsService, DiscountsService, TransactionsService],
  exports: []
})
export class ChatFilesModule {}
