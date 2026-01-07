# 공연장
```sql
CREATE TABLE `venues` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT,
    `venue_name`          VARCHAR(50)     NOT NULL    COMMENT '공연장 이름',
    `seat_img_url`  VARCHAR(500)    NULL        COMMENT 'SVG 이미지 경로',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

# 좌석
```sql
CREATE TABLE `seats` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT,
    `venue_id`      BIGINT          NOT NULL,
    `seat_location` VARCHAR(50)     NOT NULL    COMMENT '좌석위치',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_venues_to_seats` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`),
    CONSTRAINT `uk_venue_seat_location` UNIQUE (`venue_id`, `seat_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

# 공연
```sql
CREATE TABLE `performances` (
    `id`               BIGINT          NOT NULL AUTO_INCREMENT,
    `venue_id`         BIGINT          NOT NULL,
    `performance_name` VARCHAR(100)    NOT NULL    COMMENT '공연 이름',
    `performance_date` DATETIME        NOT NULL    COMMENT '공연 일시 (ISO 8601)',
    `ticketing_date`   DATETIME        NOT NULL    COMMENT '티켓팅 일시 (ISO 8601)',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_venues_to_performances` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```