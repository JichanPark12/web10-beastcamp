import { Module } from '@nestjs/common';
import { ReservationModule } from '../reservation/reservation.module';
import { VirtualUserWorker } from './virtual-user.worker';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [ReservationModule, RedisModule],
  providers: [VirtualUserWorker],
})
export class VirtualUserModule {}
