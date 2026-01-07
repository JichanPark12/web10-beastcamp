# MSA 환경에서의 모노레포 아키텍처 폴더구조

1️⃣ **일반 백엔드 + 티켓 백엔드** → 같은 서버

2️⃣ **프론트엔드** → 별도 서버

3️⃣ **대기열 큐 서버** → 별도 서버

👉 즉, **총 3개의 “배포 묶음(Server Unit)”**

---

# 📁 전체 프로젝트 구조 (Monorepo)

```
ticketing-system/
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
├── frontend/                 # 서버 2 (WS)
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── docker-compose.yml

├── backend/                  # 서버 1
│   ├── api-server/           # 일반 백엔드
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── ticket-server/        # 티켓 예매 WAS
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── docker-compose.yml    # 서버 1 배포 단위

├── queue-server/             # 서버 3
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── docker-compose.yml
├── packages/                 # 공유 코드
│   ├── shared-types/          # DTO, 이벤트 타입
│   ├── shared-constants/      # Redis key, topic 이름
│   ├── shared-utils/          # 공통 유틸
│   └── shared-config/         # env schema, 공통 설정

├── infra/                        # 인프라 (역할 기준 분리)
│   │
│   ├── redis-queue/              # Queue Redis (서버 3 소유)
│   │   └── docker-compose.yml
│   │
│   ├── redis-ticket/             # Ticket Redis (서버 1 전용)
│   │   └── docker-compose.yml
│   │
│   ├── mysql/                    # Core RDB
│   │   └── docker-compose.yml
│   │
│   └── nginx/
│       └── nginx.conf

```

---

# 🔑 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'apps/backend/*'
  - 'packages/*'
```

👉 **backend 내부도 workspace로 인식**시키는 게 포인트

---

# 🧩 서버별 배포 단위 정리

## 🖥 서버 1 : 일반 백엔드 + 티켓 WAS

```
apps/backend/
├── api-server/
├── ticket-server/
└── docker-compose.yml

```

### docker-compose.yml (서버 1)

```yaml
services:
  api-server:
    build: ./api-server
    ports:
      - '3001:3001'

  ticket-server:
    build: ./ticket-server
    ports:
      - '3002:3002'
```

👉 **같은 서버 / 다른 컨테이너**

👉 장애 분리 + 네트워크 비용 최소화

---

## 🖥 서버 2 : 프론트엔드 (WS)

```
apps/frontend/
├── src/
├── Dockerfile
└── package.json

```

- Next.js
- ISR 혹은 SSR 을 활용하는 런타임 서버

---

## 🖥 서버 3 : 대기열 큐 서버

```
apps/queue-server/
├── src/
│   ├── queue.controller.ts
│   ├── token.service.ts
│   └── redis/
├── Dockerfile
└── package.json

```

- Redis Waiting / Active Queue 관리
- Active Token 발급
- Pub/Sub subscriber

---

# 🧱 shared 패키지 구성 (중요)

### shared-types

```
packages/shared-types/
├── booking.ts
├── queue.ts
└── events.ts   # BOOKING_DONE 등

```

### shared-constants

```
REDIS_WAITING_QUEUE_KEY
REDIS_ACTIVE_QUEUE_KEY
PUBSUB_BOOKING_DONE

```
