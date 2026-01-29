import { refreshPerformance } from "@/app/actions/refreshPerformance";
import { useState, useEffect, useEffectEvent } from "react";
import { getServerTime } from "@/app/actions/getServerTime";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type CountdownStatus = "waiting" | "ticketing" | "ended";

interface UseCountdownReturn {
  timeLeft: TimeLeft;
  status: CountdownStatus;
}

const TICKETING_DURATION_MS = 3 * 60 * 1000; // 3분

function calculateTimeLeft(targetTime: number, now: number): TimeLeft {
  const difference = targetTime - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function useCountdown(targetDateStr?: string): UseCountdownReturn {
  const [offset, setOffset] = useState<number>(0);
  const [status, setStatus] = useState<CountdownStatus>("ended");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const onTicketingEnd = useEffectEvent(() => {
    refreshPerformance();
  });

  useEffect(() => {
    if (!targetDateStr) return;

    const syncTime = async () => {
      try {
        const startTime = Date.now();
        const serverTime = await getServerTime();
        const endTime = Date.now();
        const latency = (endTime - startTime) / 2;
        const timeOffset = serverTime + latency - endTime;
        setOffset(timeOffset);
      } catch (error) {
        console.error("Failed to sync time:", error);
        setOffset(0);
      }
    };

    syncTime();
  }, [targetDateStr]);

  // 타이머 동작
  useEffect(() => {
    if (!targetDateStr) return;

    const targetDate = new Date(targetDateStr);
    const targetTime = targetDate.getTime();
    const endTime = targetTime + TICKETING_DURATION_MS;
    let prevStatus: CountdownStatus | null = null;

    const updateTimer = () => {
      const serverNow = Date.now() + offset;

      if (serverNow < targetTime) {
        setStatus("waiting");
        setTimeLeft(calculateTimeLeft(targetTime, serverNow));
        prevStatus = "waiting";
      } else if (serverNow < endTime) {
        setStatus("ticketing");
        setTimeLeft(calculateTimeLeft(endTime, serverNow));
        prevStatus = "ticketing";
      } else {
        setStatus("ended");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });

        if (prevStatus === "ticketing") {
          onTicketingEnd();
        }
        prevStatus = "ended";
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr, offset]);

  return { timeLeft, status };
}
