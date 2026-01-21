import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { jwtConfig, redisConfig, queueConfig } from '@beastcamp/backend-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [redisConfig, jwtConfig, queueConfig],
    }),
    RedisModule,
    QueueModule,
  ],
})
export class AppModule {}
