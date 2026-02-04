/* eslint-disable @next/next/no-img-element */

import { nolGradeInfo } from "@/app/reservations/_source/data/seat";

import {
  useNolBlockSeatQuery,
  useNolReservedSeatQuery,
  useNolSeatMetaQuery,
} from "@/app/reservations/_source/queries/seat";
import {
  NolBlockArea,
  NolSeat,
} from "@/app/reservations/_source/types/reservationType";

interface StageMapProps {
  contentRef: React.Ref<HTMLDivElement>;
  containerRef: React.Ref<HTMLDivElement>;
  isMinScale: boolean;
  selectedSeats: ReadonlyMap<string, NolSeat>;
  moveTo: (
    targetX: number,
    targetY: number,
    newScale: number,
    w: number,
    h: number,
  ) => void;
  handleToggleSeat: (seatId: string, data: NolSeat) => void;
  handleWheel: (e: React.WheelEvent, rect?: DOMRect) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}

export default function NolStageMap({
  contentRef,
  containerRef,
  isMinScale,
  selectedSeats,
  moveTo,
  handleToggleSeat,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
}: StageMapProps) {
  const { data: reservedSeats } = useNolReservedSeatQuery();
  const { data: blocks } = useNolBlockSeatQuery();
  const { data: seats } = useNolSeatMetaQuery();

  const releasedSeatSet = new Set(
    reservedSeats
      .map((b) =>
        b.seats
          .filter((s) => s.statusInfo === "RELEASED")
          .map((s) => s.seatInfoId),
      )
      .flat(),
  );

  const onSectionClick = (block: NolBlockArea) => {
    const centerX = (block.absoluteLeft + block.absoluteRight) / 2;
    const centerY = (block.absoluteTop + block.absoluteBottom) / 2;

    moveTo(centerX, centerY, 6, 510, 435); // 나중에 svg 동적으로 변경 할 예정 아마도..;
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative h-full w-full bg-[#EDEFF3] rounded-lg overflow-hidden min-w-0"
    >
      <div
        ref={contentRef}
        className=" relative w-full h-full flex items-center justify-center"
        style={{
          transformOrigin: "0 0",
        }}
      >
        <div className="relative w-127.5 h-108.75">
          {isMinScale ? (
            <img
              className="absolute inset-0 w-full h-full select-none pointer-events-none z-30"
              src="494b5ac0ae674853956bb73037051895.svg"
              alt=""
            />
          ) : (
            <img
              className="absolute inset-0 w-full h-full select-none pointer-events-none"
              src={"/7079e87b843d4852a5ee78d9fd346c19.svg"}
              alt="좌석배치도"
            />
          )}

          <svg
            className={`absolute inset-0 w-full h-full ${
              isMinScale ? "pointer-events-none" : "pointer-events-auto"
            }`}
            viewBox="0 0 510 435"
          >
            {seats?.map((b) => (
              <g key={b.blockKey} id={b.blockKey}>
                {b.seats.map((seat) => {
                  const isSelected = selectedSeats.has(seat.seatInfoId);

                  return (
                    <circle
                      key={seat.seatInfoId}
                      cx={seat.posLeft}
                      cy={seat.posTop}
                      r={1}
                      fill={
                        isSelected
                          ? "#FF0000"
                          : releasedSeatSet.has(seat.seatInfoId)
                            ? nolGradeInfo[seat.seatGrade]?.fillColor ||
                              "#7c68ee"
                            : "#EDEFF3"
                      }
                      stroke={
                        isSelected
                          ? "#FF0000"
                          : releasedSeatSet.has(seat.seatInfoId)
                            ? "#000"
                            : "#EDEFF3"
                      }
                      strokeWidth={isSelected ? 0.3 : 0.1}
                      className={
                        releasedSeatSet.has(seat.seatInfoId)
                          ? "cursor-pointer hover:r-2"
                          : ""
                      }
                      style={{ pointerEvents: "auto" }}
                      onClick={() => {
                        if (!releasedSeatSet.has(seat.seatInfoId)) return;
                        handleToggleSeat(seat.seatInfoId, seat);
                      }}
                    />
                  );
                })}
              </g>
            ))}
          </svg>

          <svg
            className={`absolute inset-0 w-full h-full ${
              isMinScale ? "pointer-events-none" : "pointer-events-auto"
            }`}
            viewBox="0 0 510 435"
          >
            {seats?.map((b) => (
              <g key={b.blockKey} id={b.blockKey}>
                {b.seats.map((seat) => {
                  const isSelected = selectedSeats.has(seat.seatInfoId);

                  return (
                    <circle
                      key={seat.seatInfoId}
                      cx={seat.posLeft}
                      cy={seat.posTop}
                      r={1}
                      fill={
                        isSelected
                          ? "#FF0000"
                          : releasedSeatSet.has(seat.seatInfoId)
                            ? nolGradeInfo[seat.seatGrade]?.fillColor ||
                              "#7c68ee"
                            : "#EDEFF3"
                      }
                      stroke={
                        isSelected
                          ? "#FF0000"
                          : releasedSeatSet.has(seat.seatInfoId)
                            ? "#000"
                            : "#EDEFF3"
                      }
                      strokeWidth={isSelected ? 0.3 : 0.1}
                      className={
                        releasedSeatSet.has(seat.seatInfoId)
                          ? "cursor-pointer hover:r-2"
                          : ""
                      }
                      style={{ pointerEvents: "auto" }}
                      onClick={() => {
                        if (!releasedSeatSet.has(seat.seatInfoId)) return;
                        handleToggleSeat(seat.seatInfoId, seat);
                      }}
                    />
                  );
                })}
              </g>
            ))}
          </svg>
          <svg
            className={`absolute inset-0 w-full h-full ${
              isMinScale ? "pointer-events-auto" : "pointer-events-none"
            }`}
            viewBox="0 0 510 435"
          >
            {isMinScale &&
              blocks?.map((block) => {
                const width = block.absoluteRight - block.absoluteLeft;
                const height = block.absoluteBottom - block.absoluteTop;

                return (
                  <g
                    key={block.blockKey}
                    className="cursor-pointer group"
                    onClick={() => onSectionClick(block)}
                  >
                    <rect
                      x={block.absoluteLeft}
                      y={block.absoluteTop}
                      width={width}
                      height={height}
                      fill="rgba(255, 255, 255, 0.01)"
                    />
                  </g>
                );
              })}
          </svg>
        </div>
      </div>
    </div>
  );
}
