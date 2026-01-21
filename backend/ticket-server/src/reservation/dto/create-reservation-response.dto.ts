import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationResponseDto {
  @ApiProperty({
    description: '해당 회차에서의 예약 순번 (랭킹)',
    example: 123,
  })
  rank: number;
}
