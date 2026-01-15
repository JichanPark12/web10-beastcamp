"use client";

import { useEffect, useRef, useState } from "react";
import { ITimeLog } from "../types/resultType";

export function useTimeLog() {
  const [timeLog, setTimeLog] = useState<ITimeLog>({});
  const [totalTime, setTotalTime] = useState(0);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      const reservationEnterTime = sessionStorage.getItem(
        "timeReservationEnter"
      );
      if (reservationEnterTime) {
        const newReservationDuration =
          (Date.now() - Number(reservationEnterTime)) / 1000;
        const oldReservationDuration =
          Number(sessionStorage.getItem("timeReservationDuration")) || 0;
        const totalReservationDuration =
          oldReservationDuration + newReservationDuration;
        sessionStorage.setItem(
          "timeReservationDuration",
          totalReservationDuration.toString()
        );
      }

      const queueDuration =
        Number(sessionStorage.getItem("timeQueueDuration")) || 0;
      const reservationDuration =
        Number(sessionStorage.getItem("timeReservationDuration")) || 0;
      const newTimeLog: ITimeLog = {
        queue: queueDuration,
        seats: reservationDuration,
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLog(newTimeLog);
      setTotalTime(Object.values(newTimeLog).reduce((a, b) => a + b, 0));

      return () => {
        effectRan.current = true;
        sessionStorage.removeItem("timeQueueEnter");
        sessionStorage.removeItem("timeQueueDuration");
        sessionStorage.removeItem("timeReservationEnter");
        sessionStorage.removeItem("timeReservationDuration");
      };
    }
  }, []);

  return { timeLog, totalTime };
}
