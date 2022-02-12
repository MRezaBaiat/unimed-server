import {
  Inject,
  Injectable,
  CACHE_MANAGER
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  constructor (@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async set (key: string, value: any, expirationMinutes?: number) {
    const config = expirationMinutes
      ? { ttl: expirationMinutes * 60 }
      : undefined;
    return this.cacheManager.set(
      this.getPrefix() + key,
      typeof value === 'string' ? value : JSON.stringify(value),
      config
    );
  }

  public async get (key: string): Promise<string | undefined> {
    return this.cacheManager.get(this.getPrefix() + key);
  }

  public createClient () {
    return createClient({
      url: process.env.REDIS_URL
    });
  }

  protected getPrefix () {
    return '';
  }
}
