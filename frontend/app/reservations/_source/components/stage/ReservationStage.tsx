import { Seat } from "../../types/reservationType";

import { useEffect, useState } from "react";
import { generateSeats } from "../../data/seat";
import StageController from "./StageController";
import StageMap from "./StageMap";

interface ReservationStageProps {
  selectedArea: string | "main";
  selectedSeats: ReadonlyMap<string, Seat>;
  handleToggleSeat: (seatId: string, data: Seat) => void;
  handleChangeArea: (area: string | "main") => void;
}

export default function ReservationStage({
  handleToggleSeat,
  handleChangeArea,
  selectedArea,
  selectedSeats,
}: ReservationStageProps) {
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 800,
    height: 620,
  });
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeats(() => generateSeats());
  }, []);

  const handleZoomIn = () => {
    setViewBox((prev) => ({
      x: prev.x + prev.width * 0.1,
      y: prev.y + prev.height * 0.1,
      width: prev.width * 0.8,
      height: prev.height * 0.8,
    }));
  };

  const handleZoomOut = () => {
    setViewBox((prev) => {
      const newWidth = Math.min(2000, prev.width * 1.25);
      const newHeight = Math.min(1550, prev.height * 1.25);

      return {
        x: prev.x - (newWidth - prev.width) / 2,
        y: prev.y - (newHeight - prev.height) / 2,
        width: newWidth,
        height: newHeight,
      };
    });
  };

  const handleZoomReset = () => {
    setViewBox({ x: 0, y: 0, width: 800, height: 620 });
  };
  return (
    <div className="flex-1 p-4 overflow-hidden flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col overflow-hidden">
        <StageController
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleZoomReset={handleZoomReset}
        />
        <StageMap
          viewBox={viewBox}
          selectedSeats={selectedSeats}
          seats={seats}
          handleToggleSeat={handleToggleSeat}
        />
      </div>
    </div>
  );
}
