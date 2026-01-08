import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROVIDERS, CONFIG_PATHS } from '@beastcamp/shared-constants';
import { Redis } from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: PROVIDERS.REDIS_QUEUE,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>(CONFIG_PATHS.REDIS_QUEUE_HOST);
        const port = configService.get<number>(CONFIG_PATHS.REDIS_QUEUE_PORT);
        const password = configService.get<string>(
          CONFIG_PATHS.REDIS_QUEUE_PASSWORD,
        );

        return new Redis({
          host,
          port,
          password,
          retryStrategy: (times) => Math.min(times * 50, 2000),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [PROVIDERS.REDIS_QUEUE],
})
export class RedisModule {}
