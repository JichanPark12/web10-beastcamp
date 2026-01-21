import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { redisConfig } from '@beastcamp/backend-config';
import { ReservationModule } from './reservation/reservation.module';
import { TicketSchedulerModule } from './ticket-scheduler/ticket-scheduler.module';
import { CaptchaModule } from './captcha/captcha.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    ScheduleModule.forRoot(),
    ReservationModule,
    TicketSchedulerModule,
    CaptchaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
