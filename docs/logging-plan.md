# 로그 중앙화 및 모니터링 구축 계획 (Logging Plan)

## 1. 개요 (Overview)

본 문서는 분산된 물리 서버 환경에서 운영 중인 NestJS 마이크로서비스들의 로그를 중앙에서 실시간으로 수집, 저장, 시각화하기 위한 구축 계획서이다. 운영자는 이 시스템을 통해 서버 접속 없이 웹 대시보드(Grafana)에서 비즈니스 로직의 정상 동작 여부(티켓팅 오픈, 예약 유입 등)를 즉시 확인할 수 있다.

### 핵심 목표
1.  **로그 표준화:** 모든 서버의 로그를 기계 가독성이 높은 JSON 포맷으로 통일한다.
2.  **중앙 집중화:** 물리적으로 분리된 서버의 로그를 별도의 모니터링 서버(물리 서버 3)로 전송한다.
3.  **실시간성:** 발생한 로그를 수 초 이내에 Grafana에서 검색 및 조회(Tail)할 수 있어야 한다.

---

## 2. 인프라 아키텍처 (Architecture)



### 2.1. 물리 서버 구성도



시스템은 로그를 생성하는 **애플리케이션 서버**와 이를 수집/시각화하는 **모니터링 서버**로 물리적으로 완전히 분리된다.

| 구분 | 서버 명칭 | 실행 서비스 (Container) | 역할 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| **Source** | **Queue-instance** | `queue-backend`<br>`promtail` | 대기열 처리 | 로그 생성 및 전송 |
| **Source** | **Backend-instance** | `api-server`<br>`ticket-server`<br>`promtail` | 비즈니스 로직 | 로그 생성 및 전송 |
| **Dest** | **Monitoring-instance** | `loki`<br>`grafana` | **로그 저장소** | **신규 구축** |


### 2.2. 데이터 흐름 (Data Flow)



1.  **Log Generation:** 각 NestJS 앱이 `stdout`으로 **JSON 로그** 출력.

2.  **Log Collection:** 각 서버의 `Promtail`이 Docker API (`/var/run/docker.sock`)를 통해 실시간으로 로그 수집.

3.  **Log Shipping:** Promtail이 읽은 로그를 **Monitoring-instance**의 `Loki (Port 3100)`로 HTTP Push.

4.  **Visualization:** 관리자가 **기존 운영 서버 Nginx**를 경유하여 **Monitoring-instance**의 `Grafana` 웹에 접속하여 Loki 데이터를 조회.



---



## 3. 상세 구현 단계 (Implementation Steps)



### Step 1: 애플리케이션 로그 포맷 변경 (Application Layer)



모든 NestJS 애플리케이션의 로거를 `winston` 기반의 JSON 포맷으로 교체한다. 이를 위해 **공통 패키지(`packages/backend-config`)**에 로거 설정을 정의하고, 각 서버가 이를 재사용하도록 구성한다.



#### 1.1. 공통 로거 설정 (packages/backend-config)

*   **패키지 설치:** `packages/backend-config`에서 `pnpm add winston nest-winston` 실행.

*   **설정 파일 생성:** `src/logger.config.ts` 파일 작성.

    *   `getWinstonLogger(serviceName: string)` 함수 구현.

    *   **Format:** `timestamp` + `ms` + `label(serviceName)` + `json` 조합.

    *   **Transports:** `Console` (운영 환경: `info`, 개발 환경: `debug`).

*   **Export:** `src/index.ts`에서 `getWinstonLogger` 함수 export.

*   **빌드:** `pnpm build` 실행.



#### 1.2. 각 서버에 로거 적용

*   **대상:**

    *   `backend/api-server`

    *   `backend/ticket-server`

    *   `queue-backend`

*   **작업 내용:**

    1.  패키지 설치: 각 프로젝트에서 `pnpm add nest-winston winston` (타입 의존성 해결 및 런타임 필요).

    2.  `main.ts` 수정:

        ```typescript

        import { getWinstonLogger } from '@beastcamp/backend-config';



        // ... bootstrap 함수 내부

        const app = await NestFactory.create(AppModule, {

          logger: getWinstonLogger('api-server'), // 각 서버 이름 주입

        });

        ```

*   **기대 결과:**

    *   `docker logs [container_id]` 실행 시 다음과 같은 JSON 로그가 출력되어야 함.

    ```json

    {"context":"RoutesResolver","level":"info","message":"AppController {/api}:","service":"api-server","timestamp":"2026-02-02T13:00:00.000Z","ms":"+1ms"}

    ```



### Step 2: 모니터링 서버 구축 (Monitoring-instance)



로그를 받아줄 중앙 서버를 먼저 세팅한다.



*   **디렉토리:** `monitoring/` (루트)

*   **파일 구성:**

    *   `docker-compose.yml`: Loki, Grafana 컨테이너 정의 (포트 3004:3004).

    *   `loki/loki-config.yaml`: Loki 저장소 설정 (Retention: 336h, Legacy 허용).

    *   `grafana/provisioning/datasources/datasources.yaml`: Loki를 기본 데이터 소스로 등록.

*   **Loki 핵심 설정:**

    *   `reject_old_samples: false` (필수): 과거 로그 수집 허용.

    *   `retention_period: 336h` (14일 보관).



### Step 3: 로그 수집 에이전트 설치 (Queue/Backend-instance)



기존 운영 서버에 로그 수집기(Sidecar)를 배치한다.



*   **작업 내용:**

    1.  각 서버의 `docker-compose.yml`에 `promtail` 서비스 추가.

    2.  `promtail-config.yaml` 파일 생성.

    3.  **중요 설정:**

        *   `user: root`: Docker Socket 접근 권한 확보.

        *   `clients.url`: `${LOKI_URL}` (환경변수 사용).

        *   `docker_sd_configs`: Docker API (`unix:///var/run/docker.sock`) 사용.

        *   `relabel_configs`: `host` 라벨을 각 서버 별칭(`backend-instance`, `queue-instance`)으로 고정.

        *   `pipeline_stages`: JSON 파싱 및 타임스탬프 동기화.



### Step 4: 외부 접근 및 시각화 설정



*   **도메인 연결:** `monitor.web10.site` (예시) -> 기존 운영 서버(Nginx 보유) IP

*   **Nginx 설정 (기존 운영 서버):**

    *   `monitor.web10.site` 요청 수신.

    *   `proxy_pass http://[Monitoring-instance_IP]:3004` (Grafana) 설정.



---



## 4. 환경 변수 설정 가이드 (Environment Variables)

보안 및 관리 편의성을 위해 `LOKI_URL`은 **GitHub Repository Secrets**로 관리하며, 배포 파이프라인(CD) 실행 시 자동으로 주입된다.

### 4.1. GitHub Secrets 설정

*   **위치:** GitHub Repository > Settings > Secrets and variables > Actions
*   **Key:** `LOKI_URL`
*   **Value:** `http://[MONITORING_INSTANCE_IP]:3100/loki/api/v1/push`
    *   *주의: 반드시 `http://` 프로토콜을 포함해야 한다.*

### 4.2. 배포 시 적용 원리

*   GitHub Actions Workflow(`cd-manual-o.yml` 등)가 실행될 때 Secrets에서 값을 읽어와 각 서버의 `.env` 파일에 추가하거나 컨테이너 환경 변수로 주입한다.



---



## 5. 운영 가이드 (Operation Guide)



### 5.1. 로그 조회 방법

1.  **주소:** `http://[MONITORING_INSTANCE_IP]:3004` 접속.

2.  **Explore:** 메뉴 이동 후 데이터 소스 `Loki` 선택.

3.  **쿼리 예시:**

    *   `{host="backend-instance"}`: 물리 서버 2의 모든 로그.

    *   `{container="api-server"}`: 특정 컨테이너 로그.

    *   `{service="ticket-server"} |= "error"`: 특정 서비스의 에러 로그만 필터링.



### 5.2. 실시간 모니터링

*   쿼리 실행 후 우측 상단의 **"Live"** 버튼을 누르면 터미널의 `tail -f` 처럼 실시간 로그 스트리밍이 시작됨.



---



## 6. 주의 사항 (Checklist)



*   [ ] **방화벽:** Monitoring-instance의 3100(Loki), 3004(Grafana) 포트가 닫혀 있으면 통신이 불가능하다.

*   [ ] **Docker 권한:** Promtail 컨테이너는 호스트의 Docker Socket(`/var/run/docker.sock`)을 제어할 수 있는 `root` 권한이 필요하다.

*   [ ] **Loki Retention:** 14일 지난 로그는 자동 삭제되므로, 장기 보관이 필요하면 별도 백업(S3 등) 고려 필요.
