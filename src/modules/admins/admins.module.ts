import { Module } from '@nestjs/common';
import { AdminsAdminController } from './admins.admin.controller';
import { AdminsService } from './admins.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminsAdminController],
  providers: [AdminsService],
  exports: [AdminsService]
})
export class AdminsModule {}
