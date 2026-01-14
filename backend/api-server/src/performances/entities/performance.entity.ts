import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';
import { Session } from './session.entity';

@Entity('performances')
export class Performance {
  constructor(
    performanceName?: string,
    ticketingDate?: Date,
    venueId?: number,
  ) {
    if (performanceName) this.performanceName = performanceName;
    if (ticketingDate) this.ticketingDate = ticketingDate;
    if (venueId) this.venueId = venueId;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venue_id' })
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
    name: 'ticketing_date',
    comment: '티켓팅 일시 (ISO 8601)',
  })
  ticketingDate: Date;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @OneToMany(() => Session, (session) => session.performance)
  sessions: Session[];
}
