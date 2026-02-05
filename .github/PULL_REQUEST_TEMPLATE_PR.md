# PR 제목 예시: feat: 로깅·트레이스 통일 및 가상 유저 로그 샘플링

---

## 🧭 Summary

- **목적**: 서비스 전반 로깅 형식 통일, 트레이스 연동 강화, 가상 유저 로그 과다 방지를 위한 샘플링 도입
- **주요 변경**: `shared-nestjs` 로거/예외필터/트레이스 개선, 각 서버(api-server, ticket-server, queue-backend)에 Trace 연동 및 구조화 로그·가상 유저 로그 샘플링 적용

---

## 🔗 Linked Issue

- [ ] #(이슈 번호)
- [ ] #(이슈 번호)

Closes: #(이슈 번호)

---

## 🛠 개발 기능(작업 내용)

### shared-nestjs

- **로거**: `context`가 string일 때 `className`으로 매핑, object일 때 null 체크 추가
- **GlobalExceptionFilter**: 로그 메시지 형식 정리, 메타데이터에 `ip`, `userId` 등 추가
- **pubsub-context**: `PubSubPayload`에 `isVirtual` 추가 (userId `V_` 접두어로 가상 유저 판별)

### 공통

- api-server, ticket-server, queue-backend의 `main.ts`·`app.module`에서 `@beastcamp/shared-nestjs` 세부 경로 대신 패키지 진입점 import로 통일

### api-server

- **KOPIS**: TraceModule·AxiosTraceInterceptor 적용, 수동/크론 동기화에 `runWithTraceId` 적용, 로그 메시지 한글화 및 메타데이터 객체화
- **seeding**: 로깅 및 에러 처리 형식 정리

### ticket-server

- **TicketConfigService**: 초기화/동기화/시드 로그 추가, 실패 시 에러 재throw
- **ReservationService**: `reserve(..., isVirtual)` 파라미터 추가, 티켓팅 완료 이벤트 발행 로그를 가상 유저 1% 샘플링
- **VirtualUserWorker**: TraceService 연동, 로그 구조화·예약 성공 로그 1% 샘플링
- ticket-scheduler·ticket-setup·performance-api: import 정리 및 스펙 보정

### queue-backend

- transfer/done 처리에 `runWithTraceId` 적용
- PubSub 메시지에서 `isVirtual` 전달, 가상 유저 완료 로그 1% 샘플링
- 에러·일반 로그 메타데이터 객체화 (errorCode, userId 등)
- queue-config·heartbeat·ticketing-state·virtual-user.injector 로깅 형식 통일

---

## 🧩 주요 고민과 해결 방법

| 고민                                                        | 해결 방법                                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 가상 유저 로그가 실제 유저와 동일하게 쌓여 로그 폭증 가능성 | `isVirtual` 플래그를 예약→PubSub→큐 완료 흐름에 타고 내려가게 하고, 가상 유저 관련 로그는 1% 샘플링으로 기록 |
| 로그 포맷이 서비스·파일마다 제각각                          | Nest Logger 호출 시 메시지 + 메타데이터 객체 형태로 통일 (문자열 보간 대신 두 번째 인자로 객체 전달)         |
| 비동기/스케줄/PubSub 구간에서 traceId 누락                  | `runWithTraceId`로 스케줄러·트리거·가상 유저 처리 진입 시 traceId 생성·전파                                  |
| 예외 로그에 요청 맥락 부족                                  | GlobalExceptionFilter에서 `ip`, `userId` 등을 메타데이터로 포함해 에러 분석 시 참고 가능하도록 함            |

---

## 🔍 리뷰 포인트

1. **shared-nestjs**

   - `logger.config.ts`: `context`가 string/object일 때 분기 처리 로직이 기존 사용처와 호환되는지
   - `pubsub-context.ts`: `isVirtual`이 메시지 파싱·핸들러 시그니처 변경에 따라 queue/ticket 호출부에서 일관되게 전달·사용되는지

2. **가상 유저 로그 샘플링**

   - reservation 발행 성공, queue 완료 수신, virtual-user 예약 성공 등에서 1% 샘플링 적용이 의도대로인지 (운영에서 통계용으로 충분한지)

3. **에러 처리**

   - `TicketConfigService`에서 동기화/시드 실패 시 `throw error`로 상위에 전파하는 변경이 기동 실패·재시도 정책과 맞는지

4. **테스트**
   - reservation.service.spec, ticket-scheduler/ticket-setup/virtual-user/queue worker·trigger 스펙에서 mock·assertion이 새 파라미터(`isVirtual`) 및 로깅 변경을 반영했는지

---

_이슈 번호와 PR 제목은 실제 이슈/브랜치에 맞게 수정해 사용하시면 됩니다._
