🏟️ Nest.js 기반 공연장 좌석 관리 API 명세서
## 1. 개요
공연장의 구역 정보와 좌석 구조(그리드 크기)를 관리하는 API 시스템이다. 
개별 좌석 데이터(Seat)를 DB에 저장하지 않고, 구역의 행/열 크기(rowSize, colSize)를 통해 프론트엔드에서 동적으로 좌석을 생성하도록 설계한다. 예약 상태는 Redis 등 별도 시스템에서 처리하므로 본 명세에서는 배제한다.

## 2. 데이터베이스 설계 (ERD)

Venue (공연장)
- id: number (PK)
- venueName: string
- blockMap: string (SVG 파일 경로 또는 URL)

Block (구역)
- id: number (PK)
- venueId: number (FK)
- blockDataName: string (SVG 파일 내 data-block-name 속성과 매칭, Unique)
- rowSize: number (구역의 가로 좌석 수)
- colSize: number (구역의 세로 좌석 수)

## 3. 백엔드 구현 명세 (Nest.js + TS)
Entity 정의 (TypeORM)
- Venue: 공연장 기본 정보를 담는다.
- Block: 특정 공연장에 종속되며, 해당 구역이 몇 행 몇 열로 구성되는지 정의한다.

API Endpoints
1. 공연장 전체 정보 조회
Method: GET

Path: /api/venues/:id

Description: 공연장 정보와 해당 공연장에 포함된 모든 구역의 메타데이터(그리드 크기 포함)를 조회한다.

Success Response:

```JSON
{
  "id": 1,
  "venueName": "인천 남동 체육관",
  "blockMapUrl": "/static/svg/incheon_namdong_gymnasium.svg",
  "blocks": [
    {
      "id": 101,
      "blockDataName": "A-1",
      "rowSize": 10,
      "colSize": 15
    },
    {
      "id": 102,
      "blockDataName": "B-1",
      "rowSize": 12,
      "colSize": 20
    }
  ]
}
```

## 4. 백엔드 작업 프로세스
Venue & Block 데이터 수동 삽입: 공연장 SVG 분석 결과에 따라 Venue와 Block 데이터를 DB에 사전 등록한다.

정적 자원 제공: SVG 파일을 서빙할 수 있도록 Nest.js 내 정적 파일 경로(Static Assets) 설정을 확인한다.

Unique 식별자 관리: blockDataName이 SVG의 data-block-name과 정확히 일치하도록 관리한다.

## 5. [참고] 프론트엔드 렌더링 로직 (Reference)
백엔드 API를 사용하여 프론트엔드에서 처리해야 할 흐름이다.

SVG 로드: blockMap 경로를 통해 SVG 소스를 불러와 화면에 렌더링한다.

구역 클릭 이벤트: * SVG 내 <path data-block-name="A-1"> 태그 클릭 시 이벤트를 캡처한다.

클릭된 태그의 data-block-name 값을 추출한다.

그리드 생성:

API 응답에서 해당 blockDataName에 맞는 rowSize와 colSize를 찾는다.

rowSize * colSize 형태의 2차원 배열 또는 Grid 레이아웃을 동적으로 생성하여 화면에 표시한다.

## 6. 특이사항
데이터 경량화: 개별 좌석 정보를 DB에서 관리하지 않으므로 저장 공간이 절약되고 API 응답 속도가 매우 빠르다.

확장성: 좌석의 예약 상태 정보는 본 API 응답 결과에 redisKey 등을 조합하여 프론트엔드에서 Redis 서버로 직접 요청하거나 별도 조인 서비스를 통해 처리한다.