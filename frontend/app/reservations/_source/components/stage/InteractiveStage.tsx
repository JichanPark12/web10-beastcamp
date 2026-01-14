"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";
import StageController from "./StageController";
import { useZoomPan } from "../../hooks/useZoomPan";
import { useReservation } from "../../contexts/ReservationProvider";

const StageMap = dynamic(() => import("./StageMap"), {
  ssr: false,
  loading: () => <div>좌석 데이터를 불러오는 중입니다.</div>,
});

export default function InteractiveStage() {
  const { selectedSeats, handleToggleSeat } = useReservation();
  
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
    <>
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
    </>
  );
}
