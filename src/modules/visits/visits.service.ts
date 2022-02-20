import { Injectable } from '@nestjs/common';
import DoctorPostVisitDto from './dto/doctor.post.visit.dto';
import { LockService } from '../lock/lock.service';
import VisitsRepo from '../../databases/visits.repo';
import {
  VisitStatus,
  Visit,
  UserType,
  TransactionType,
  Rating,
  QueryResponse,
  Specialization, Helper
  , EventType
  , DiscountCoupon, User
  , Transaction, SendStatus
  , Chat
} from 'api/';
import UsersRepo from '../../databases/users.repo';
import { ClientsSocketService } from '../socket/clients.socket.service';
import PushNotificationService, { NOTIFICATION_TYPES } from '../notifications/push.notification.service';
import PatientPostVisitDto from './dto/patient.post.visit.dto';
import { ObjectId } from '../../databases/utils';
import dictionary from '../../utils/dictionary';
import { DiscountsService } from '../discounts/discounts.service';
import SmsService from '../notifications/sms.service';
import EventsService from '../notifications/events.service';
import HealthCentersRepo from '../../databases/health.centers.repo';
import { smartDate } from 'javascript-dev-kit';
import DiscountsRepo from '../../databases/discounts.repo';
import {
  WebSocketGateway
} from '@nestjs/websockets/';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
@WebSocketGateway(7070, { path: '/live', transports: ['websocket'], namespace: '/' })
export class VisitsService {
  constructor (private lockService: LockService, private healthCentersRepo: HealthCentersRepo, private eventsService: EventsService, private discountsRepo: DiscountsRepo, private smsService: SmsService, private discountsService: DiscountsService, private notificationsService: PushNotificationService, private socketService: ClientsSocketService, private transactionsService: TransactionsService, private visitsRepo: VisitsRepo, private usersRepo: UsersRepo) {}

  public finalizeVisitForDoctor (userId: string, info: DoctorPostVisitDto, alreadyLocked?: boolean) {
    const fn = async () => {
      const visit = await this.visitsRepo.crud().withId(info.visitId)
        .set({ state: VisitStatus.ENDED })
        .project({ patient: 1, doctor: 1, receipt: 1 })
        .populate(['patient', 'doctor'])
        .findOne();

      if (visit) {
        if (String(visit.doctor._id) !== String(userId)) {
          console.log('doctors not match ' + userId + ' vs ' + visit.doctor._id);
          return this.visitsRepo.findUserFinalizationsList(userId);
        }
        const user = await this.usersRepo.crud()
          .withId(userId)
          .where({ type: UserType.DOCTOR, finalizableVisits: { $in: [String(info.visitId)] } })
          .project({ _id: 1 })
          .findOne();

        if (info.returnCost && user) {
          await this.returnPaidAmount(info.visitId, true);
        }
        console.log('sending status');
        await this.socketService.sendStatus(visit.doctor._id);
      }
      await this.usersRepo.removeWaitingForFinalization(userId, info.visitId);
      return this.visitsRepo.findUserFinalizationsList(userId);
    };

    if (alreadyLocked) {
      return fn();
    }

    return this.lockService.lock(info.visitId, async (locked) => {
      if (!locked) {
        return;
      }
      return fn();
    });
  }

  public visitRequested (patientUserid: string, doctorCode: number, discountCode: string) {
    return this.lockService.lock(patientUserid, async (locked) => {
      if (!locked) {
        return;
      }
      const { error } = await this.checkVisitRequest(doctorCode, patientUserid, 'fa');
      if (error) {
        this.socketService.sendEvent(patientUserid, EventType.EVENT_ERROR, error);
        return;
      }

      const patient = await this.usersRepo.crud().withId(patientUserid).project({ currency: 1, mobile: 1 }).findOne();
      const doctor = await this.usersRepo.crud().where({ code: doctorCode }).project({ _id: 1, name: 1, details: 1 }).findOne();

      const { discountId, discountAmount } = await this.discountsService.checkAndGet(patientUserid, discountCode, 'fa');

      error && console.log(error);

      if (patient.currency < doctor.price - (discountAmount || 0)) {
        return this.socketService.sendEvent(patientUserid, EventType.EVENT_ERROR, dictionary.Strings.CURRENCY_LOW.fa);
      }

      console.log('discount id setting' + discountId);

      await this.visitsRepo.crud().create({
        state: VisitStatus.IN_QUEUE,
        discount: discountId as any,
        doctor: ObjectId(doctor._id) as any,
        patient: ObjectId(patientUserid) as any,
        chatting: false,
        maxDurationMillisec: doctor.details.maxVisitDurationMillisec
      });

      this.socketService.sendStatus(patientUserid, doctor._id);

      this.eventsService.notifyNewPatient(doctor._id);

      this.notifyQueues(doctor._id);
    });
  }

  public async finalizeVisitForPatient (userId: string, info: PatientPostVisitDto): Promise<Visit[] | undefined> {
    const visit = await this.visitsRepo.crud().withId(info.visitId)
      .where({ state: VisitStatus.ENDED })
      .project({ patient: 1, doctor: 1, receipt: 1 })
      .populate(['patient', 'doctor'])
      .findOne();

    if (visit) {
      if (String(visit.patient._id) !== String(userId)) {
        console.log('patients did not match ', visit.patient._id, userId);
        return this.visitsRepo.findUserFinalizationsList(userId);
      }
      const user = await this.usersRepo.crud().withId(userId)
        .where({ type: UserType.PATIENT, finalizableVisits: { $in: [String(info.visitId)] } })
        .project({ _id: 1 })
        .findOne();
      if (user) {
        await this.visitsRepo.crud().withId(info.visitId).set({ rating: info }).updateOne();
      }
    }
    await this.usersRepo.removeWaitingForFinalization(userId, info.visitId);
    return this.visitsRepo.findUserFinalizationsList(userId);
  };

  public async checkVisitRequest (doctorCode: number, patientUserId: string, lang: string): Promise<{ error?: string, name?: string, specialization?: Specialization, cost?: number, currency?: number }> {
    const res = { currency: undefined as any, error: undefined as any };
    const patient = await this.usersRepo.crud().withId(patientUserId)
      .project({ _id: 1, currency: 1 })
      .findOne();
    if (!patient) {
      res.error = dictionary.Strings.USER_NOT_FOUND[lang];
      return res;
    }
    res.currency = patient.currency;

    const statuses = await this.socketService.getStatuses([patientUserId]);

    if (statuses.length === 0 || !statuses[0].isOnline) {
      res.error = dictionary.Strings.PATIENT_OFFLINE[lang];
      return res;
    }

    if (await this.visitsRepo.findPatienceQueue(patient._id)) {
      res.error = dictionary.Strings.YOU_ARE_BUSY[lang];
      return res;
    }

    if (await this.visitsRepo.findActiveVisit(patient._id)) {
      res.error = dictionary.Strings.USER_BUSY[lang];
      return res;
    }

    const doctor = await this.usersRepo.crud()
      .where({ code: doctorCode })
      .project({ _id: 1, price: 1, name: 1, specialization: 1, ready: 1, 'details.responseDays': 1 })
      .findOne();

    if (!doctor) {
      res.error = dictionary.Strings.DOCTOR_NOT_FOUND[lang];
      return res;
    }

    if (!doctor.ready) {
      this.usersRepo.addPatientToNotificationQueue(doctor._id, patient._id);
      res.error = dictionary.Strings.DOCTOR_UNAVAILABLE[lang] +
          '\n' +
          dictionary.Strings.doctor_response_days_is[lang](doctor.name) + '\n' +
          Helper.createResponsiveDaysText(doctor.details.responseDays, lang);
      return res;
    }

    return { ...res, cost: doctor.price, name: doctor.name, specialization: doctor.specialization };
  }

  public async returnPaidAmount (visitId: string, locked?: boolean) {
    if (!locked) {
      return this.lockService.lock(visitId, async (locked) => {
        if (!locked) {
          return;
        }
        return this.returnPaidAmount(visitId, true);
      });
    }
    const visit = await this.visitsRepo.crud()
      .withId(visitId)
      .where({ state: VisitStatus.ENDED, 'receipt.return_transaction_id': null })
      .project({ patient: 1, doctor: 1, receipt: 1 })
      .populate(['patient', 'doctor'])
      .findOne();

    if (!visit) {
      console.log('no such visit');
      return;
    }
    const transaction = await this.transactionsService.create({
      type: TransactionType.RETURN_VISIT_PAYMENT,
      amount: visit.receipt.paid,
      visitId: visitId,
      healthCenter: visit.receipt.healthCenterId,
      healthCenterCut: visit.receipt.healthCenterCut,
      issuer: {
        _id: String(visit.doctor._id),
        name: visit.doctor.mobile + '(' + visit.doctor.name + ')',
        type: 'user'
      },
      target: {
        _id: String(visit.patient._id),
        name: visit.patient.mobile + '(' + visit.patient.name + ')'
      }
    });

    await this.visitsRepo.crud().withId(visitId)
      .set({ 'receipt.return_transaction_id': transaction._id })
      .updateOne();

    await this.usersRepo.removeWaitingForFinalization(visit.doctor._id, visitId);

    await this.notificationsService.sendNotification(visit.patient._id, NOTIFICATION_TYPES.DOCTOR_RETURNED_PAYMENT(visit.doctor.name)).catch(console.error);
    await this.socketService.sendStatus(visit.doctor._id);
  };

  public acceptVisit (visitId: string, requesterId: string) {
    return this.lockService.lock(visitId, async (locked) => {
      if (!locked) {
        return;
      }
      const visit = await this.visitsRepo.crud().withId(visitId)
        .where({ state: VisitStatus.IN_QUEUE })
        .project({ _id: 1, patient: 1, doctor: 1 })
        .findOne();

      if (!visit) {
        return this.socketService.sendStatus(requesterId);
      }

      if (await this.visitsRepo.findActiveVisit(String(visit.doctor))) {
        return this.socketService.sendStatus(requesterId);
      }

      /* const patientOnline = await this.socketService.isOnline(String(visit.patient));
      const doctorOnline = await this.socketService.isOnline(String(visit.doctor));
      if (!patientOnline || !doctorOnline) {
        await this.endVisit(visitId, false);
        return this.socketService.sendStatus(requesterId);
      } */

      const { error } = await this.startVisit(visitId);

      if (error) {
        console.log('could not start visit because ', error);
        this.socketService.sendEvent(String(visit.patient), EventType.EVENT_ERROR, error);
        return this.endVisit(visitId, false);
      }

      this.socketService.sendStatus(String(visit.patient), String(visit.doctor));
      this.notificationsService.sendNotification(String(visit.patient), NOTIFICATION_TYPES.VISIT_STARTED);
      this.notifyQueues(String(visit.doctor));
    });
  };

  public async startVisit (visitId: string): Promise<{ error?: string }> {
    const visit = await this.visitsRepo.crud()
      .withId(visitId)
      .where({ state: VisitStatus.IN_QUEUE })
      .project({ _id: 1, patient: 1, doctor: 1, discount: 1 })
      .populate(['doctor', 'patient', 'discount'])
      .findOne();

    if (!visit) {
      return { error: 'Visit was not found !' };
    }
    const coupon: DiscountCoupon = visit.discount;
    const patient: User = visit.patient;
    const doctor: User = visit.doctor;
    const responseTime: any = await this.usersRepo.getDoctorCurrentResponseTime(doctor._id);

    if (coupon) {
      coupon.amount = coupon.amount > doctor.price ? doctor.price : coupon.amount;
    }

    const total = doctor.price;
    let payable = total - (coupon ? coupon.amount : 0);
    payable = payable < 0 ? 0 : payable;

    if (patient.currency < payable) {
      return { error: 'موجودی حساب شما کم است' };
    }

    const healthCenterPercentage = responseTime && responseTime.healthCenter ? (await this.healthCentersRepo.crud().withId(responseTime.healthCenter._id).findOne()).percentage : undefined;
    const healthCenterCut = healthCenterPercentage ? ((total - Number(doctor.details.cut)) * healthCenterPercentage) / 100 : 0;

    let transaction: Partial<Transaction> = {
      discount: total - payable,
      amount: payable,
      doctorCut: Number(doctor.details.cut),
      healthCenter: responseTime && responseTime.healthCenter && responseTime.healthCenter._id,
      healthCenterCut,
      target: {
        _id: doctor._id,
        name: doctor.name
      },
      issuer: {
        _id: patient._id,
        name: patient.mobile,
        type: 'user'
      },
      visitId: visit._id,
      type: TransactionType.VISIT_PAYMENT
    };

    try {
      transaction = await this.transactionsService.create(transaction);
    } catch (e) {
      console.log(e);
      return { error: e };
    }

    const receipt = {
      discount: coupon ? coupon.amount : 0,
      paid: payable,
      total,
      healthCenterId: responseTime && responseTime.healthCenter && responseTime.healthCenter._id,
      healthCenterCut,
      doctorCut: Number(doctor.details.cut),
      transaction_id: transaction._id
    };

    await this.visitsRepo.crud().withId(visitId)
      .set({ state: VisitStatus.STARTED, start_date: new Date().getTime(), startDateUTC: smartDate().toISOString(), receipt })
      .updateOne();

    if (coupon) {
      await this.discountsRepo.couponUsedBy(coupon._id, patient._id);
    }

    return { error: undefined };
  }

  public async endVisit (visitId: string, returnMoney: boolean) {
    return this.lockService.lock(visitId, async (locked) => {
      if (!locked) {
        return;
      }
      const visit = await this.visitsRepo.crud().withId(visitId).findOne();
      if (visit) {
        if (visit.state === VisitStatus.IN_QUEUE) {
          await this.visitsRepo.crud().withId(visitId).set({ state: VisitStatus.CANCELLED, end_date: new Date().getTime() }).updateOne();
        } else if (visit.state === VisitStatus.STARTED) {
          await this.visitsRepo.crud().withId(visitId).set({ state: VisitStatus.ENDED, end_date: new Date().getTime() }).updateOne();

          await this.usersRepo.addWaitingForFinalization(String(visit.patient), visitId);
          await this.usersRepo.addWaitingForFinalization(String(visit.doctor), visitId);
        } else {
          console.log('visit status was ' + visit.state);
        }

        this.socketService.sendStatus(String(visit.patient), String(visit.doctor));

        this.socketService.sendFinalizableVisits(String(visit.patient));
        this.socketService.sendFinalizableVisits(String(visit.doctor));

        this.notifyQueues(String(visit.doctor));

        if (returnMoney) {
          await this.finalizeVisitForDoctor(visit.doctor._id, { visitId: visit._id, returnCost: returnMoney }, true);
        }
      }
    });
  }

  public async notifyQueues (doctorId: string) {
    const visitRequests = await this.visitsRepo.crud()
      .where({ doctor: ObjectId(doctorId), state: VisitStatus.IN_QUEUE })
      .project({ _id: 1, patient: 1 })
      .findMany();
    for (let i = 0; i < visitRequests.length; i++) {
      const patient = visitRequests[i].patient;
      this.socketService.sendEvent(String(patient), 'queue_update', { queue: i + 1, estimated: (i + 1) * 15 });
    }
  };

  public async sendMessage (senderId: string, targetId: string, chat: Chat, senderUserType: UserType) {
    chat.sendStatus = SendStatus.SENT;
    const visit = await this.visitsRepo.crud().withId(targetId)
      .where({ state: VisitStatus.STARTED })
      .project({ patient: 1, doctor: 1 })
      .findOne();

    if (!visit) {
      console.log('will not send message because the visit was not found');
      return;
    }

    this.visitsRepo.addChat(visit._id, chat, [senderId], senderUserType);
    const members = [String(visit.patient), String(visit.doctor)];

    for (const userId of members) {
      if (userId === senderId) {
        continue;
      }
      this.socketService.sendMessage(userId, senderId, targetId, chat);
    }
  }
}
