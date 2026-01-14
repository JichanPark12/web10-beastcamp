# CI/CD 파이프라인 가이드

## 개요

이 프로젝트는 pnpm 모노레포 기반의 MSA(Microservices Architecture) 구조로, 변경된 서비스만 선택적으로 빌드하고 배포하는 효율적인 CI/CD 파이프라인을 구축했습니다.

## 핵심 원칙

1. **서비스 단위 배포** - 레포지토리 전체가 아닌 개별 서비스 단위로 배포
2. **변경된 서비스만 CI/CD 실행** - 불필요한 리소스 낭비 방지
3. **공통 패키지 변경 시 의존 서비스 자동 재배포** - 의존성 그래프 기반 배포
   B

## 프로젝트 구조

```
web10-beastcamp/
├── frontend/                    # Next.js 프론트엔드
│   └── Dockerfile
├── backend/
│   ├── api-server/             # API 서버 (NestJS)
│   │   └── Dockerfile
│   └── ticket-server/          # 티켓 서버 (NestJS)
│       └── Dockerfile
├── queue-backend/              # 큐 백엔드 (NestJS)
│   └── Dockerfile
├── packages/
│   ├── shared-types/           # 공통 타입 정의
│   ├── backend-config/         # 백엔드 공통 설정
│   └── shared-constants/       # 공통 상수
└── .github/
    ├── workflows/
    │   ├── ci.yml              # CI 워크플로우 (PR)
    │   └── cd.yml              # CD 워크플로우 (main merge)
    └── scripts/
        └── detect-changes.sh   # 변경 감지 스크립트
```

## CI/CD 워크플로우

### 1. CI 워크플로우 (Pull Request)

**트리거:** PR 생성 또는 업데이트 (→ main, develop)

**동작 과정:**

1. **변경 감지**

   - `detect-changes.sh` 스크립트 실행
   - main 브랜치와 비교하여 변경된 파일 분석
   - 영향받는 서비스 목록 생성

2. **병렬 CI 실행**

   - 변경된 서비스만 선택적으로 CI 작업 실행
   - 각 서비스별로 독립적인 Job 실행:
     - Lint 검사
     - 단위 테스트
     - 빌드 테스트

3. **CI 결과 요약**
   - 모든 CI 작업 결과 취합
   - 실패 시 PR 머지 차단

### 2. CD 워크플로우 (Main Branch)

**트리거:** main 브랜치로의 push (merge 완료)

**동작 과정:**

1. **변경 감지**

   - 이전 커밋과 비교하여 변경된 서비스 감지

2. **배포 서버 접속 및 배포**

   - GitHub Actions Runner가 SSH로 배포 서버에 접속
   - 배포 서버에서 직접 `git pull`로 최신 코드 가져오기
   - 변경된 서비스만 `docker-compose build` 및 `docker-compose up -d` 실행
   - 이전 이미지 정리 (`docker image prune`)

3. **배포 결과 요약**
   - 모든 배포 작업 결과 취합
   - 실패 시 알림

**장점:**

- 이미지 레지스트리 불필요 (GHCR, ECR 등)
- 설정이 간단하고 직관적
- 배포 서버에서 직접 빌드하여 환경 일관성 보장

## 변경 감지 로직

### 직접 변경 감지

파일 경로를 기반으로 서비스 변경을 감지합니다:

- `frontend/**` → frontend 배포
- `backend/api-server/**` → api-server 배포
- `backend/ticket-server/**` → ticket-server 배포
- `queue-backend/**` → queue-backend 배포

### 의존성 기반 변경 감지

공통 패키지 변경 시 의존하는 서비스를 자동으로 재배포합니다:

- `packages/shared-types/**` 변경

  - → api-server 재배포
  - → ticket-server 재배포

- `packages/backend-config/**` 변경

  - → queue-backend 재배포

- `packages/shared-constants/**` 변경
  - → queue-backend 재배포

### pnpm filter 활용

```bash
# 변경된 워크스페이스만 빌드
pnpm -r --filter "[origin/main...HEAD]" build

# 특정 서비스와 의존성만 빌드
pnpm --filter @beastcamp/api-server... build
```

## Docker 빌드 전략

### 멀티 스테이지 빌드

모든 서비스는 3단계 멀티 스테이지 빌드를 사용합니다:

1. **deps stage**: 의존성 설치

   - pnpm workspace 구조 유지
   - frozen-lockfile로 정확한 의존성 관리

2. **builder stage**: 애플리케이션 빌드

   - 소스 코드 복사 및 빌드
   - 공통 패키지 포함

3. **runner stage**: 프로덕션 실행
   - 최소한의 런타임 파일만 포함
   - 비특권 사용자로 실행 (보안)

### 배포 서버에서 직접 빌드

이 프로젝트는 **이미지 레지스트리 없이** 배포 서버에서 직접 Docker 이미지를 빌드합니다:

- GitHub Actions → SSH → 배포 서버
- 배포 서버에서 `git pull` 후 `docker-compose build`
- 별도의 이미지 레지스트리(GHCR, ECR, Docker Hub) 불필요
- 설정이 간단하고 비용 절감

## 설정 가이드

### 1. 배포 서버 준비

이 프로젝트는 **서비스별로 분리된 서버**에 배포됩니다:

```
프론트엔드 서버 (server1)
└── frontend

백엔드 서버 (server2)
├── api-server
└── ticket-server

큐 서버 (server3)
└── queue-backend
```

**각 서버**에서 다음 환경을 준비하세요:

1. **Docker 및 Docker Compose 설치**

   ```bash
   # Docker 설치
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Docker Compose 설치
   sudo apt-get install docker-compose-plugin
   ```

2. **Git Repository 클론**

   ```bash
   cd /app
   git clone https://github.com/your-org/web10-beastcamp.git
   cd web10-beastcamp
   ```

3. **배포용 사용자 생성 (권장)**
   ```bash
   sudo useradd -m -s /bin/bash deploy
   sudo usermod -aG docker deploy
   ```

### 2. GitHub Secrets 설정

GitHub Repository → Settings → Secrets and variables → Actions에서 다음 시크릿을 추가하세요:

#### 공통 SSH 키

| Secret 이름       | 설명                            | 예시                                     |
| ----------------- | ------------------------------- | ---------------------------------------- |
| `SSH_PRIVATE_KEY` | 모든 서버에서 사용하는 SSH 키 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

#### 서버별 호스트 및 사용자

| Secret 이름            | 설명                   | 예시            |
| ---------------------- | ---------------------- | --------------- |
| `FRONTEND_SERVER_HOST` | 프론트엔드 서버 호스트 | `123.456.78.90` |
| `FRONTEND_SERVER_USER` | 프론트엔드 서버 사용자 | `deploy`        |
| `BACKEND_SERVER_HOST`  | 백엔드 서버 호스트     | `123.456.78.91` |
| `BACKEND_SERVER_USER`  | 백엔드 서버 사용자     | `deploy`        |
| `QUEUE_SERVER_HOST`    | 큐 서버 호스트         | `123.456.78.92` |
| `QUEUE_SERVER_USER`    | 큐 서버 사용자         | `deploy`        |

**총 7개의 Secrets 필요**

#### SSH 키 생성 방법

**한 번만** SSH 키를 생성하고 모든 서버에 공개키를 등록하세요:

```bash
# 1. 로컬 또는 안전한 환경에서 SSH 키 생성
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# 2. 각 배포 서버에 공개키 등록
# 프론트엔드 서버
ssh deploy@FRONTEND_SERVER_HOST 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/github_actions.pub

# 백엔드 서버
ssh deploy@BACKEND_SERVER_HOST 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/github_actions.pub

# 큐 서버
ssh deploy@QUEUE_SERVER_HOST 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/github_actions.pub

# 3. 각 서버에서 권한 설정
ssh deploy@서버주소 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'

# 4. 개인키를 GitHub Secret (SSH_PRIVATE_KEY)에 등록
cat ~/.ssh/github_actions
# 출력된 전체 내용을 복사하여 GitHub Secrets에 등록
```

### 3. Docker Compose 파일 확인

각 서비스 디렉토리에 docker-compose.yml 파일이 이미 생성되어 있습니다:

#### 프론트엔드 ([frontend/docker-compose.yml](../frontend/docker-compose.yml))

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ..
      dockerfile: frontend/Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

#### 백엔드 ([backend/docker-compose.yml](../backend/docker-compose.yml))

```yaml
version: '3.8'

services:
  api-server:
    build:
      context: ..
      dockerfile: backend/api-server/Dockerfile
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  ticket-server:
    build:
      context: ..
      dockerfile: backend/ticket-server/Dockerfile
    ports:
      - '3002:3002'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

#### 큐 서버 ([queue-backend/docker-compose.yml](../queue-backend/docker-compose.yml))

```yaml
version: '3.8'

services:
  queue-backend:
    build:
      context: ..
      dockerfile: queue-backend/Dockerfile
    ports:
      - '3003:3003'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 4. 배포 경로 커스터마이즈

[.github/workflows/cd.yml](.github/workflows/cd.yml)의 배포 경로를 실제 환경에 맞게 수정하세요:

```yaml
# 기본값: cd /app/web10-beastcamp
# 실제 배포 경로로 변경
cd /your/actual/deployment/path
```

## 사용 예시

### 시나리오 1: Frontend만 수정

```bash
# frontend 파일 수정
git add frontend/
git commit -m "feat: 메인 페이지 UI 개선"
git push origin feature/improve-ui

# PR 생성 → CI 실행 (frontend만)
# ✅ CI - Frontend: lint, build
# ⏭️  CI - API Server: skipped
# ⏭️  CI - Ticket Server: skipped
# ⏭️  CI - Queue Backend: skipped

# PR merge → CD 실행 (frontend만)
# 🚀 Deploy - Frontend: SSH → git pull → docker-compose build/up
# ⏭️  Deploy - API Server: skipped
# ⏭️  Deploy - Ticket Server: skipped
# ⏭️  Deploy - Queue Backend: skipped
```

### 시나리오 2: shared-types 수정 (공통 패키지)

```bash
# shared-types 수정
git add packages/shared-types/
git commit -m "feat: 새로운 타입 추가"
git push origin feature/add-types

# PR 생성 → CI 실행 (의존 서비스들만)
# ⏭️  CI - Frontend: skipped
# ✅ CI - API Server: lint, test, build
# ✅ CI - Ticket Server: lint, test, build
# ⏭️  CI - Queue Backend: skipped

# PR merge → CD 실행 (의존 서비스들만)
# ⏭️  Deploy - Frontend: skipped
# 🚀 Deploy - API Server: SSH → git pull → docker-compose build/up
# 🚀 Deploy - Ticket Server: SSH → git pull → docker-compose build/up
# ⏭️  Deploy - Queue Backend: skipped
```

### 시나리오 3: 여러 서비스 동시 수정

```bash
# 여러 서비스 수정
git add frontend/ backend/api-server/
git commit -m "feat: 사용자 인증 기능 추가"
git push origin feature/auth

# PR 생성 → CI 실행 (병렬)
# ✅ CI - Frontend: lint, build
# ✅ CI - API Server: lint, test, build
# ⏭️  CI - Ticket Server: skipped
# ⏭️  CI - Queue Backend: skipped

# PR merge → CD 실행 (병렬)
# 🚀 Deploy - Frontend: SSH → git pull → docker-compose build/up
# 🚀 Deploy - API Server: SSH → git pull → docker-compose build/up
# ⏭️  Deploy - Ticket Server: skipped
# ⏭️  Deploy - Queue Backend: skipped
```

## 트러블슈팅

### 변경이 없는데 CI/CD가 실행됨

**원인:** git history가 깊지 않거나 base branch 비교 오류

**해결:**

```yaml
# .github/workflows/ci.yml 또는 cd.yml에서
- uses: actions/checkout@v4
  with:
    fetch-depth: 0 # 전체 히스토리 가져오기
```

### Docker 빌드 실패

**원인:** pnpm workspace 의존성 해결 실패

**해결:**

1. Dockerfile에서 workspace 파일들이 올바르게 복사되는지 확인
2. `pnpm install --frozen-lockfile` 사용 확인
3. 로컬에서 Docker 빌드 테스트:
   ```bash
   docker build -f frontend/Dockerfile -t test:latest .
   ```

### 공통 패키지 변경이 감지되지 않음

**원인:** `detect-changes.sh` 스크립트의 패키지 경로 오류

**해결:**

1. 스크립트 디버그:
   ```bash
   .github/scripts/detect-changes.sh origin/main
   ```
2. 패키지 경로가 정확한지 확인
3. 의존성 매핑이 올바른지 확인

### SSH 접속 실패

**원인:** SSH 키 설정 또는 권한 문제

**해결:**

1. GitHub Secrets에 SSH 키가 올바르게 등록되었는지 확인
2. 배포 서버에서 SSH 접속 테스트:
   ```bash
   ssh -i ~/.ssh/github_actions deploy@your-server
   ```
3. known_hosts 문제 시 배포 서버 재시작 후 재시도

### Docker Compose 빌드 실패

**원인:** docker-compose.yml 파일이 없거나 경로 오류

**해결:**

1. 프로젝트 루트에 docker-compose.yml 파일이 있는지 확인
2. Dockerfile 경로가 올바른지 확인
3. 배포 서버에서 수동 테스트:
   ```bash
   cd /app/web10-beastcamp
   docker-compose build frontend
   ```

## 장단점

### 장점 ✅

- **빠른 CI/CD**: 변경된 서비스만 처리하여 시간 절약
- **리소스 효율**: 불필요한 빌드/배포 방지
- **명확한 영향 범위**: 어떤 서비스가 배포되는지 명확
- **안전한 배포**: 의존성 변경 시 자동으로 연관 서비스 재배포
- **간단한 설정**: 이미지 레지스트리 없이 SSH로 직접 배포
- **비용 절감**: 외부 레지스트리 비용 불필요

### 단점 / 고려사항 ⚠️

- **초기 설정 복잡도**: CI/CD 파이프라인 구성에 학습 필요
- **변경 감지 로직 유지보수**: 서비스 추가/변경 시 스크립트 업데이트 필요
- **팀 학습 곡선**: pnpm workspace와 모노레포 개념 이해 필요
- **의존성 관리**: 공통 패키지의 breaking change 관리 중요

## 참고 자료

- [pnpm Workspace](https://pnpm.io/workspaces)
- [pnpm Filtering](https://pnpm.io/filtering)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 기여

CI/CD 파이프라인 개선 제안이 있다면 Issue를 생성하거나 PR을 제출해주세요.
