import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReservationRequestDto {
  @ApiProperty({ description: '공연 회차 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  session_id: number;

  @ApiProperty({ description: '공연장 구역 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  block_id: number;

  @ApiProperty({ description: '좌석 행 번호', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  row: number;

  @ApiProperty({ description: '좌석 열 번호', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  col: number;
}
