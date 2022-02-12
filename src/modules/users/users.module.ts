import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { VisitsService } from '../visits/visits.service';
import { UsersAdminController } from './users.admin.controller';
import { DiscountsModule } from '../discounts/discounts.module';
import { TransactionsService } from '../transactions/transactions.service';

@Module({
  imports: [AuthModule, FilesModule, DiscountsModule],
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService, VisitsService, TransactionsService],
  exports: [UsersService]
})
export class UsersModule {}
