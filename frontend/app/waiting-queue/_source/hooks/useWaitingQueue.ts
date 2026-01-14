"use client";

import { API_PREFIX } from "@/constants/api";
import axios from "axios";
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
      try {
        const response = await axios.get<WaitingOrderResponse>(
          `${API_PREFIX}/waiting`
        );
        setData(response.data);
      } catch (error) {
        setIsError(true);
        console.error(error);
      } finally {
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
