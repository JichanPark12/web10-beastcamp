# Redis 동적 설정

## 해시 키

- 큐 Redis: `config:queue`
- 티켓 Redis: `config:ticket`

## 필드 목록 (기본값)

### config:queue

#### schedule

- `schedule.transfer_interval_sec` : 대기열 스케줄링 간격 (기본 60)

#### virtual

- `virtual.tick_interval_ms` : 가상 유저 주입 루프 간격 (기본 1000)
- `virtual.target_total` : 목표 대기열 인원 (기본 1000)
- `virtual.initial_jump_ratio` : 시작 시 즉시 주입 비율 (기본 0.3)
- `virtual.burst_duration_sec` : 목표 인원까지 도달하는 시간 (기본 30)
- `virtual.inject_batch_size` : 배치 주입 크기 (기본 50)
- `virtual.inject_batch_delay_ms` : 배치 간 대기 시간 (기본 0)
- `virtual.enabled` : 가상 유저 기능 활성화 (기본 true)

#### worker

- `worker.max_capacity` : 활성 큐 최대 수용 인원 (기본 10)
- `worker.heartbeat_timeout_ms` : 하트비트 미수신 허용 시간 (기본 60000)
- `worker.active_ttl_ms` : 활성 유저 상태 TTL (기본 300000)

#### heartbeat

- `heartbeat.enabled` : 하트비트 기능 사용 여부 (기본 true)
- `heartbeat.throttle_ms` : 동일 유저 하트비트 최소 간격 (기본 1000)
- `heartbeat.cache_max_size` : 하트비트 로컬 캐시 최대 크기 (기본 150000)

### config:ticket

#### schedule

- `schedule.setup_interval_sec` : 티켓팅 사이클 실행 간격 (기본 300)
- `schedule.open_delay_ms` : setup 후 오픈까지 대기 시간 (기본 60000)
- `schedule.duration_ms` : 티켓팅 오픈 유지 시간 (기본 180000)

#### virtual

- `virtual.brpop_timeout_sec` : 가상 유저 큐 대기 타임아웃 (기본 2)
- `virtual.max_seat_attempts` : 좌석 선택 최대 재시도 횟수 (기본 10)
- `virtual.error_delay_ms` : 에러 시 재시도 전 대기 시간 (기본 500)
- `virtual.process_delay_ms` : 예약 처리 후 대기 시간 (기본 0)

## 예시 변경 명령

### 큐 Redis

```redis
HSET config:queue schedule.transfer_interval_sec 10
HSET config:queue virtual.inject_batch_size 50
HSET config:queue virtual.inject_batch_delay_ms 200
HSET config:queue heartbeat.enabled false
```

### 티켓 Redis

```redis
HSET config:ticket schedule.setup_interval_sec 120
HSET config:ticket virtual.max_seat_attempts 5
HSET config:ticket virtual.process_delay_ms 100
```

## 초기값 우선순위

1. 환경변수가 있으면 그 값을 Redis에 저장
2. 환경변수가 없으면 기본값을 Redis에 저장

## 비고

- 기존 `queue:config` 해시는 사용하지 않습니다.
