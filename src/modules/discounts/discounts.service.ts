import { Injectable } from '@nestjs/common';
import { DiscountCoupon, QueryResponse } from 'api';
import DiscountsRepo from '../../databases/discounts.repo';
import dictionary from '../../utils/dictionary';
import SearchQuery from '../../databases/utils/search.query';

@Injectable()
export class DiscountsService {
  constructor (private discountsRepo: DiscountsRepo) {}

  public async checkAvailability (userId: string, code: string, lang: string): Promise<{ error?: string, amount?: number, _id?: string }> {
    userId = String(userId);
    // , end_date: { $lt: new Date().getTime() }
    const coupon: DiscountCoupon = await this.discountsRepo.crud().where({ code }).findOne();
    if (!coupon) {
      console.log('no 1');
      return { error: dictionary.Strings.DISCOUNT_CODE_NOT_FOUND[lang] };
    }
    if (coupon.usages.length >= coupon.totalUsageLimit) {
      console.log('no 2');
      return { error: dictionary.Strings.DISCOUNT_CODE_NOT_FOUND[lang] };
    }
    if (coupon.perUserLimit !== -1) {
      const usages = coupon.usages.filter(id => id === userId);
      if (usages.length >= coupon.perUserLimit) {
        console.log('discount already used for ' + userId);
        return { error: dictionary.Strings.DISCOUNT_ALREADY_USED[lang] };
      }
    }
    return { amount: coupon.amount, _id: coupon._id };
  }

  public async query (query: SearchQuery<DiscountCoupon, { whiteList: string[] }>): Promise<QueryResponse<DiscountCoupon>> {
    const { skip, limit, sort, whiteList, search, populations, projection } = query;
    const condition = this.discountsRepo.crud()
      .whereTextLike({ title: search }, 'or')
      .searchId({ _id: search }, 'or')
      .whiteListFilter(whiteList);

    if (query.search) {
      condition.where({ code: search });
    }

    return condition
      .project(projection || { __v: 0, usages: 0 })
      .skip(skip)
      .limit(limit)
      .populate(populations)
      .sort(sort)
      .query();
  }

  public async checkAndGet (patientUserid: string, discountCode: string, lang: string): Promise<{discountId?: string, discountAmount?: number, error?: string}> {
    if (discountCode && discountCode.length === 6) {
      const coupon = await this.checkAvailability(patientUserid, discountCode, lang);
      if (coupon) {
        return { discountId: coupon._id, discountAmount: coupon.amount, error: coupon.error };
      }
    }
    return { discountId: undefined, discountAmount: undefined };
  }
}
