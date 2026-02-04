import { useRouter } from "next/navigation";
import { Performance } from "@/types/performance";

export function useTicketingRouting() {
  const router = useRouter();

  // 내부 모의 티켓팅(연습) 페이지로 이동
  const navigateToPractice = (performance?: Performance) => {
    if (!performance?.platform) {
      router.push("/nol-ticket");
      return;
    }

    const platformRoutes = {
      "nol-ticket": "/nol-ticket",
      yes24: "/yes24",
      "melon-ticket": "/yes24",
    };

    const route =
      platformRoutes[performance.platform as keyof typeof platformRoutes];
    router.push(route || "/nol-ticket");
  };

  // 외부 예매 사이트(새 탭)로 이동
  const navigateToExternal = (performance: Performance) => {
    if (performance.platform_ticketing_url) {
      window.open(performance.platform_ticketing_url, "_blank");
    } else {
      return;
    }
  };

  return { navigateToPractice, navigateToExternal };
}
