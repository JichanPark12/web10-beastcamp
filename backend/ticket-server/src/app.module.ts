import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationModule } from './reservation/reservation.module';
import { TicketSchedulerModule } from './ticket-scheduler/ticket-scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ReservationModule,
    TicketSchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
