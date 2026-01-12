### 🧭 Summary

- MSA 환경에서의 모노레포 아키텍처로 프로젝트 구조 전면 개편
- pnpm workspace를 활용한 통합 의존성 관리 체계 구축
- 백엔드 서버를 API 서버와 티켓 서버로 분리하여 MSA 구조 적용

### 🔗 Linked Issue

- [ ] #(이슈 번호)

Closes: #(이슈 번호)

### 🛠 개발 기능(작업 내용)

#### 1. 모노레포 아키텍처 구성
- 루트에 `pnpm-workspace.yaml` 생성하여 전역 workspace 관리
- 모든 서브 프로젝트의 의존성을 하나의 `pnpm-lock.yaml`로 통합 관리
- 중복되던 각 디렉토리의 `pnpm-lock.yaml`, `pnpm-workspace.yaml` 제거

#### 2. Backend MSA 구조 분리
- **기존**: 단일 backend 디렉토리
- **변경**: `backend/api-server` (일반 API), `backend/ticket-server` (티켓 예매 전용)로 분리
- 각 서버는 독립적인 NestJS 애플리케이션으로 구성
- 향후 서버 간 독립적인 스케일링 및 배포 가능

#### 3. 공유 패키지 시스템 구축
- `packages/shared-types` 패키지 생성
- 공통 타입 정의: `booking.ts`, `queue.ts`, `events.ts`
- 각 서버에서 `@beastcamp/shared-types`로 import하여 타입 일관성 보장

#### 4. 루트 Package.json 통합 스크립트
```json
{
  "dev:api": "pnpm --filter @beastcamp/api-server start:dev",
  "dev:ticket": "pnpm --filter @beastcamp/ticket-server start:dev",
  "build:api", "build:ticket", "lint:*" 등 추가
}
```

#### 5. README 문서화
- 프로젝트 구조 다이어그램 추가
- 패키지 설치 및 실행 방법 상세 기술
- 각 서버별 개발/빌드/린트 명령어 가이드
- 공유 타입 패키지 사용법 예시

### 🧩 주요 고민과 해결 방법

#### 1. 모노레포 vs 멀티레포
**고민**: MSA 환경에서 각 서버를 별도 레포로 분리할지, 모노레포로 관리할지 결정 필요

**해결**:
- 초기 단계에서는 코드 공유 및 통합 관리의 이점이 더 크다고 판단
- pnpm workspace를 활용하여 각 서버의 독립성을 유지하면서도 공통 타입 등을 효율적으로 공유
- 향후 필요시 각 서버를 별도 레포로 분리 가능한 구조 유지

#### 2. 공통 타입 관리 전략
**고민**: 서버 간 공유되는 DTO, 이벤트 타입을 어떻게 관리할 것인가

**해결**:
- `packages/shared-types`를 별도 패키지로 분리
- workspace 프로토콜(`workspace:*`)을 활용하여 각 서버에서 참조
- 타입 변경 시 한 곳에서만 수정하면 모든 서버에 자동 반영

#### 3. 기존 코드 마이그레이션
**고민**: 기존 backend 코드를 api-server와 ticket-server로 어떻게 분리할 것인가

**해결**:
- 초기 단계에서는 동일한 코드를 양쪽에 복사하여 기본 구조 구축
- 각 서버는 독립적으로 발전할 수 있는 기반 마련
- 향후 각 서버의 역할에 맞게 코드 분리 및 특화 예정

### 🔍 리뷰 포인트

1. **pnpm-workspace.yaml 구성**
   - workspace 패턴이 올바르게 설정되었는지 확인
   - `backend/*` 패턴으로 향후 추가 서버도 자동 포함되도록 구성

2. **package.json 스크립트**
   - 각 서버별 dev/build/lint 스크립트가 정상 작동하는지 검증 필요
   - `pnpm --filter` 문법이 올바른지 확인

3. **shared-types 패키지**
   - 타입 정의가 실제 도메인 요구사항을 반영하는지 검토
   - 각 서버에서 import 시 정상 작동하는지 테스트 필요

4. **README 문서**
   - 신규 팀원이 README만 보고 프로젝트를 시작할 수 있는지 확인
   - 누락된 설명이나 개선이 필요한 부분 제안

5. **마이그레이션 누락**
   - 기존 backend에서 새로운 구조로 이동 시 누락된 파일이나 설정이 없는지 확인

<br>

---

### 📋 Code Review Priority Guideline

- 🚨 **P1: Request Change**
  - **필수 반영**: 꼭 반영해주시고, 적극적으로 고려해주세요 (수용 혹은 토론).
- 💬 **P2: Comment**
  - **권장 반영**: 웬만하면 반영해주세요.
- 👍 **P3: Approve**
  - **선택 반영**: 반영해도 좋고 넘어가도 좋습니다. 그냥 사소한 의견입니다.
