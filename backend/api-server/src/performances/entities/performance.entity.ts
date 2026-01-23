import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Session } from './session.entity';

@Entity('performances')
export class Performance {
  constructor(
    performanceName?: string,
    ticketingDate?: Date,
    platform?: 'interpark' | 'yes24' | 'melon-ticket',
  ) {
    if (performanceName) this.performanceName = performanceName;
    if (ticketingDate) this.ticketingDate = ticketingDate;
    if (platform) this.platform = platform;
  }

  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
    type: 'varchar',
    length: 20,
    name: 'platform',
    comment: '티켓팅 플랫폼 (interpark, yes24, melon-ticket)',
    default: 'interpark',
  })
  platform: 'interpark' | 'yes24' | 'melon-ticket';

  @OneToMany(() => Session, (session) => session.performance)
  sessions: Session[];
}
