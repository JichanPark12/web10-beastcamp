import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import type { Request, Response } from 'express';

type MockedQueueService = {
  createQueueEntry: jest.Mock;
};

const createRequest = (cookies?: Record<string, string>): Request =>
  ({ cookies }) as unknown as Request;

const createResponse = () => {
  const cookie = jest.fn();
  return {
    response: { cookie } as unknown as Response,
    cookie,
  };
};

describe('QueueController', () => {
  let controller: QueueController;
  let queueService: MockedQueueService;

  beforeEach(async () => {
    queueService = {
      createQueueEntry: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: QueueService,
          useValue: queueService,
        },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
  });

  it('포지션이 있을 때 서비스 결과를 반환하고 쿠키를 설정한다', async () => {
    const { response, cookie } = createResponse();
    queueService.createQueueEntry.mockResolvedValue({
      userId: 'abc',
      position: 1,
    });

    const result = await controller.join(createRequest(), response);

    expect(queueService.createQueueEntry).toHaveBeenCalledWith(undefined);
    expect(cookie).toHaveBeenCalledWith('waiting-token', 'abc', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });
    expect(result).toEqual({ userId: 'abc', position: 1 });
  });

  it('포지션이 null이면 쿠키를 설정하지 않는다', async () => {
    const { response, cookie } = createResponse();
    queueService.createQueueEntry.mockResolvedValue({
      userId: 'abc',
      position: null,
    });

    const result = await controller.join(createRequest(), response);

    expect(cookie).not.toHaveBeenCalled();
    expect(result.position).toBeNull();
  });

  it('쿠키에 있는 토큰을 서비스로 전달한다', async () => {
    const { response } = createResponse();
    const request = createRequest({ 'waiting-token': 'token-123' });
    queueService.createQueueEntry.mockResolvedValue({
      userId: 'token-123',
      position: 2,
    });

    await controller.join(request, response);

    expect(queueService.createQueueEntry).toHaveBeenCalledWith('token-123');
  });
});
