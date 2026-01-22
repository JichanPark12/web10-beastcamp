import { ApiProperty } from '@nestjs/swagger';

class Seat {
  @ApiProperty({ description: '공연장 구역 ID', example: 1 })
  block_id: number;

  @ApiProperty({ description: '좌석 행 번호', example: 1 })
  row: number;

  @ApiProperty({ description: '좌석 열 번호', example: 5 })
  col: number;
}

export class CreateReservationResponseDto {
  @ApiProperty({
    description: '해당 회차에서의 예약 순번 (랭킹)',
    example: 123,
  })
  rank: number;

  @ApiProperty({
    description: '예약된 좌석 목록',
    type: [Seat],
  })
  seats: Seat[];
}
