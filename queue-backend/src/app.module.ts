import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { jwtConfig, redisConfig } from '@beastcamp/shared-nestjs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [redisConfig, jwtConfig],
    }),
    RedisModule,
    QueueModule,
  ],
})
export class AppModule {}
