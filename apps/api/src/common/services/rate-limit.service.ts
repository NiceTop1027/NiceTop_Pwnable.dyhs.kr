import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

type MemoryBucket = { count: number; resetAt: number };

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly memory = new Map<string, MemoryBucket>();
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
      this.redis.connect().catch((err) => {
        this.logger.warn(
          `Redis unavailable, falling back to in-memory rate limits: ${err.message}`,
        );
        this.redis?.disconnect();
        this.redis = null;
      });
    }
  }

  async consume(key: string, limit: number, windowMs: number): Promise<void> {
    const allowed = this.redis
      ? await this.consumeRedis(key, limit, windowMs)
      : this.consumeMemory(key, limit, windowMs);

    if (!allowed) {
      throw new HttpException(
        'Too many requests. Please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private consumeMemory(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = this.memory.get(key);

    if (!bucket || bucket.resetAt < now) {
      this.memory.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (bucket.count >= limit) return false;

    bucket.count += 1;
    return true;
  }

  private async consumeRedis(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    if (!this.redis) return this.consumeMemory(key, limit, windowMs);

    const redisKey = `rl:${key}`;
    try {
      const count = await this.redis.incr(redisKey);
      if (count === 1) {
        await this.redis.pexpire(redisKey, windowMs);
      }
      return count <= limit;
    } catch (err) {
      this.logger.warn(
        `Redis rate limit error, using memory fallback: ${(err as Error).message}`,
      );
      return this.consumeMemory(key, limit, windowMs);
    }
  }

  onModuleDestroy() {
    this.redis?.disconnect();
  }
}