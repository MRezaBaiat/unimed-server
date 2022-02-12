import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import RedLock from 'redlock';

@Injectable()
export class LockService {
  constructor (private redisService: RedisService) {
    this.redLock.on('clientError', function (err) {
      console.error('A redis error has occurred:', err);
    });
  }

  private readonly redLock = new RedLock([this.redisService.createClient()], {
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time

    // The max number of times Redlock will attempt to lock a resource
    // before erroring.
    retryCount: 20,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200, // time in ms

    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the `using` API.
    automaticExtensionThreshold: 500 // time in ms
  });

  public async lock <T> (lockTag: string, cb: (locked: boolean)=>Promise<T>, duration = 4000): Promise<T> {
    if (!lockTag) {
      throw new Error('lock tag can not be void');
    }
    lockTag = String(lockTag);
    console.log('locking', lockTag, 'at', new Date().toString());
    let mLock;
    return new Promise<T>((resolve, reject) => {
      this.redLock.lock(lockTag, duration).then(async (l) => {
        mLock = l;
        return cb(true)
          .then(resolve)
          .catch(reject);
      }).catch((e) => {
        console.error('failed to get lock for ' + lockTag);
        console.error(e);
        return cb(false)
          .then(resolve)
          .catch(reject);
      });
    }).finally(() => {
      mLock && mLock.unlock().then(() => {
        console.log('unlocked', lockTag, 'at', new Date().toString());
      }).catch(console.log);
    });
  }
/*
  public async lock <T> (lockTag: string, cb: (locked: boolean)=>Promise<T>, duration = 10000): Promise<T> {
    if (!lockTag) {
      throw new Error('lock tag can not be void');
    }
    lockTag = String(lockTag);
    return new Promise((resolve, reject) => {
      this.redLock.using([lockTag], duration, async (signal) => {
        if (signal.aborted) {
          console.error(signal.error);
          return cb(false)
            .then(resolve)
            .catch(reject);
        }
        return cb(true)
          .then(resolve)
          .catch(reject);
      }).catch((e) => {
        console.error('failed to get lock for ' + lockTag);
        console.error(e);
        return cb(false)
          .then(resolve)
          .catch(reject);
      });
    });
  } */
}
