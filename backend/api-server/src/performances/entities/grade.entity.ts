import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Session } from './session.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @ManyToOne(() => Session, (session) => session.grades)
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
