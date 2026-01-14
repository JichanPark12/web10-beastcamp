import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformancesController } from './performances.controller';
import { PerformancesService } from './performances.service';
import { Performance } from './entities/performance.entity';
import { Session } from './entities/session.entity';
import { Venue } from '../venues/entities/venue.entity';
import { PerformancesRepository } from './performances.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Performance, Session, Venue])],
  controllers: [PerformancesController],
  providers: [PerformancesService, PerformancesRepository],
})
export class PerformancesModule {}
