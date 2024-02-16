import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get(key) {
    return await this.cache.get(key);
  }
  async set(key: string, value: unknown, ttl = 0) {
    return await this.cache.set(key, value, ttl);
  }
  async del(key: string) {
    return await this.cache.del(key);
  }
  async reset() {
    await this.cache.reset();
  }
}
