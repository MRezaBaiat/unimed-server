import { Injectable } from '@nestjs/common';
import {
  addWhiteListFilter,
  generateQueryResponse,
  isValidObjectId,
  ObjectId
} from '../../databases/utils';
import TransactionsRepo from '../../databases/transactions.repo';
import {
  FinancialAudit,
  QueryResponse,
  Transaction,
  TransactionType,
  User,
  Visit,
  VisitStatus
} from 'api';
import UsersRepo from '../../databases/users.repo';
import VisitsRepo from '../../databases/visits.repo';
import HealthCentersRepo from '../../databases/health.centers.repo';
import AdminsRepo from '../../databases/admins.repo';
import { SmartDate } from 'javascript-dev-kit';

@Injectable()
export class TransactionsService {
  constructor (private transactionsRepo: TransactionsRepo, private adminsRepo: AdminsRepo, private healthCentersRepo: HealthCentersRepo, private visitsRepo: VisitsRepo, private usersRepo: UsersRepo) {}

  public async create (transaction: Partial<Transaction>) {
    transaction = await this.transactionsRepo.crud().create(transaction);
    let newCurrency = 0;
    let userId;
    if (transaction.type === TransactionType.CHARGE_BY_ADMIN || transaction.type === TransactionType.CHARGE_BY_GATEWAY || transaction.type === TransactionType.STARTER_CHARGE || transaction.type === TransactionType.RETURN_VISIT_PAYMENT) {
      const user = await this.usersRepo.crud().withId(transaction.target._id).project({ currency: 1 }).findOne();
      userId = user._id;
      newCurrency = user.currency + transaction.amount;
    } else if (transaction.type === TransactionType.REDUCE_BY_ADMIN) {
      const user = await this.usersRepo.crud().withId(transaction.target._id).project({ currency: 1 }).findOne();
      userId = user._id;
      newCurrency = user.currency - transaction.amount;
    } else if (transaction.type === TransactionType.VISIT_PAYMENT || transaction.type === TransactionType.SERVICE_REQUEST_PAYMENT) {
      const user = await this.usersRepo.crud().withId(transaction.issuer._id).project({ currency: 1 }).findOne();
      userId = user._id;
      newCurrency = user.currency - transaction.amount;
    } else if (transaction.type === TransactionType.PAYROLL) {
      // TODO
    }
    await this.usersRepo.setPatientCurrency(userId, newCurrency);
    return transaction;
  }

  public async calculateFinancialAudit (id: string, type: 'user' | 'healthcenter' = 'user', fromDate: string = SmartDate.MIN_ISO_DATE, toDate: string = SmartDate.MAX_ISO_DATE): Promise<FinancialAudit> {
    let visits: Visit[];
    if (type === 'user') {
      visits = await this.visitsRepo.crud().where({ doctor: ObjectId(id), 'receipt.return_transaction_id': undefined, state: VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] })
        .project({ _id: 1, receipt: 1 })
        .findMany();
    } else {
      visits = await this.visitsRepo.crud().where({ 'receipt.healthCenterId': ObjectId(id), 'receipt.return_transaction_id': undefined, state: VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] })
        .project({ _id: 1, receipt: 1 })
        .findMany();
    }
    const total = visits.map(v => v.receipt.total).reduce((a, b) => a + b, 0);
    const doctorCut = visits.map(v => v.receipt.doctorCut).reduce((a, b) => Number(a) + Number(b), 0);
    const discountAmounts = visits.map(v => v.receipt.discount).reduce((a, b) => a + b, 0);
    const medicalCenterCut = visits.map(v => v.receipt.healthCenterCut).reduce((a, b) => Number(a) + Number(b), 0);
    const unsettledVisits = visits.filter(v => (type === 'user' ? !v.receipt.settled : !v.receipt.healthCenterSettled));
    const settledVisits = visits.filter(v => (type === 'user' ? v.receipt.settled : v.receipt.healthCenterSettled));

    const paid = settledVisits.map(t => type === 'user' ? t.receipt.doctorCut : t.receipt.healthCenterCut).reduce((a, b) => Number(a) + Number(b), 0);
    const payable = unsettledVisits.map(t => type === 'user' ? t.receipt.doctorCut : t.receipt.healthCenterCut).reduce((a, b) => Number(a) + Number(b), 0);
    return {
      fromDate,
      toDate,
      paid,
      companyCut: total - doctorCut - discountAmounts - medicalCenterCut,
      discountAmounts,
      total,
      doctorCut,
      medicalCenterCut,
      payable: Math.abs(payable), /* type === 'user' ? Math.abs(paid - doctorCut) : Math.abs(paid - medicalCenterCut) */
      unsettledVisits
    };
  }

  public async queryReports (type: 'user' | 'healthcenter' = 'user', fromDate: number = 0, toDate: number = Number.MAX_SAFE_INTEGER, skip: number, limit: number, search: string | undefined, whiteList?: string[]) {
    limit = Number.MAX_SAFE_INTEGER;
    let visits: Visit[];
    const query = this.visitsRepo.crud();
    if (type === 'user') {
      query.where({ 'receipt.return_transaction_id': undefined, $or: [{ state: VisitStatus.ENDED }, { state: VisitStatus.CANCELLED }], $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
      if (whiteList) {
        addWhiteListFilter(query, whiteList);
      }
      if (search && search !== '') {
        if (isValidObjectId(search)) {
          query.orWhere({ doctor: ObjectId(search) })
            .orWhere({ patient: ObjectId(search) });
        }
      }
      visits = await query
        .project({ _id: 1, doctor: 1, receipt: 1, state: 1, end_date: 1 })
        .populate([{ path: 'doctor', select: '_id name' }])
        .findMany();
    } else {
      query.where({ 'receipt.healthCenterId': { $ne: undefined }, 'receipt.return_transaction_id': undefined, $or: [{ state: VisitStatus.ENDED }, { state: VisitStatus.CANCELLED }], $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
      if (whiteList) {
        addWhiteListFilter(query, whiteList);
      }
      if (search && search !== '') {
        if (isValidObjectId(search)) {
          query.orWhere({ 'receipt.healthCenterId': ObjectId(search) });
        }
      }
      visits = await query
        .project({ _id: 1, receipt: 1, state: 1, end_date: 1 })
        .skip(skip)
        .limit(limit)
        .findMany();
    }
    console.log('found total of ' + visits.length);
    const res = {};
    const add = (user: any, visit: Visit) => {
      if (!user) {
        return;
      }
      res[user._id] = res[user._id] || { name: user.name, total: 0, visits: [] };
      if (visit.receipt && visit.receipt.total) {
        res[user._id].total += visit.receipt.total;
      }
      res[user._id].visits.push(visit);
    };
    for (const visit of visits) {
      if (type === 'user') {
        add(visit.doctor, visit);
      } else {
        add(visit.receipt.healthCenterId, visit);
      }
    }
    const total = Object.keys(res).length;
    const results = Object.keys(res).map((key) => {
      return {
        _id: key,
        ...res[key]
      };
    });
    return generateQueryResponse(total, results, skip, limit);
  }

  public async queryAllAccountings (type: 'user' | 'healthcenter' = 'user', fromDate: number = 0, toDate: number = Number.MAX_SAFE_INTEGER, skip: number, limit: number, search: string | undefined, whiteList?: string[]): Promise<QueryResponse<Transaction>> {
    let visits: Visit[];
    const query = this.visitsRepo.crud();
    if (type === 'user') {
      query.where({ 'receipt.settled': false, 'receipt.return_transaction_id': undefined, state: VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
      if (whiteList) {
        addWhiteListFilter(query, whiteList);
      }
      visits = await query
        .project({ _id: 1, doctor: 1, receipt: 1 })
        .populate(['doctor'])
        .findMany();
    } else {
      query.where({ 'receipt.healthCenterSettled': false, 'receipt.healthCenterId': { $ne: undefined }, 'receipt.return_transaction_id': undefined, state: VisitStatus.ENDED, $and: [{ end_date: { $gte: fromDate } }, { end_date: { $lte: toDate } }] });
      if (whiteList) {
        addWhiteListFilter(query, whiteList);
      }
      visits = await query
        .project({ _id: 1, receipt: 1 })
        .populate(['receipt.healthCenterId'])
        .findMany();
    }
    const res = {};
    const add = (user: any, visit: Visit) => {
      if (!user) {
        return console.log('user or center not exists any more');
      }
      res[user._id] = res[user._id] || { name: user.name, payable: 0 };
      res[user._id].payable += (type === 'user' ? Number(visit.receipt.doctorCut) : Number(visit.receipt.healthCenterCut));
    };
    visits.forEach((visit: Visit) => {
      add(type === 'user' ? visit.doctor : visit.receipt.healthCenterId, visit);
    });
    const total = Object.keys(res).length;
    const results = Object.keys(res).map((key) => {
      return {
        _id: key,
        ...res[key]
      };
    });
    return generateQueryResponse(total, results, skip, Number.MAX_SAFE_INTEGER);
  }

  public async applySettlement (adminId: string, targetId: string, visitIds: string[], type: 'user' | 'healthcenter', amount: number, details: string, trackingCode: string) {
    let target;
    if (type === 'user') {
      target = await this.usersRepo.crud().withId(targetId).findOne();
      await this.visitsRepo.crud()
        .where({ $or: visitIds.map(id => { return { _id: id }; }) })
        .set({ $set: { 'receipt.settled': true } })
        .updateMany();
    } else {
      target = await this.healthCentersRepo.crud().withId(targetId).findOne();
      await this.visitsRepo.crud()
        .where({ $or: visitIds.map(id => { return { _id: id }; }) })
        .set({ $set: { 'receipt.healthCenterSettled': true } })
        .updateMany();
    }
    await this.create({
      type: TransactionType.PAYROLL,
      amount,
      issuer: {
        _id: adminId,
        name: (await this.adminsRepo.crud().withId(adminId).project({ name: 1 }).findOne()).name,
        type: 'admin'
      },
      target: {
        _id: target._id,
        name: target.name
      },
      hint: details,
      trackingCode: trackingCode
    });
  }
}
