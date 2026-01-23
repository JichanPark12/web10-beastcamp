import { Session } from "@/types/performance";

interface DetailRoundSelectorProps {
  selectedRound: string | null;
  onRoundSelect: (roundId: string) => void;
  sessions?: Session[];
  selectedDate?: Date;
}

export default function DetailRoundSelector({
  selectedRound,
  onRoundSelect,
  sessions,
  selectedDate,
}: DetailRoundSelectorProps) {
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
    <div className="space-y-2">
      {!selectedDate ? (
        <div className="text-center text-sm text-gray-500 py-8 bg-gray-50 rounded-lg">
          관람일을 먼저 선택해주세요.
        </div>
      ) : availableRounds.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-8 bg-gray-50 rounded-lg">
          선택하신 날짜에 서비스 제공하지 않습니다.
        </div>
      ) : (
        availableRounds.map((round) => (
          <button
            key={round.id}
            onClick={() => onRoundSelect(round.id)}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left font-medium ${
              selectedRound === round.id
                ? "border-purple-600 bg-purple-50 text-purple-700"
                : "border-gray-200 hover:border-purple-300 text-gray-700"
            }`}
          >
            {round.label}
          </button>
        ))
      )}
    </div>
  );
}
