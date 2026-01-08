import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'venue_name',
    comment: '공연장 이름',
  })
  venueName: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'seat_img_url',
    comment: 'SVG 이미지 경로',
  })
  seatImgUrl: string | null;
}
