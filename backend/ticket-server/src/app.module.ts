import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { jwtConfig, redisConfig } from '@beastcamp/backend-config';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservationModule } from './reservation/reservation.module';
import { TicketSchedulerModule } from './ticket-scheduler/ticket-scheduler.module';
import { CaptchaModule } from './captcha/captcha.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, redisConfig],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ReservationModule,
    TicketSchedulerModule,
    CaptchaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
