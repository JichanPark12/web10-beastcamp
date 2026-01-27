import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import Redis from 'ioredis';

@Injectable()
export class VirtualUserInjector {
  private readonly logger = new Logger(VirtualUserInjector.name);

  constructor(@Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis) {}

  async injectVirtualUsers(): Promise<void> {
    await Promise.resolve();
    // TODO: 실제 유저 트래픽 대비 가상 유저 주입 알고리즘 적용
    // - 목표 비율/유입률을 계산한다
    // - 필요한 가상 유저 수를 산출한다
    // - WAITING_QUEUE에만 ZADD로 주입한다
    // - HEARTBEAT_QUEUE에는 넣지 않는다
    // 이 메서드는 아직 구현되지 않았음.
    void this.redis; // 사용될 예정인 의존성 placeholder
    void REDIS_KEYS.WAITING_QUEUE;
    this.logger.debug('가상 유저 주입 로직은 아직 미구현 상태입니다.');
  }
}
