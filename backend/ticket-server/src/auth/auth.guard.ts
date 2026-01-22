import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // TODO: Jerry에게 설명을 들은 후 실제 토큰 검증 로직(JWT + Redis Active Queue)을 구현해야 함.
    // 현재는 시뮬레이션을 위해 무조건 통과 처리.
    return true;
  }
}
