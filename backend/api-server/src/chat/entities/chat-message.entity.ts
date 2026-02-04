import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserNickname } from './user-nickname.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'user_id',
    comment: '메시지를 보낸 사용자 UUID',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'message',
    comment: '채팅 메시지 내용',
  })
  message: string;

  @CreateDateColumn({
    type: 'datetime',
    name: 'timestamp',
    comment: '메시지 전송일시',
  })
  timestamp: Date;

  @ManyToOne(() => UserNickname, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: UserNickname;
}
