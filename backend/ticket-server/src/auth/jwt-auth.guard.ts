import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // @Public() 데코레이터가 있는지 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Public 라우트는 토큰 검증 건너뛰기
    if (isPublic) {
      return true;
    }

    // JWT Strategy의 validate 메서드를 호출
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 토큰이 없거나 검증 실패 시
    if (err || !user) {
      if ((info as { name?: string })?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Active token has expired');
      }
      if ((info as { name?: string })?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid active token');
      }
      throw err || new UnauthorizedException('Active token is required');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
