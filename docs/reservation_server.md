# 개요.
- 공연 예약을 처리하는 서버.
- N 분 마다 계속 같은 Cycle을 돈다.
  1. 공연장 좌석 정보 조회. (set up)
  2. M 개의 공연 예약 API 처리.
  3. 공연 예약 마감. (tear down)
- 티켓팅 시뮬레이션 서버이므로 예약 정보는 N 분동안만 저장된다.

# 1. set up.
> 티켓팅 시작 1분에 처리. `TEST` 환경에서는 실제 API 대신 Mocking하여 사용.

1. 최신 공연 목록 조회.
    - `GET /api/performances?limit=1` => performance_id
2. 해당 공연 회차 조회.
    - `GET /api/performances/{id}/sessions` => session list
    - session => (venue_id, session_date)
3. 해당 공연장 조회.
    - `GET /api/venues/{id}` => block list
    - block => (id, block_data_name, row_size, col_size)
4. 공연 예약 API Parameter 검증을 위해 데이터 저장.
    - session_id, block_id, row_size, col_size.
    - 예약 API 는 requset는 (user_id, session_id, block_id, row, col) 로 옴.
    - 그러면 session_id, block_id, row, col 을 validate함.
    - 좌석은 redis map 자료구조로 저장. (`SETNX` 옵션 사용.)
    - key 값은 `{session_id}_{block_id}_{row}_{col}`.
    - value 값은 `{user_id}`.
5. 티켓팅 시간이 되면 `POST /api/reservations` 요청을 승인.
    - 스케쥴러가 `isTicketingOpen`값을 `true`로 세팅.

# 2. Reservation
> 매 N 개의 티켓팅 API 요청마다 반복하는 작업.

- `POST /api/reservations`
    - header : active_token
    - body : session_id, block_id, row, col
- validate active token.
    - JWT verify.
    - Redis Check. (해당 token이 정말 active queue에 있는지.)
    - (이 작업은 Jerry 에게 설명을 들어야함.)
- response to frontend.
    - `POST /api/reservations`에 대한 response.
    - success response : rank(해당 회차에서의 내 예약 등수.)
    - fail response : 400 + error message.
- deactivate active token.
    - queue server에 해당 token을 active queue에서 제거하라는 요청.
    - `channel:finish` 를 publish.
    - (이 작업은 Jerry 에게 설명을 들어야함.)

# 3. tear down.
> 티켓팅이 시작하고 N 분 뒤에 처리. 티켓팅 마감.

- `POST /api/reservations` 요청을 모두 거부.
    - 스케쥴러가 `isTicketingOpen` 을 `false`로 처리.