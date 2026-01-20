import {
  Controller,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Post,
  Get,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QueueService, type QueueStatus } from './queue.service';
import type { Request, Response } from 'express';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('entries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '대기열 등록 및 토큰 발급',
    description:
      "발급된 'waiting-token'이 있으면 기존 대기 정보를 유지하고, 없으면 새로운 식별자를 생성하여 대기열에 진입시킵니다.",
  })
  @ApiCookieAuth('waiting-token')
  @ApiCreatedResponse({
    description: '대기열 진입 및 등록 결과',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'uGxk5wTQ5VQw9Hqz' },
        position: { type: 'number', nullable: true, example: 1 },
      },
      required: ['userId', 'position'],
    },
  })
  async join(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const existingToken = req.cookies?.['waiting-token'] as string;
    const result = await this.queueService.createQueueEntry(existingToken);

    if (result.position) {
      res.cookie('waiting-token', result.userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
      });
    }

    return {
      userId: result.userId,
      position: result.position,
    };
  }

  @Get('entries/me')
  @ApiOperation({
    summary: '내 대기 순번 확인',
    description:
      '쿠키의 토큰을 읽고 현재 대기열에서의 실시간 순번을 반환합니다. 토큰이 없으면 null을 반환합니다.',
  })
  @ApiCookieAuth('waiting-token')
  @ApiResponse({
    status: 200,
    description: '순번 조회 성공',
    schema: {
      type: 'object',
      properties: {
        position: { type: 'number', nullable: true, example: 5 },
      },
    },
  })
  async getMyPosition(@Req() req: Request): Promise<QueueStatus> {
    const userId = req.cookies?.['waiting-token'] as string;
    const queueStatus = await this.queueService.getQueuePosition(userId);
    return queueStatus;
  }
}
