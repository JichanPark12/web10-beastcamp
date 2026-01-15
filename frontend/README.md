## Docker를 이용한 배포

### 방법 1: Docker Compose 사용 (로컬 개발)

프론트엔드 디렉토리에서 다음 명령어를 실행합니다.

```bash
# 1. frontend 디렉토리로 이동
cd frontend

# 2. Docker Compose로 빌드 및 실행
docker compose up -d --build

# 3. 브라우저에서 확인
# http://localhost 접속

# 4. 로그 확인
docker compose logs -f

# 5. 중지 및 삭제
docker compose down
```

### 방법 2: Docker 직접 빌드 및 실행 (로컬 개발)

프로젝트 루트에서 다음 명령어를 실행합니다.

```bash
# 1. Docker 이미지 빌드 (프로젝트 루트에서 실행)
docker build -f frontend/Dockerfile -t beastcamp-frontend .

# 2. 컨테이너 실행
docker run -d -p 80:3000 --name frontend beastcamp-frontend

# 3. 브라우저에서 확인
# http://localhost 접속
```

### 방법 3: NCP Container Registry 사용 (프로덕션 배포)

프로덕션 배포는 NCP Container Registry를 사용하여 빌드 시간을 최소화합니다.

```bash
# 1. NCP Container Registry 로그인
docker login <NCP_REGISTRY_URL> -u <USERNAME>

# 2. 최신 이미지 pull
docker pull <NCP_REGISTRY_URL>/beastcamp-frontend:latest

# 3. 기존 컨테이너 중지 및 삭제
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true

# 4. 새 컨테이너 실행
docker run -d \
  --name frontend \
  -p 80:3000 \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://localhost/api \
  -e NEXT_PUBLIC_API_MODE=mock \
  <NCP_REGISTRY_URL>/beastcamp-frontend:latest

# 5. 로그 확인
docker logs -f frontend
```

**참고**: CD 워크플로우가 자동으로 이미지를 빌드하여 NCP Container Registry에 푸시하므로, 프로덕션 서버에서는 빌드 없이 pull만 수행합니다.

### Docker 관리 명령어

```bash
# 컨테이너 상태 확인
docker ps

# 컨테이너 로그 확인
docker logs frontend

# 컨테이너 중지
docker stop frontend

# 컨테이너 재시작
docker restart frontend

# 컨테이너 삭제
docker rm -f frontend

# 이미지 삭제
docker rmi beastcamp-frontend
```

### Docker Compose 관리 명령어

```bash
# 서비스 시작 (백그라운드)
docker compose up -d

# 서비스 중지
docker compose stop

# 서비스 재시작
docker compose restart

# 서비스 중지 및 컨테이너 삭제
docker compose down

# 이미지까지 삭제
docker compose down --rmi all

# 로그 실시간 확인
docker compose logs -f

# 특정 서비스만 재빌드
docker compose up -d --build frontend
```

### 프로덕션 배포 최적화

Dockerfile은 3단계 멀티 스테이지 빌드로 구성되어 있습니다:

1. **deps**: pnpm을 사용하여 필요한 의존성만 설치
2. **builder**: Next.js Standalone 모드로 프로덕션 빌드 수행
3. **production**: Node.js로 최적화된 서버 실행 (최종 이미지 크기 최소화)

### 캐시 없이 빌드 (문제 해결 시)

```bash
# Docker 캐시 클리어 후 빌드
docker build --no-cache -f frontend/Dockerfile -t beastcamp-frontend .

# 또는 Docker Compose 사용 시
docker compose build --no-cache
```
