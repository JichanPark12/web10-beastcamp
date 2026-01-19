"use client";

import { get } from "@/lib/api";
import { useEffect, useRef, useState } from "react";

interface WaitingOrderResponse {
  order: number;
}

/**
 * 대기 순번 조회를 위한 커스텀 훅
 */
export function useWaitingQueue() {
  const [data, setData] = useState<WaitingOrderResponse | undefined>(undefined);
  const [isError, setIsError] = useState<boolean>(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const poll = async () => {
      let shouldPollAgain = true;
      try {
        const response = await get<WaitingOrderResponse>(`/waiting`);
        setData(response);

        if (response.order <= 0) {
          shouldPollAgain = false;
        }
      } catch (error) {
        setIsError(true);
        console.error(error);
      }

      if (shouldPollAgain) {
        timeoutIdRef.current = setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const isFinished = data !== undefined && data.order <= 0;

  return {
    data,
    isError,
    isFinished,
  };
}
