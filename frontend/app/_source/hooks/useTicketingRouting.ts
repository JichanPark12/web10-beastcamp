import { useRouter } from "next/navigation";
import { Performance } from "@/types/performance";

import { TICKETING_SITES } from "@/constants/ticketingSites";

export function useTicketingRouting() {
  const router = useRouter();

  const handleBooking = (performance?: Performance) => {
    if (!performance?.platform) {
      router.push("/nol-ticket");
      return;
    }

    const site = TICKETING_SITES.find((s) => s.id === performance.platform);
    router.push(site?.path || "/nol-ticket");
  };

  return { handleBooking };
}
