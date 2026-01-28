"use client";

import { useCountdown } from "../../hooks/useCountdown";
import CountdownTimer from "./CountdownTimer";
import type { Performance, Session } from "@/types/performance";
import type { VenueDetail } from "@/types/venue";
import { useRouter } from "next/navigation";

interface TicketingControlsProps {
  performance?: Performance;
  sessions?: Session[];
  venue: VenueDetail | null;
}

export default function TicketingControls({
  performance,
}: TicketingControlsProps) {
  const router = useRouter();

  const { timeLeft, isActive } = useCountdown(performance?.ticketing_date);

  const handleBooking = () => {
    if (!performance?.platform) {
      router.push("/nol-ticket");
      return;
    }

    const platformRoutes = {
      "nol-ticket": "/nol-ticket",
      yes24: "/yes24",
      "melon-ticket": "/melon-ticket",
    };

    const route =
      platformRoutes[performance.platform as keyof typeof platformRoutes];
    router.push(route || "/nol-ticket");
  };

  return (
    <div className="bg-white/10 p-3 backdrop-blur-lg rounded-2xl border border-white/20">
      <CountdownTimer timeLeft={timeLeft} />

      <button
        onClick={handleBooking}
        className={`w-full py-4 rounded-xl transition-all bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl`}
      >
        연습하러 가기
      </button>

      {!isActive && (
        <p className="text-center text-sm text-white/60 mt-3">
          티켓팅 시작 시간에 활성화됩니다
        </p>
      )}
    </div>
  );
}
