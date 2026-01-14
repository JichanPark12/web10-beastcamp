import { useState } from "react";
import { ChevronUp } from "lucide-react";

interface RoundSelectorProps {
  selectedRound: string | null;
  onRoundSelect: (roundId: string) => void;
}

const rounds = [
  {
    id: "1",
    label: "1회 18:00",
    details: "LOVE석 2 / PEACE석 1 / 가족석(2인석/4인석) 2",
  },
];

export default function RoundSelector({
  selectedRound,
  onRoundSelect,
}: RoundSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);

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
          {rounds.map((round) => (
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
                className={`text-sm mb-1 ${
                  selectedRound === round.id ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {round.label}
              </div>
              <div className="text-xs text-gray-600">{round.details}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
