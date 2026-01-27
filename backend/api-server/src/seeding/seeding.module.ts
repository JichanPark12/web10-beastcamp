import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { Venue } from '../venues/entities/venue.entity';
import { Block } from '../venues/entities/block.entity';
import { Performance } from '../performances/entities/performance.entity';
import { Session } from '../performances/entities/session.entity';
import { Grade } from '../performances/entities/grade.entity';
import { BlockGrade } from '../performances/entities/block-grade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venue,
      Block,
      Performance,
      Session,
      Grade,
      BlockGrade,
    ]),
  ],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
