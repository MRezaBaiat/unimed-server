import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UsersRepo, { UserSchema } from './users.repo';
import ServerConfigsRepo, { ServerConfigsSchema } from './server.configs.repo';
import VisitsRepo, { VisitSchema } from './visits.repo';
import TransactionsRepo, { TransactionSchema } from './transactions.repo';
import AdminsRepo, { AdminsSchema } from './admins.repo';
import HealthCentersRepo, { HealthCentersSchema } from './health.centers.repo';
import DiscountsRepo, { DiscountSchema } from './discounts.repo';
import CrashesRepo, { CrashSchema } from './crashes.repo';
import ArchivesRepo, { ArchiveSchema } from './archives.repo';
import SpecializationsRepo, { SpecializationSchema } from './specializations.repo';
import NotificationsRepo, { NotificationSchema } from './notifications.repo';
import CallsRepo, { CallSchema } from './calls.repo';
import AdminLogsRepo, { AdminLogSchema } from './admin.logs.repo';
import FilesRepo, { FileInfoSchema } from './files.repo';

const userModel = MongooseModule.forFeature([
  { name: 'users', schema: UserSchema }
]);

const serverConfigsModel = MongooseModule.forFeature([
  { name: 'server_config', schema: ServerConfigsSchema }
]);

const visitModel = MongooseModule.forFeature([
  { name: 'visits', schema: VisitSchema }
]);

const transactionModel = MongooseModule.forFeature([
  { name: 'transactions', schema: TransactionSchema }
]);

const adminsModel = MongooseModule.forFeature([
  { name: 'admins', schema: AdminsSchema }
]);

const healthCentersModel = MongooseModule.forFeature([
  { name: 'healthcenters', schema: HealthCentersSchema }
]);

const discountsModel = MongooseModule.forFeature([
  { name: 'discount_coupons', schema: DiscountSchema }
]);

const crashesModel = MongooseModule.forFeature([
  { name: 'crashes', schema: CrashSchema }
]);

const archivesModel = MongooseModule.forFeature([
  { name: 'archives', schema: ArchiveSchema }
]);

const specializationModel = MongooseModule.forFeature([
  { name: 'specializations', schema: SpecializationSchema }
]);

const notificationModel = MongooseModule.forFeature([
  { name: 'notifications', schema: NotificationSchema }
]);

const callModel = MongooseModule.forFeature([
  { name: 'calls', schema: CallSchema }
]);

const adminLogModel = MongooseModule.forFeature([
  { name: 'admin-logs', schema: AdminLogSchema }
]);

const fileInfoModel = MongooseModule.forFeature([
  { name: 'fs.files', schema: FileInfoSchema }
]);

@Global()
@Module({
  imports: [fileInfoModel, adminLogModel, callModel, notificationModel, specializationModel, archivesModel, crashesModel, discountsModel, healthCentersModel, userModel, serverConfigsModel, visitModel, transactionModel, adminsModel],
  controllers: [],
  providers: [FilesRepo, AdminLogsRepo, CallsRepo, NotificationsRepo, SpecializationsRepo, ArchivesRepo, CrashesRepo, DiscountsRepo, HealthCentersRepo, AdminsRepo, TransactionsRepo, VisitsRepo, UsersRepo, ServerConfigsRepo],
  exports: [FilesRepo, AdminLogsRepo, CallsRepo, NotificationsRepo, SpecializationsRepo, ArchivesRepo, CrashesRepo, DiscountsRepo, HealthCentersRepo, AdminsRepo, TransactionsRepo, VisitsRepo, UsersRepo, ServerConfigsRepo]
})
export class DatabaseModule {}
