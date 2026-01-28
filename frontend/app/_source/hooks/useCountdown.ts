import { refreshPerformance } from "@/app/actions/refreshPerformance";
import { useState, useEffect } from "react";
import { getServerTime } from "@/app/actions/getServerTime";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface UseCountdownReturn {
  timeLeft: TimeLeft;
  isActive: boolean;
}

function calculateTimeLeft(targetDate: Date, offset: number): TimeLeft {
  const now = new Date(Date.now() + offset);
  const difference = targetDate.getTime() - now.getTime();

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

export function useCountdown(targetDate?: string): UseCountdownReturn {
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
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
      }
    };

    if (targetDate) {
      syncTime();
    }
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return calculateTimeLeft(new Date(targetDate), 0);
  });

  const [isActive, setIsActive] = useState(() => !targetDate);

  useEffect(() => {
    const target = targetDate ? new Date(targetDate) : null;
    if (!target) {
      return;
    }

    // offset이 변경되면 즉시 시간을 다시 계산하여 UI에 반영 (1초 딜레이 방지)
    // eslint-disable-next-line
    setTimeLeft(calculateTimeLeft(target, offset));

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(target, offset);
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        setIsActive(true);
        refreshPerformance();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, offset]);

  return { timeLeft, isActive };
}
