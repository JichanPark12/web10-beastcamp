import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

@Module({
  imports: [RedisModule, AuthModule],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
