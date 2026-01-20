import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // userId
  type: string; // 'TICKETING'
  iat?: number; // issued at
  exp?: number; // expires at
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret') || 'secret';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: { cookies?: { activeToken?: string } }) => {
          // Cookie에서도 토큰 추출 지원
          return (req?.cookies?.activeToken as string | null) || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    // payload 타입 검증
    if (payload.type !== 'TICKETING') {
      throw new UnauthorizedException('Invalid token type');
    }

    // userId 검증
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // validate 메서드가 반환하는 값이 request.user에 할당됨
    return {
      userId: payload.sub,
      type: payload.type,
    };
  }
}
