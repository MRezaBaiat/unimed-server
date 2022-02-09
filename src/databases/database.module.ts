import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UsersRepo, { UserSchema } from './users.repo';
import ServerConfigsRepo, { ServerConfigsSchema } from './server.configs.repo';
import VisitsRepo, { VisitSchema } from './visits.repo';
import TransactionsRepo, { TransactionSchema } from './transactions.repo';
import ReservationsRepo, { ReservationsSchema } from './reservations.repo';
import AdminsRepo, { AdminsSchema } from './admins.repo';
import MedicalServicesRepo, { MedicalServicesSchema } from './medical.services.repo';
import ServiceRequestsRepo, { ServiceRequestsSchema } from './service.requests.repo';
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

const reservationsModel = MongooseModule.forFeature([
  { name: 'reservations', schema: ReservationsSchema }
]);

const adminsModel = MongooseModule.forFeature([
  { name: 'admins', schema: AdminsSchema }
]);

const medicalServicesModel = MongooseModule.forFeature([
  { name: 'medical_services', schema: MedicalServicesSchema }
]);

const serviceRequestsModel = MongooseModule.forFeature([
  { name: 'service_requests', schema: ServiceRequestsSchema }
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
  imports: [fileInfoModel, adminLogModel, callModel, notificationModel, specializationModel, archivesModel, crashesModel, discountsModel, healthCentersModel, userModel, serverConfigsModel, visitModel, transactionModel, reservationsModel, adminsModel, medicalServicesModel, serviceRequestsModel],
  controllers: [],
  providers: [FilesRepo, AdminLogsRepo, CallsRepo, NotificationsRepo, SpecializationsRepo, ArchivesRepo, CrashesRepo, DiscountsRepo, HealthCentersRepo, ServiceRequestsRepo, MedicalServicesRepo, AdminsRepo, TransactionsRepo, VisitsRepo, UsersRepo, ServerConfigsRepo, ReservationsRepo],
  exports: [FilesRepo, AdminLogsRepo, CallsRepo, NotificationsRepo, SpecializationsRepo, ArchivesRepo, CrashesRepo, DiscountsRepo, HealthCentersRepo, ServiceRequestsRepo, MedicalServicesRepo, AdminsRepo, ReservationsRepo, TransactionsRepo, VisitsRepo, UsersRepo, ServerConfigsRepo]
})
export class DatabaseModule {}
