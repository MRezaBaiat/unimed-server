interface NotificationProps{
  title: string,
  body?: string,
  soundName: 'default' | 'voice_mode_1.mp3' | 'voice_mode_2.mp3' | 'voice_visit_time_ended.mp3',
  channelId: 'default' | 'visit-started' | 'visit-time-ended' | 'patient-in-queue',
  link?: string,
  ignoreInForeground: boolean
}

export abstract class AbstractNotification {
  constructor (private data: { title:{fa: string, az: string}, body?:{az: string, fa: string}, soundName: NotificationProps['soundName'], channelId: NotificationProps['channelId'], link?: string, ignoreInForeground: boolean }) {}

  public getNotificationProps (lang: 'fa' | 'az'): NotificationProps {
    return {
      ...this.data,
      title: this.data.title[lang],
      body: this.data.body ? this.data.body[lang] : undefined
    };
  }
}

export class GeneralNotification extends AbstractNotification {
  constructor (title: string, body: string, link: string) {
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

export class NewPatientNotification extends AbstractNotification {
  constructor () {
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

export class VisitStartedNotification extends AbstractNotification {
  constructor () {
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

export class ResponseTimeStartedNotification extends AbstractNotification {
  constructor () {
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

export class ResponseTimeEndedNotification extends AbstractNotification {
  constructor () {
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

export class WorkTimeNearNotification extends AbstractNotification {
  constructor () {
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

export class DoctorComingOnlineNotification extends AbstractNotification {
  constructor (doctorName: string, minutes: number) {
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

export class PaymentReturnNotification extends AbstractNotification {
  constructor (doctorName: string) {
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
