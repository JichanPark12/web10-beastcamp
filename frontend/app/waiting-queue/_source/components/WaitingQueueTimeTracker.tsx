"use client";

import { useEffect } from "react";

export default function WaitingQueueTimeTracker() {
  useEffect(() => {
    sessionStorage.setItem("timeQueueEnter", Date.now().toString());
  }, []);

  return null;
}
