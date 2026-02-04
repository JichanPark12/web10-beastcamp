"use client";

import { useEffect } from "react";
import { disableExperienceMode } from "@/app/actions/experience";

export default function ExperienceCleanup() {
  useEffect(() => {
    const cleanup = async () => {
      await disableExperienceMode();
    };
    cleanup();
  }, []);

  return null;
}
