import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformancesController } from './performances.controller';
import { PerformancesService } from './performances.service';
import { Performance } from './entities/performance.entity';
import { Venue } from '../venues/entities/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Performance, Venue])],
  controllers: [PerformancesController],
  providers: [PerformancesService],
})
export class PerformancesModule {}
