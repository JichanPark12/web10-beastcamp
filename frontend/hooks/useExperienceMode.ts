"use client";

import { useSyncExternalStore } from "react";
import { isExperienceMode } from "@/lib/utils";

const subscribe = (callback: () => void) => {
  return () => {};
};

export function useExperienceMode() {
  const isExperience = useSyncExternalStore(
    subscribe,
    isExperienceMode,
    () => false,
  );

  return isExperience;
}
