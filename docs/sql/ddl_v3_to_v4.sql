-- Unique Key 변경 (kopis_id -> ticketing_date)
ALTER TABLE `performances`
  DROP INDEX `uq_performances_kopis_id`,
  ADD UNIQUE KEY `uq_performances_ticketing_date` (`ticketing_date`);