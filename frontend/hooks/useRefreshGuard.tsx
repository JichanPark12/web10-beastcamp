"use client";

import { usePreventRefresh } from "@/hooks/usePreventRefresh";
import { useRefreshToMain } from "@/hooks/useRefreshToMain";

export default function useRefreshGuard(condition: boolean) {
  usePreventRefresh();
  useRefreshToMain(condition);

  return null;
}
