import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterNicknameDto {
  @ApiProperty({
    description: '사용자 닉네임',
    example: '티켓팅마스터',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;
}
