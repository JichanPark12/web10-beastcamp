import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { ReservationService } from './reservation.service';

@Module({
  imports: [RedisModule],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
