"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentReturnNotification = exports.DoctorComingOnlineNotification = exports.WorkTimeNearNotification = exports.ResponseTimeEndedNotification = exports.ResponseTimeStartedNotification = exports.VisitStartedNotification = exports.NewPatientNotification = exports.GeneralNotification = exports.AbstractNotification = void 0;
class AbstractNotification {
    constructor(data) {
        this.data = data;
    }
    getNotificationProps(lang) {
        return Object.assign(Object.assign({}, this.data), { title: this.data.title[lang], body: this.data.body ? this.data.body[lang] : undefined });
    }
}
exports.AbstractNotification = AbstractNotification;
class GeneralNotification extends AbstractNotification {
    constructor(title, body, link) {
        super({
            channelId: 'default',
            soundName: 'default',
            title: {
                fa: title,
                az: title
            },
            link: link,
            body: {
                fa: body,
                az: body
            },
            ignoreInForeground: false
        });
    }
}
exports.GeneralNotification = GeneralNotification;
class NewPatientNotification extends AbstractNotification {
    constructor() {
        super({
            title: {
                fa: 'یک بیمار جدید در صف انتظار است',
                az: 'Yeni xəstə növbə gözləyir'
            },
            channelId: 'patient-in-queue',
            soundName: 'voice_mode_2.mp3',
            ignoreInForeground: false
        });
    }
}
exports.NewPatientNotification = NewPatientNotification;
class VisitStartedNotification extends AbstractNotification {
    constructor() {
        super({
            title: {
                fa: 'ویزیت شما شروع شد',
                az: 'Məsləhətləşməniz başladı'
            },
            channelId: 'visit-started',
            soundName: 'voice_mode_1.mp3',
            ignoreInForeground: false
        });
    }
}
exports.VisitStartedNotification = VisitStartedNotification;
class ResponseTimeStartedNotification extends AbstractNotification {
    constructor() {
        super({
            title: {
                fa: 'وضعیت شما به حالت فعال تغییر کرد',
                az: 'Statusunuz aktiv olaraq dəyişdi'
            },
            channelId: 'default',
            soundName: 'default',
            ignoreInForeground: false
        });
    }
}
exports.ResponseTimeStartedNotification = ResponseTimeStartedNotification;
class ResponseTimeEndedNotification extends AbstractNotification {
    constructor() {
        super({
            title: {
                fa: 'وضعیت شما به حالت غیر فعال تغییر کرد',
                az: 'Statusunuz qeyri-aktiv olaraq dəyişdi'
            },
            channelId: 'default',
            soundName: 'default',
            ignoreInForeground: false
        });
    }
}
exports.ResponseTimeEndedNotification = ResponseTimeEndedNotification;
class WorkTimeNearNotification extends AbstractNotification {
    constructor() {
        super({
            title: {
                fa: 'با سلام، ساعت کار مطپ شما نزدیک است',
                az: 'Unimed-də iş saatlarınız yaxındır'
            },
            channelId: 'default',
            soundName: 'default',
            ignoreInForeground: false
        });
    }
}
exports.WorkTimeNearNotification = WorkTimeNearNotification;
class DoctorComingOnlineNotification extends AbstractNotification {
    constructor(doctorName, minutes) {
        super({
            title: {
                fa: `${doctorName} تا ${minutes} دقیقه دیگر آنلاین می شوند`,
                az: `Doktor ${doctorName} , ${minutes} dəqiqəyə onlayn olacaq`
            },
            channelId: 'default',
            soundName: 'default',
            ignoreInForeground: false
        });
    }
}
exports.DoctorComingOnlineNotification = DoctorComingOnlineNotification;
class PaymentReturnNotification extends AbstractNotification {
    constructor(doctorName) {
        super({
            title: {
                fa: `هزینه ویزیت شما توسط ${doctorName} بازگشت داده شد`,
                az: `Məsləhət haqqınız Dr ${doctorName} tərəfindən qaytarildi`
            },
            channelId: 'default',
            soundName: 'default',
            ignoreInForeground: false
        });
    }
}
exports.PaymentReturnNotification = PaymentReturnNotification;
