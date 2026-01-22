# JWT Active Token 검증 시스템

## 개요

대기열 서버(Queue Server)에서 발급한 활성 토큰(Active Token)을 검증하여 티켓 예매 서비스(WAS)에 대한 접근을 제어합니다.

## 아키텍처 흐름

```
1. 사용자 → Queue Server: 대기열 등록
2. Queue Server → 사용자: Active Token 발급 (JWT)
3. 사용자 → Ticket Server: Active Token과 함께 예매 요청
4. Ticket Server: JWT 검증 (이 모듈)
   - 토큰 서명 검증
   - 만료 시간 검증
   - payload 유효성 검증
5. 검증 성공 → 예매 로직 진입
   검증 실패 → 401/403 반환 (DB/Redis 접근 없음)
```

## JWT Payload 구조

```typescript
{
  sub: string;      // userId
  type: 'TICKETING'; // 토큰 타입 (반드시 'TICKETING')
  iat: number;      // issued at (자동 생성)
  exp: number;      // expires at (자동 생성)
}
```

## 사용 방법

### 1. 기본 사용 (Controller에서)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, GetUser, ActiveUser } from './auth';

@Controller('bookings')
export class BookingController {
  @Get()
  @UseGuards(JwtAuthGuard) // 토큰 검증 활성화
  getMyBookings(@GetUser() user: ActiveUser) {
    // user.userId 사용 가능
    return this.bookingService.findByUserId(user.userId);
  }
}
```

### 2. 전역 Guard 설정 (모든 라우트에 적용)

```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

### 3. 특정 라우트만 제외 (Public 데코레이터 사용)

```typescript
// public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// jwt-auth.guard.ts 수정
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

## 환경 변수 설정

```bash
# .env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=5m
```

## 토큰 검증 실패 응답

### 1. 토큰 없음
```json
{
  "statusCode": 401,
  "message": "Active token is required"
}
```

### 2. 토큰 만료
```json
{
  "statusCode": 401,
  "message": "Active token has expired"
}
```

### 3. 토큰 위조/변조
```json
{
  "statusCode": 401,
  "message": "Invalid active token"
}
```

### 4. 잘못된 토큰 타입
```json
{
  "statusCode": 401,
  "message": "Invalid token type"
}
```

### 5. userId 누락
```json
{
  "statusCode": 401,
  "message": "Invalid token payload"
}
```

## 보안 원칙

1. **토큰 검증은 예매 로직 진입 전에 수행됨**
   - DB/Redis 접근 전에 차단
   - 불필요한 리소스 소모 방지

2. **Queue Server만 토큰 발급 권한 보유**
   - Ticket Server는 검증만 수행
   - JWT_SECRET은 공유되지만, 발급 책임은 분리

3. **만료 시간 엄격 관리**
   - 기본 5분 (환경변수로 조정 가능)
   - ignoreExpiration: false (만료 토큰 절대 허용 안함)

## 테스트

```bash
# e2e 테스트 실행
pnpm test:e2e -- auth.e2e-spec.ts
```

테스트 커버리지:
- ✅ 토큰 없음 → 401
- ✅ 잘못된 토큰 → 401
- ✅ 만료된 토큰 → 401
- ✅ 잘못된 타입 → 401
- ✅ userId 누락 → 401
- ✅ 유효한 토큰 → 200

## 파일 구조

```
src/auth/
├── auth.module.ts          # Auth 모듈 정의
├── jwt.strategy.ts         # JWT 검증 전략
├── jwt-auth.guard.ts       # Guard 구현
├── get-user.decorator.ts   # 사용자 정보 추출 데코레이터
├── index.ts                # 모듈 export
└── README.md               # 이 문서
```

## 참고 사항

- Queue Server에서 동일한 JWT_SECRET을 사용하여 토큰 발급
- 토큰은 Authorization Header 또는 Cookie로 전달 가능
  - Header: `Authorization: Bearer <token>`
  - Cookie: `activeToken=<token>` (cookie-parser 필요)
