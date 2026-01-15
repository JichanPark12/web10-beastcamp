"use client";

import { useState } from "react";
import { useCountdown } from "../../hooks/useCountdown";
import CountdownTimer from "./CountdownTimer";
import DateSelector from "./DateSelector";
import RoundSelector from "./RoundSelector";
import type { Performance } from "@/types/performance";
import { useRouter } from "next/navigation";

interface TicketingControlsProps {
  performance?: Performance;
}

export default function TicketingControls({
  performance,
}: TicketingControlsProps) {
  const { timeLeft, isActive } = useCountdown(performance?.ticketing_date);
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  const router = useRouter();

  const handleConfirm = () => {
    if (selectedDate && selectedRound) {
      // TODO: 예매 처리
      console.log("예매 확정:", { selectedDate, selectedRound });
      router.push("/waiting-queue");
    }
  };

  const handleBackToCountdown = () => {
    setShowDateSelection(false);
    setSelectedDate(null);
    setSelectedRound(null);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      {!showDateSelection ? (
        <>
          <CountdownTimer timeLeft={timeLeft} />

          <button
            onClick={() => setShowDateSelection(true)}
            disabled={!isActive}
            className={`w-full py-4 rounded-xl transition-all ${
              isActive
                ? "bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl"
                : "bg-white/30 text-white/50 cursor-not-allowed"
            }`}
          >
            {isActive ? "예매하기" : "대기 중..."}
          </button>

          {!isActive && (
            <p className="text-center text-sm text-white/60 mt-3">
              티켓팅 시작 시간에 활성화됩니다
            </p>
          )}

          <button
            onClick={() => setShowDateSelection(true)}
            className="w-full mt-3 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-sm border border-white/30"
          >
            데모 시작하기
          </button>
        </>
      ) : (
        <>
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            performanceDate={performance?.performance_date}
          />

          <RoundSelector
            selectedRound={selectedRound}
            onRoundSelect={setSelectedRound}
          />

          <div className="flex gap-2">
            <button
              onClick={handleBackToCountdown}
              className="flex-1 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedRound}
              className={`flex-1 py-3 rounded-xl transition-all text-sm ${
                selectedDate && selectedRound
                  ? "bg-white text-purple-600 hover:bg-gray-100"
                  : "bg-white/30 text-white/50 cursor-not-allowed"
              }`}
            >
              예매하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
