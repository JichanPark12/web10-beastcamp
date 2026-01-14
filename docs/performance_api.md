# 개요

메인 화면에서 최신 공연정보들을 받아오기 위함.

# 최근 공연 정보 검색.

## request

```bash
GET /api/performances?ticketing_after={string(ISO 8601)}&limit={number}
```

### 예시.

```bash
GET /api/performances?ticketing_after=2026-01-04T00:00:00&limit=5
```

## response

```bash
{
	"performances": [
		{
      "performance_id": number,
      "performance_name": string,
      "ticketing_date": string(ISO 8601),
      "performance_date": string(ISO 8601),
      "venue_id": number,
      "venue_name": string
    },
	]
}
```

### 예시.

```bash
{
  "performances": [
    {
      "performance_id": 123,
      "performance_name": "임영웅 단콘",
      "ticketing_date": "2026-01-01T13:00:00Z",
      "performance_date": "2026-01-05T19:00:00Z",
      "venue_id": 20,
      "venue_name": "인천 남동 체육관",
    },
    {
      "performance_id": 124,
      "performance_name": "IU 전국 투어",
      "ticketing_date": "2026-01-04T13:00:00Z",
      "performance_date": "2026-01-08T19:00:00Z",
      "venue_id": 21,
      "venue_name": "올림픽 체조경기장",
    },
  ]
}
```

---

# 공연장 삽입.

장충동 체육관 삽입.

## request

```bash
POST /api/venues

{
	"venue_name": string
}
```

### 예시.

```bash
POST /api/venues

{
	"venue_name": "인천 남동 체육관"
}
```

## response

```bash
{
	"id": number
}
```

### 예시.

```bash
{
	"id": 123
}
```

# 공연장 목록 조회.

## request

```bash
GET /api/venues
```

### 예시.

```bash
GET /api/venues
```

## response

```bash
{
	"venues": [
		{
      "id": number,
      "venue_name": string
    }
	]
}
```

### 예시.

```bash
{
  "venues": [
    {
      "id": 123,
      "venue_name": "인천 남동 체육관"
    },
    {
      "id": 124,
      "venue_name": "올림픽 체조경기장"
    }
  ]
}
```

# 공연 삽입.

임영웅 콘서트 삽입.

## request

```bash
POST /api/performances

{
  "performance_name": string,
  "ticketing_date": string(ISO 8601),
  "performance_date": string(ISO 8601),
  "venue_id": number
}
```

### 예시.

```bash
POST /api/performances

{
  "performance_name": "IU 전국 투어",
  "ticketing_date": "2026-01-04T13:00:00Z",
  "performance_date": "2026-01-08T13:00:00Z",
  "venue_id": 21
 }
```

## response

```bash
{
	"id": number
}
```

### 예시.

```bash
{
	"id": 56
}
```