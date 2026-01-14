# 🎫 공연 좌석 등급 및 구역 매핑 API 명세서

## 1. 개요
공연(`Performance`)별로 좌석 등급(`Grade`)과 가격을 정의하고, 이를 실제 공연장의 구역(`Block`)에 할당하는 시스템이다. 
물리적 구역은 고정되어 있으나, 해당 구역의 등급과 가격은 공연마다 가변적이라는 점이 핵심이다.

## 2. 데이터베이스 설계 (ERD)

### Grade (공연 등급)
- 특정 공연에서 사용할 등급(VIP, R, S 등)과 가격을 관리한다.
- `id`: number (PK)
- `performanceId`: number (FK)
- `name`: string (등급 명칭)
- `price`: number (가격)

### BlockGrade (구역-등급 매핑)
- 특정 공연의 특정 구역이 어떤 등급에 해당되는지 연결한다.
- **정합성 규칙**: 한 공연 내에서 특정 구역은 오직 하나의 등급만 가질 수 있다.
- `id`: number (PK)
- `performanceId`: number (FK, 데이터 정합성 및 조회 성능을 위해 포함)
- `blockId`: number (FK)
- `gradeId`: number (FK)
- **Unique Constraint**: `(performanceId, blockId)` - 한 공연의 구역 중복 할당 방지

## 3. 구현 가이드 (Nest.js + TypeORM)

### Entity 정의
1. **Grade Entity**
   - `Performance`와 N:1 관계
   - `BlockGrade`와 1:N 관계

2. **BlockGrade Entity**
   - `Performance`, `Block`, `Grade`와 각각 N:1 관계
   - `@Unique(['performanceId', 'blockId'])` 데코레이터 반드시 적용

### API 구현 계획

#### 1. 등급 (Grade)
*   **등급 생성**
    *   **Method**: `POST`
    *   **Path**: `/api/performances/:id/grades`
    *   **Body**: `[{ name: 'VIP', price: 150000 }, ...]`
    *   **Description**: 특정 공연의 좌석 등급과 가격을 생성한다.

*   **등급 조회**
    *   **Method**: `GET`
    *   **Path**: `/api/performances/:id/grades`
    *   **Description**: 특정 공연에 설정된 모든 등급 목록을 조회한다.

#### 2. 구역-등급 매핑 (BlockGrade)
*   **구역 등급 할당**
    *   **Method**: `POST`
    *   **Path**: `/api/performances/:id/block-grades`
    *   **Body**: `[{ gradeId: 1, blockIds: [101, 102] }, ...]`
    *   **Description**: 특정 등급을 구역들에 할당한다.
    *   **Validation**: 이미 다른 등급에 할당된 구역이 포함되어 있으면 `400 Bad Request` 반환.

*   **구역 등급 매핑 조회**
    *   **Method**: `GET`
    *   **Path**: `/api/performances/:id/block-grades`
    *   **Description**: 해당 공연의 모든 구역별 등급 할당 현황을 조회한다.

## 4. 특이사항 및 주의사항
- **데이터 경량화**: 이전 명세(@docs/venue_seat_api.md)와 동일하게 개별 좌석(Seat)은 DB에 저장하지 않는다.
- **정합성**: `BlockGrade` 테이블에 `performanceId`를 명시적으로 포함하여 DB 레벨에서 `Unique` 제약을 걸어 중복 등급 부여를 원천 차단한다.
- **관계**: `Block`은 `backend/api-server/src/venues/entities/block.entity.ts`에 정의되어 있으므로 이를 참조한다.