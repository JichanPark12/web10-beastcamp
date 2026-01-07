import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';

@Entity('seats')
@Unique('uk_venue_seat_location', ['venueId', 'seatLocation'])
export class Seat {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'venue_id' })
  venueId: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'seat_location',
    comment: '좌석위치',
  })
  seatLocation: string;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;
}
