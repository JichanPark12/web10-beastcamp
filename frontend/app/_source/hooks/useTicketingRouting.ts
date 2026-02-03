import { useRouter } from "next/navigation";
import { Performance } from "@/types/performance";

export function useTicketingRouting() {
  const router = useRouter();

  const handleBooking = (performance?: Performance) => {
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

  return { handleBooking };
}
