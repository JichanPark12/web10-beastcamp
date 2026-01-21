export const REDIS_COMMANDS = {
  TRANSFER_USER: {
    name: 'transferUser',
    numberOfKeys: 2,
    lua: `
        -- KEYS[1]: 대기 큐 (WAITING_QUEUE)
        -- KEYS[2]: 활성 큐 (ACTIVE_QUEUE)
        -- ARGV[1]: 최대 수용량 (MAX_CAPACITY)
        -- ARGV[2]: 현재 타임스탬프 (now)
  
        -- 1. 현재 활성 큐에 몇 명이 있는지 확인 (ZCARD)
        local active_count = redis.call('ZCARD', KEYS[2])

        -- 2. 입장 가능한 빈 자리 계산
        local max_capacity = tonumber(ARGV[1])
        local available = max_capacity - active_count
  
        -- 3. 빈 자리가 있는 경우에만 로직 수행
        if available > 0 then
            -- 4. 대기 큐에서 가장 오래 기다린 사람부터 빈 자리만큼 꺼냄 (ZPOPMIN)
            -- 반환 형태: {유저ID1, 점수1, 유저ID2, 점수2, ...}
            local waiting_users = redis.call('ZPOPMIN', KEYS[1], available)
            local moved_ids = {}
  
            -- 5. 꺼내온 유저들을 순회 (유저ID만 필요하므로 2씩 증가)
            for i = 1, #waiting_users, 2 do
                local user_id = waiting_users[i]
                
                -- 6. 활성 큐로 유저 이동 (ZADD)
                redis.call('ZADD', KEYS[2], ARGV[2], user_id)

                -- 7. 유저의 활성 상태 세션 데이터 저장 (5분 유지)
                redis.call('SET', 'status:active:' .. user_id, 'true', 'EX', 300)

                -- 8. 결과 반환을 위해 리스트에 추가
                table.insert(moved_ids, user_id)
            end

            -- 이동된 유저 ID 리스트 반환
            return moved_ids
        end

        -- 빈 자리가 없으면 빈 배열 반환
        return {}
    `,
  },
};
