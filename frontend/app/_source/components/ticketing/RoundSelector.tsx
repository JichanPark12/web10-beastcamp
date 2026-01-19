import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Session } from "@/types/performance";

interface RoundSelectorProps {
  selectedRound: string | null;
  onRoundSelect: (roundId: string) => void;
  sessions?: Session[];
  selectedDate?: Date;
}

export default function RoundSelector({
  selectedRound,
  onRoundSelect,
  sessions,
  selectedDate,
}: RoundSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const availableRounds =
    !sessions || !selectedDate
      ? []
      : sessions
          .filter(
            (checkSession) =>
              new Date(checkSession.sessionDate).toDateString() ===
              selectedDate.toDateString()
          )
          .map((session, index) => {
            const d = new Date(session.sessionDate);
            const timeString = d.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return {
              id: session.id.toString(),
              label: `${index + 1}회 ${timeString}`,
            };
          });

  return (
    <div className="mb-4 bg-white rounded-xl p-4 text-gray-900">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-base">회차</h3>
        <ChevronUp
          className={`w-5 h-5 transition-transform ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </div>

      {isOpen && (
        <div className="space-y-2 mt-3">
          {!selectedDate ? (
            <div className="text-center text-sm text-gray-400 py-4">
              날짜를 먼저 선택해주세요.
            </div>
          ) : availableRounds.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-4">
              해당 날짜에 회차가 없습니다.
            </div>
          ) : (
            availableRounds.map((round) => (
              <button
                key={round.id}
                onClick={() => onRoundSelect(round.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedRound === round.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    selectedRound === round.id
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  {round.label}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
