import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useRefreshToMain(condition: boolean) {
  const router = useRouter();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (condition) return;

    if (hasHandled.current) return;

    const navEntries = performance.getEntriesByType("navigation");

    if (navEntries.length > 0) {
      const entry = navEntries[0] as PerformanceNavigationTiming;

      if (entry.type === "reload") {
        hasHandled.current = true;
        router.replace("/");
      } else {
        hasHandled.current = true;
        alert("잘못된 접근입니다. 메인 페이지로 이동합니다.");
        router.replace("/");
      }
    }
  }, [condition, router]);
}
