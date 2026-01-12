# 팀 맹수

## 팀원 소개

<table>
  <!-- 사진 + 영어이름 -->
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/de6d9fe8-09df-4320-a688-4bdb42ac0470" width="120"><br>
      <b>Jerry</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/9a4c1b24-6dba-4146-925d-1ca42fc9e148" width="120"><br>
      <b>Parrot</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/eee30aa1-ecf8-46c8-8591-dc65ab354287" width="120"><br>
      <b>Happy</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/ac219718-515d-4183-b938-9eab324dfd28" width="120"><br>
      <b>Jude</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/0d5ac7dc-6fb4-4c1a-b9a4-057f09bcf186" width="120"><br>
      <b>Chad</b>
    </td>
  </tr>

  <!-- 캠퍼 ID (sub 전용 행) -->
  <tr>
    <td align="center"><a href="https://github.com/viixix">J285_함형민</a></td>
    <td align="center"><a href="https://github.com/flowersayo">J042_김서연</a></td>
    <td align="center"><a href="https://github.com/ParkTjgus">J110_박서현</a></td>
    <td align="center"><a href="https://github.com/JichanPark12">J124_박지찬</a></td>
    <td align="center"><a href="https://github.com/shininghyunho">J277_최현호</a></td>
  </tr>
</table>

---

## 프로젝트 구조

본 프로젝트는 MSA 환경에서의 모노레포 아키텍처로 구성되어 있습니다.

```
ticketing-system/
├── pnpm-workspace.yaml          # 모노레포 workspace 설정
├── package.json                 # 루트 package.json (모노레포 스크립트)
├── pnpm-lock.yaml              # 전역 lock file
│
├── frontend/                    # 프론트엔드 (Next.js)
│   ├── src/
│   └── package.json
│
├── backend/                     # 백엔드 서버들
│   ├── api-server/             # 일반 API 서버
│   │   ├── src/
│   │   └── package.json
│   │
│   └── ticket-server/          # 티켓 예매 전용 서버
│       ├── src/
│       └── package.json
│
├── queue-backend/              # 대기열 큐 서버
│   ├── src/
│   └── package.json
│
└── packages/                   # 공유 패키지
    └── shared-types/           # 공통 타입 정의
        ├── src/
        │   ├── booking.ts
        │   ├── queue.ts
        │   └── events.ts
        └── package.json
```

---

## 시작하기

### 1. 패키지 설치

프로젝트 루트에서 다음 명령어를 실행하여 모든 workspace의 의존성을 설치합니다.

```bash
pnpm install
```

모노레포 구조이므로 루트에서 한 번만 실행하면 모든 하위 프로젝트의 의존성이 자동으로 설치됩니다.

### 2. 개발 서버 실행

각 서버를 개별적으로 실행할 수 있습니다.

```bash
# API 서버 실행
pnpm dev:api

# 티켓 서버 실행
pnpm dev:ticket

# 대기열 큐 서버 실행
pnpm dev:queue

# 프론트엔드 실행
pnpm dev:frontend
```

### 3. 빌드

```bash
# API 서버 빌드
pnpm build:api

# 티켓 서버 빌드
pnpm build:ticket

# 대기열 큐 서버 빌드
pnpm build:queue

# 프론트엔드 빌드
pnpm build:frontend
```

### 4. 린트 실행

```bash
# API 서버 린트
pnpm lint:api

# 티켓 서버 린트
pnpm lint:ticket

# 대기열 큐 서버 린트
pnpm lint:queue

# 프론트엔드 린트
pnpm lint:frontend
```

---

## 패키지 설치 방법

### 특정 workspace에 패키지 설치

`--filter` 옵션을 사용하여 특정 workspace에만 패키지를 설치할 수 있습니다.

```bash
# API 서버에 패키지 설치
pnpm add express --filter @beastcamp/api-server

# 티켓 서버에 dev dependency 설치
pnpm add -D jest --filter @beastcamp/ticket-server

# 프론트엔드에 설치
pnpm add react-query --filter frontend

# 대기열 큐 서버에 설치
pnpm add bull --filter queue-backend

# shared-types에 설치
pnpm add -D @types/node --filter @beastcamp/shared-types
```

### 루트에 공통 dependency 설치

모든 workspace에서 공통으로 사용하는 패키지는 루트에 설치합니다.

```bash
# -w 또는 --workspace-root 옵션 필요
pnpm add -w typescript
pnpm add -D -w prettier
```

### 여러 workspace에 동시 설치

```bash
# 패턴 매칭으로 backend 하위 모든 프로젝트에 설치
pnpm add lodash --filter "./backend/*"
```

### 해당 디렉토리에서 직접 설치

```bash
# 디렉토리로 이동 후 설치
cd backend/api-server
pnpm add express
```

### 배포 시 특정 서비스만 설치

프로덕션 배포 시 특정 workspace의 의존성만 설치할 수 있습니다.

```bash
# API 서버의 프로덕션 의존성만 설치
pnpm install --filter @beastcamp/api-server --prod

# 해당 패키지와 의존 관계에 있는 workspace도 함께 설치
pnpm install --filter @beastcamp/api-server...
```

---

## 공유 타입 패키지 사용하기

각 서버에서 공통 타입을 사용하려면 다음과 같이 import합니다.

```typescript
import { BookingRequest, QueueToken } from '@beastcamp/shared-types';
```

---

---

## 기술 스택

- **Frontend**: Next.js
- **Backend**: NestJS
- **Package Manager**: pnpm (모노레포)
- **Language**: TypeScript
- **Container**: Docker + Nginx
