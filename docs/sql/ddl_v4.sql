-- 테이블 생성.
-- 공연장.
CREATE TABLE `venues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venue_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '공연장 이름',
  `block_map_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SVG 이미지 경로',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 구역.
CREATE TABLE `blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venue_id` int NOT NULL,
  `block_data_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SVG 파일 내 data-block-name 속성과 매칭',
  `row_size` int NOT NULL COMMENT '구역의 가로 좌석 수',
  `col_size` int NOT NULL COMMENT '구역의 세로 좌석 수',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blocks_venue_id_block_data_name` (`venue_id`,`block_data_name`),
  CONSTRAINT `fk_blocks_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 공연.
CREATE TABLE `performances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kopis_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'KOPIS API 공연 ID (mt20id)',
  `performance_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '공연 이름',
  `ticketing_date` datetime NOT NULL COMMENT '티켓팅 일시 (ISO 8601)',
  `poster_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '포스터 이미지 URL',
  `platform_ticketing_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '실제 예매처 티켓팅 페이지 URL',
  `platform` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nol-ticket' COMMENT '티켓팅 플랫폼 (nol-ticket, interpark, yes24, melon-ticket)',
  `cast_info` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '출연진 정보',
  `runtime` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '공연 런타임',
  `age_limit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '관람 연령 제한',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_performances_ticketing_date` (`ticketing_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 회차.
CREATE TABLE `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `performance_id` int NOT NULL,
  `venue_id` int NOT NULL,
  `session_date` datetime NOT NULL COMMENT '공연 회차 일시 (ISO 8601)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sessions_performance_id_session_date` (`performance_id`,`session_date`),
  KEY `idx_sessions_venue_id` (`venue_id`),
  CONSTRAINT `fk_sessions_performance_id` FOREIGN KEY (`performance_id`) REFERENCES `performances` (`id`),
  CONSTRAINT `fk_sessions_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 등급.
CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_grades_session_id` (`session_id`),
  CONSTRAINT `fk_grades_session_id` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 구역-등급.
CREATE TABLE `block_grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `block_id` int NOT NULL,
  `grade_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_block_grades_session_id_block_id` (`session_id`,`block_id`),
  KEY `idx_block_grades_block_id` (`block_id`),
  KEY `idx_block_grades_grade_id` (`grade_id`),
  CONSTRAINT `fk_block_grades_block_id` FOREIGN KEY (`block_id`) REFERENCES `blocks` (`id`),
  CONSTRAINT `fk_block_grades_session_id` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`),
  CONSTRAINT `fk_block_grades_grade_id` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
