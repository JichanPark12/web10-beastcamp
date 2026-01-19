"use client";

import { useState } from "react";
import { useCountdown } from "../../hooks/useCountdown";
import CountdownTimer from "./CountdownTimer";
import DateSelector from "./DateSelector";
import RoundSelector from "./RoundSelector";
import type { Performance, Session } from "@/types/performance";
import { useRouter } from "next/navigation";

interface TicketingControlsProps {
  performance?: Performance;
  sessions?: Session[];
}

export default function TicketingControls({
  performance,
  sessions,
}: TicketingControlsProps) {
  const router = useRouter();

  const { timeLeft, isActive } = useCountdown(performance?.ticketing_date);
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedDate && selectedRound) {
      router.push("/waiting-queue");
      console.log("예매 확정:", { selectedDate, selectedRound });
    }
  };

  const handleBackToCountdown = () => {
    setShowDateSelection(false);
    setSelectedDate(undefined);
    setSelectedRound(null);
  };

  const onDateSelect = (date: Date | undefined) => {
    if (date === selectedDate) return;
    if (!date) return;
    setSelectedDate(date);
    setSelectedRound(null);
  };

  return (
    <div
      className={`${
        showDateSelection
          ? "flex flex-col items-end"
          : "bg-white/10 p-3 backdrop-blur-lg rounded-2xl border border-white/20"
      }`}
    >
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
        <div className=" w-fit">
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            sessions={sessions}
          />

          <RoundSelector
            selectedRound={selectedRound}
            onRoundSelect={setSelectedRound}
            sessions={sessions}
            selectedDate={selectedDate}
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
        </div>
      )}
    </div>
  );
}
