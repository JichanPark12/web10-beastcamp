"use client";

import { useEffect, useRef } from "react";

export default function ReservationTimeTracker() {
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      const queueEnterTime = sessionStorage.getItem("timeQueueEnter");

      if (queueEnterTime) {
        const newQueueDuration = (Date.now() - Number(queueEnterTime)) / 1000;
        const oldQueueDuration =
          Number(sessionStorage.getItem("timeQueueDuration")) || 0;
        const totalQueueDuration = oldQueueDuration + newQueueDuration;
        sessionStorage.setItem(
          "timeQueueDuration",
          totalQueueDuration.toString()
        );
      }

      sessionStorage.setItem("timeReservationEnter", Date.now().toString());

      return () => {
        effectRan.current = true;
      };
    }
  }, []);

  return null;
}
