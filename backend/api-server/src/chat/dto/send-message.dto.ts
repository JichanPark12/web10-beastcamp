import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: '채팅 메시지',
    example: '안녕하세요!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;
}
