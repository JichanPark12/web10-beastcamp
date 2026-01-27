-- venues 데이터 삽입
INSERT INTO venues (venue_name, block_map_url) VALUES
('인천 남동 체육관', '/static/svg/incheon_namdong_gymnasium.svg'),
('대구 엑스코', '/static/svg/daegu_exco.svg'),
('대전 컨벤션', '/static/svg/daejeon_convention.svg'),
('일산 킨텍스', '/static/svg/ilsan_kintex.svg');

-- blocks 데이터 삽입

-- 인천 남동 체육관
SET @venue_id = (SELECT id FROM venues WHERE venue_name = '인천 남동 체육관');
INSERT INTO blocks (venue_id, block_data_name, row_size, col_size) VALUES
(@venue_id, 'C2', 10, 10), (@venue_id, 'G2', 10, 10), (@venue_id, 'F2', 10, 10), (@venue_id, 'E2', 10, 10),
(@venue_id, 'D2', 10, 10), (@venue_id, 'B2', 10, 10), (@venue_id, 'A2', 10, 10), (@venue_id, 'T2', 10, 10),
(@venue_id, 'S2', 10, 10), (@venue_id, 'Q2', 10, 10), (@venue_id, 'R2', 10, 10), (@venue_id, 'G1', 10, 10),
(@venue_id, 'H1', 10, 10), (@venue_id, 'F1', 10, 10), (@venue_id, 'E1', 10, 10), (@venue_id, 'D1', 10, 10),
(@venue_id, 'S1', 10, 10), (@venue_id, 'R1', 10, 10), (@venue_id, 'T1', 10, 10), (@venue_id, 'U1', 10, 10),
(@venue_id, 'V1', 10, 10), (@venue_id, 'A1', 10, 10), (@venue_id, 'B1', 10, 10), (@venue_id, 'X1', 10, 10),
(@venue_id, 'C1', 10, 10), (@venue_id, 'W1', 10, 10), (@venue_id, '1', 10, 10), (@venue_id, '4', 10, 10),
(@venue_id, '2', 10, 10), (@venue_id, '3', 10, 10), (@venue_id, '5', 10, 10), (@venue_id, '8', 10, 10),
(@venue_id, '6', 10, 10), (@venue_id, '7', 10, 10);

-- 대구 엑스코
SET @venue_id = (SELECT id FROM venues WHERE venue_name = '대구 엑스코');
INSERT INTO blocks (venue_id, block_data_name, row_size, col_size) VALUES
(@venue_id, '1', 10, 10), (@venue_id, '2', 10, 10), (@venue_id, '3', 10, 10), (@venue_id, '4', 10, 10),
(@venue_id, '5', 10, 10), (@venue_id, '6', 10, 10), (@venue_id, '7', 10, 10), (@venue_id, '8', 10, 10),
(@venue_id, '9', 10, 10), (@venue_id, '10', 10, 10), (@venue_id, 'A', 10, 10), (@venue_id, 'B', 10, 10),
(@venue_id, 'C', 10, 10), (@venue_id, 'D', 10, 10);

-- 대전 컨벤션
SET @venue_id = (SELECT id FROM venues WHERE venue_name = '대전 컨벤션');
INSERT INTO blocks (venue_id, block_data_name, row_size, col_size) VALUES
(@venue_id, '가', 10, 10), (@venue_id, '나', 10, 10), (@venue_id, '다', 10, 10), (@venue_id, '라', 10, 10),
(@venue_id, '마', 10, 10), (@venue_id, '바', 10, 10), (@venue_id, '사', 10, 10), (@venue_id, '아', 10, 10),
(@venue_id, '자', 10, 10), (@venue_id, '차', 10, 10), (@venue_id, 'A', 10, 10), (@venue_id, 'B', 10, 10),
(@venue_id, 'C', 10, 10), (@venue_id, 'D', 10, 10);

-- 일산 킨텍스
SET @venue_id = (SELECT id FROM venues WHERE venue_name = '일산 킨텍스');
INSERT INTO blocks (venue_id, block_data_name, row_size, col_size) VALUES
(@venue_id, '1', 10, 10), (@venue_id, '2', 10, 10), (@venue_id, '3', 10, 10), (@venue_id, '4', 10, 10),
(@venue_id, '5', 10, 10), (@venue_id, '6', 10, 10), (@venue_id, '7', 10, 10), (@venue_id, '8', 10, 10),
(@venue_id, 'A', 10, 10), (@venue_id, 'B', 10, 10), (@venue_id, 'C', 10, 10), (@venue_id, 'D', 10, 10);