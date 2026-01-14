import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Performance } from './performance.entity';

@Entity('sessions')
@Unique(['performanceId', 'sessionDate'])
export class Session {
  constructor(performanceId?: number, sessionDate?: Date) {
    if (performanceId) this.performanceId = performanceId;
    if (sessionDate) this.sessionDate = sessionDate;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'performance_id' })
  performanceId: number;

  @Column({
    type: 'datetime',
    name: 'session_date',
    comment: '공연 회차 일시 (ISO 8601)',
  })
  sessionDate: Date;

  @ManyToOne(() => Performance)
  @JoinColumn({ name: 'performance_id' })
  performance: Performance;
}
