import { Request } from 'express-serve-static-core';

const Strings = {
  visit_started: {
    en: 'Your visit has been started',
    fa: 'ویزیت شما شروع شده است'
  },
  doctor_response_days_is: {
    fa: (doctorName: string) => `روزهای پاسخگویی ${doctorName} :`,
    en: (doctorName: string) => `${doctorName} responsive days:`
  },
  status_will_change_after_2_min: {
    fa: 'وضعیت شما پس از حداکثر 2 دقیقه به حالت غیر فعال تغییر خواهد کرد',
    en: 'Your status will change to inactive automatically after 2 maximum minutes'
  },
  DOCTOR_NOT_FOUND: {
    fa: 'پزشک مورد نظر پیدا نشد',
    en: 'The doctor was not found'
  },
  DOCTOR_UNAVAILABLE: {
    fa: 'پزشک مورد نظر فعال نیست',
    en: 'The doctor is not active right now'
  },
  USER_BUSY: {
    fa: 'کاربر در حال ویزیت است',
    en: 'The user is visiting right now'
  },
  YOU_ARE_BUSY: {
    fa: 'شما در حال ویزیت هستید',
    en: 'You already have an active visit'
  },
  USER_NOT_FOUND: {
    fa: 'کاربر پیدا نشد',
    en: 'User was not found'
  },
  USER_OFFLINE: {
    fa: 'کاربر آفلاین است',
    en: 'User is offline'
  },
  PATIENT_OFFLINE: {
    fa: 'بیمار آفلاین است',
    en: 'Patient is offline'
  },
  CURRENCY_LOW: {
    fa: 'موجودی کم است',
    en: 'Currency is low'
  },
  DISCOUNT_CODE_NOT_FOUND: {
    fa: 'تخفیفی با این کد پیدا نشد',
    en: 'There was no discount found with this code'
  },
  DISCOUNT_ALREADY_USED: {
    fa: 'این تخفیف قبلا برای شما استفاده شده است',
    en: 'This discount is already used for you before'
  },
  DISCOUNT_EXPIRED: {
    fa: 'این کپن منقضی شده است',
    en: 'This coupon is expired'
  }
};

/* const translate = (req: Request | string, stringObject: {fa: string, en: string}) => {
  let lang;
  if (typeof req === 'string') {
    lang = req;
  } else {
    lang = req.acceptsLanguages('fa', 'en') || 'fa';
  }
  console.log('lang : ' + lang);
  return stringObject[lang];
}; */

export default {
  Strings
};
