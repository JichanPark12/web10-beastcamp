import { Suspense } from "react";
import {
  useReservationData,
  useReservationState,
  useReservationDispatch,
} from "../../contexts/ReservationProvider";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import VenueMap from "./VenueMap";
import { useStageSvg } from "../../hooks/useStageSvg";
import AreaSeatFallback from "./seats/AreaSeatFallback";

const AreaSeats = dynamic(() => import("./seats/AreaSeats"), {
  ssr: false,
});

export default function StageMap() {
  const { venue, blockGrades } = useReservationData();
  const { isShowArea } = useReservationState();
  const { handleSelectArea } = useReservationDispatch();

  const blockMapUrl = venue?.blockMapUrl;
  const { svgContent } = useStageSvg(blockMapUrl);

  return (
    <div className="relative h-full w-full bg-[#EDEFF3] rounded-lg overflow-hidden flex items-center justify-center">
      <div className="relative h-full w-full flex items-center justify-center">
        {isShowArea ? (
          <ErrorBoundary FallbackComponent={AreaSeatFallback}>
            <Suspense>
              <AreaSeats />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <VenueMap
            svgContent={svgContent}
            venue={venue}
            blockGrades={blockGrades}
            onBlockSelect={handleSelectArea}
          />
        )}
      </div>
    </div>
  );
}
