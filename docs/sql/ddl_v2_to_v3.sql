-- v2 -> v3 마이그레이션 스크립트
-- 기존 데이터를 보존하며 performances 테이블에 새로운 컬럼을 추가합니다.

-- 1. platform_ticketing_url 추가
ALTER TABLE `performances` 
  ADD COLUMN `platform_ticketing_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '실제 예매처 티켓팅 페이지 URL' AFTER `poster_url`;

-- 2. cast_info 추가
ALTER TABLE `performances` 
  ADD COLUMN `cast_info` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '출연진 정보' AFTER `platform`;

-- 3. runtime 추가
ALTER TABLE `performances` 
  ADD COLUMN `runtime` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '공연 런타임' AFTER `cast_info`;

-- 4. age_limit 추가
ALTER TABLE `performances` 
  ADD COLUMN `age_limit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '관람 연령 제한' AFTER `runtime`;

-- 참고: performances가 아닌 다른 테이블(venues, blocks, sessions, grades, block_grades)은 v2와 v3 간 차이가 없습니다.
