import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import ConfigsModule from './modules/configs/configs.module';
import { VisitsModule } from './modules/visits/visits.module';
import { LockModule } from './modules/lock/lock.module';
import { SocketModule } from './modules/socket/socket.module';
import { FilesModule } from './modules/files/files.module';
import { WebapiModule } from './modules/webapi/webapi.module';
import { HealthCentersModule } from './modules/healthcenters/health.centers.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { CrashesModule } from './modules/crashes/crashes.module';
import { ArchivesModule } from './modules/archives/archives.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { SpecializationsModule } from './modules/specializations/specializations.module';
import { ServerConfigsModule } from './modules/server-configs/server-configs.module';
import { CallsModule } from './modules/calls/calls.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AdminLoggerModule } from './modules/adminlogger/admin.logger.module';
import { DatabaseModule } from './databases/database.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ChatFilesModule } from './modules/chatfiles/chat.files.module';
import { TimerModule } from './modules/timer/timer.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigsModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
    RedisModule,
    AuthModule,
    LockModule,
    SocketModule,
    DatabaseModule,
    NotificationsModule,
    FilesModule,
    UsersModule,
    VisitsModule,
    HealthCentersModule,
    SurveysModule,
    WebapiModule,
    TransactionsModule,
    GatewayModule,
    DiscountsModule,
    CrashesModule,
    ArchivesModule,
    SpecializationsModule,
    ServerConfigsModule,
    CallsModule,
    AdminsModule,
    AdminLoggerModule,
    ChatFilesModule,
    TimerModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AuthModule]
})
export class AppModule {}
