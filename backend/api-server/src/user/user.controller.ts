import { Controller, Get, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { GetNicknameResponseDto } from './dto/get-nickname-response.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('nickname')
  @ApiOperation({ summary: '사용자 닉네임 조회 (IP 기반)' })
  @ApiResponse({
    status: 200,
    description: '닉네임 조회 성공',
    type: GetNicknameResponseDto,
  })
  async getNickname(@Ip() ip: string): Promise<GetNicknameResponseDto> {
    const nickname = await this.userService.getNicknameByIp(ip);
    return { nickname };
  }
}
