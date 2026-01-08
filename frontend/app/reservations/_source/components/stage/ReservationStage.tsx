import { Seat } from "../../types/reservationType";
import { Suspense } from "react";
import StageController from "./StageController";
import { useZoomPan } from "../../hooks/useZoomPan";
import { ErrorBoundary } from "react-error-boundary";

import dynamic from "next/dynamic";

const StageMap = dynamic(() => import("./StageMap"), {
  ssr: false,
  loading: () => <div>좌석 데이터를 불러오는 중입니다.</div>,
});

interface ReservationStageProps {
  selectedSeats: ReadonlyMap<string, Seat>;
  handleToggleSeat: (seatId: string, data: Seat) => void;
}

export default function ReservationStage({
  handleToggleSeat,
  selectedSeats,
}: ReservationStageProps) {
  const {
    containerRef,
    contentRef,
    isMinScale,
    zoomIn,
    zoomOut,
    reset,
    moveTo,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useZoomPan({
    minScale: 1,
    maxScale: 5,
    initialScale: 1,
  });

  return (
    <div className="flex-1 p-4 overflow-hidden flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col overflow-hidden">
        <StageController
          handleZoomIn={zoomIn}
          handleZoomOut={zoomOut}
          handleZoomReset={reset}
        />
        <ErrorBoundary
          fallback={<div>좌석 정보를 불러오는 중 오류가 발생했습니다.</div>}
        >
          <Suspense fallback={<div>좌석 데이터를 불러오는 중입니다.</div>}>
            <StageMap
              moveTo={moveTo}
              contentRef={contentRef}
              containerRef={containerRef}
              isMinScale={isMinScale}
              handleWheel={handleWheel}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              selectedSeats={selectedSeats}
              handleToggleSeat={handleToggleSeat}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
