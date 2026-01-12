## Docker를 이용한 배포

### 프론트엔드 Docker 빌드 및 실행

프로젝트 루트에서 다음 명령어를 실행합니다.

```bash
# 1. Docker 이미지 빌드 (프로젝트 루트에서 실행)
docker build -f frontend/Dockerfile -t beastcamp-frontend .

# 2. 컨테이너 실행
docker run -d -p 80:80 --name frontend beastcamp-frontend

# 3. 브라우저에서 확인
# http://localhost 접속
```

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

### 프로덕션 배포 최적화

Dockerfile은 3단계 멀티 스테이지 빌드로 구성되어 있습니다:

1. **deps**: pnpm을 사용하여 필요한 의존성만 설치
2. **builder**: Vite로 프로덕션 빌드 수행
3. **production**: Nginx로 정적 파일 서빙 (최종 이미지 크기 최소화)
