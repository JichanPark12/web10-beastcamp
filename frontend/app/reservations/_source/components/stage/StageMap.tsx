import { gradeInfo } from "../../data/seat";
import { Seat } from "../../types/reservationType";

interface StageMapProps {
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  selectedSeats: ReadonlyMap<string, Seat>;
  seats: Seat[];
  handleToggleSeat: (seatId: string, data: Seat) => void;
}

export default function StageMap({
  viewBox,
  selectedSeats,
  seats,
  handleToggleSeat,
}: StageMapProps) {
  return (
    <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">

      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="250" y="80" width="300" height="60" fill="#cbd5e1" rx="8" />
        <text
          x="400"
          y="115"
          textAnchor="middle"
          fill="#64748b"
          fontSize="20"
          fontWeight="600"
        >
          STAGE
        </text>

        <text x="40" y="220" fill="#6b7280" fontSize="14" fontWeight="600">
          1F
        </text>
        <text x="40" y="380" fill="#6b7280" fontSize="14" fontWeight="600">
          2F
        </text>

        <text x="150" y="165" fill="#9ca3af" fontSize="11">
          R-Left
        </text>
        <text x="350" y="165" fill="#9ca3af" fontSize="11">
          VIP
        </text>
        <text x="600" y="165" fill="#9ca3af" fontSize="11">
          R-Right
        </text>
        <text x="130" y="335" fill="#9ca3af" fontSize="11">
          S-Left
        </text>
        <text x="380" y="325" fill="#9ca3af" fontSize="11">
          A-Center
        </text>
        <text x="580" y="335" fill="#9ca3af" fontSize="11">
          S-Right
        </text>
        <text x="380" y="465" fill="#9ca3af" fontSize="11">
          일반석
        </text>

        {seats.map((seat) => {
          const isSelected = selectedSeats.has(seat.id);
          const fillColor = seat.isOccupied
            ? "#d1d5db"
            : gradeInfo[seat.grade].fillColor;
          const opacity = seat.isOccupied ? 0.3 : isSelected ? 1 : 0.6;
          const strokeWidth = isSelected ? 2 : 0;

          return (
            <circle
              key={seat.id}
              cx={seat.x}
              cy={seat.y}
              r={isSelected ? 6 : 5}
              fill={fillColor}
              opacity={opacity}
              stroke={isSelected ? "#fff" : "none"}
              strokeWidth={strokeWidth}
              className={`${
                !seat.isOccupied
                  ? "cursor-pointer hover:opacity-100"
                  : "cursor-not-allowed"
              } transition-all`}
              onClick={() => {
                if (!seat.isOccupied) {
                  handleToggleSeat(seat.id, seat);
                }
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
