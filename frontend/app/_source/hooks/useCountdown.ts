import { refreshPerformance } from "@/app/actions/refreshPerformance";
import { useState, useEffect, useEffectEvent, useRef } from "react";
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
  const [status, setStatus] = useState<CountdownStatus>("ended");

  const [isServerTimeSynced, setIsServerTimeSynced] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const timeOffsetRef = useRef(0);

  const onTicketingEnd = useEffectEvent(() => {
    refreshPerformance();
  });

  useEffect(() => {
    (async () => {
      const serverTime = await getServerTime();
      const clientTime = Date.now();
      timeOffsetRef.current = serverTime - clientTime;
      setIsServerTimeSynced(true);
    })();
  }, []);

  useEffect(() => {
    if (!targetDateStr || !isServerTimeSynced) return;

    const targetDate = new Date(targetDateStr);
    const targetTime = targetDate.getTime();
    const endTime = targetTime + TICKETING_DURATION_MS;

    const updateTimer = () => {
      const serverNow = Date.now() + timeOffsetRef.current;

      if (serverNow < targetTime) {
        setStatus("waiting");
        setTimeLeft(calculateTimeLeft(targetTime, serverNow));
      } else if (serverNow < endTime) {
        setStatus("ticketing");
        setTimeLeft(calculateTimeLeft(endTime, serverNow));
      } else {
        setStatus("ended");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onTicketingEnd();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr, isServerTimeSynced]);

  return { timeLeft, status };
}
