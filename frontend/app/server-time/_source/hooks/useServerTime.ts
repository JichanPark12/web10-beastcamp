"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlatformTime } from "../actions/getPlatformTime";
import { useState, useEffect, useRef } from "react";

// 최근 N개의 RTT 샘플 유지
const SAMPLE_SIZE = 5;

export const useServerTime = (url: string) => {
  const [clientOffset, setClientOffset] = useState<number>(0);

  // RTT 샘플링을 위한 Ref
  const rttHistory = useRef<number[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["serverTime", url],
    queryFn: async () => {
      const start = performance.now();
      const result = await getPlatformTime(url);
      const end = performance.now();

      if (!result) {
        throw new Error("Failed to fetch server time");
      }

      const currentRTT = end - start;
      rttHistory.current = [...rttHistory.current, currentRTT].slice(
        -SAMPLE_SIZE,
      );
      const effectiveRTT = Math.min(...rttHistory.current);
      const cacheAge = result.serverNow - result.fetchedAt;
      const projectedTargetTime = result.serverDate + cacheAge;
      const estimatedServerTime = projectedTargetTime + effectiveRTT * 0.3;
      const currentSystemTime = Date.now();

      const newOffset = estimatedServerTime - currentSystemTime;
      setClientOffset(newOffset);

      return {
        serverDate: result.serverDate,
        latency: effectiveRTT,
      };
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });

  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    let animationFrameId: number;

    const updateTime = () => {
      setCurrentTime(Date.now() + clientOffset);
      animationFrameId = requestAnimationFrame(updateTime);
    };

    updateTime();

    return () => cancelAnimationFrame(animationFrameId);
  }, [clientOffset]);

  return {
    time: data ? currentTime : null,
    latency: data?.latency ?? null,
    isLoading,
    isError,
    refresh: refetch,
  };
};
