import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { jwtConfig } from '@beastcamp/backend-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { redisConfig } from '@beastcamp/backend-config';
import { ReservationModule } from './reservation/reservation.module';
import { TicketSchedulerModule } from './ticket-scheduler/ticket-scheduler.module';
import { CaptchaModule } from './captcha/captcha.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    AuthModule,
    CaptchaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
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
