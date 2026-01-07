import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('performances')
export class Performance {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'venue_id' })
  venueId: number;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'performance_name',
    comment: '공연 이름',
  })
  performanceName: string;

  @Column({
    type: 'datetime',
    name: 'performance_date',
    comment: '공연 일시 (ISO 8601)',
  })
  performanceDate: Date;

  @Column({
    type: 'datetime',
    name: 'ticketing_date',
    comment: '티켓팅 일시 (ISO 8601)',
  })
  ticketingDate: Date;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;
}
