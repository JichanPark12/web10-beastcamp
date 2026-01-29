import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Session } from './session.entity';

@Entity('performances')
export class Performance {
  constructor(
    performanceName?: string,
    ticketingDate?: Date,
    platform?: 'nol-ticket' | 'yes24' | 'melon-ticket' | 'interpark',
    posterUrl?: string,
  ) {
    if (performanceName) this.performanceName = performanceName;
    if (ticketingDate) this.ticketingDate = ticketingDate;
    if (platform) this.platform = platform;
    if (posterUrl) this.posterUrl = posterUrl;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'kopis_id',
    nullable: true,
    unique: true,
    comment: 'KOPIS API 공연 ID (mt20id)',
  })
  kopisId: string | null;

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
    length: 500,
    name: 'poster_url',
    nullable: true,
    comment: '포스터 이미지 URL',
  })
  posterUrl: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'platform',
    comment: '티켓팅 플랫폼 (nol-ticket, yes24, melon-ticket, interpark)',
    default: 'nol-ticket',
  })
  platform: 'nol-ticket' | 'yes24' | 'melon-ticket' | 'interpark';

  @OneToMany(() => Session, (session) => session.performance)
  sessions: Session[];
}
