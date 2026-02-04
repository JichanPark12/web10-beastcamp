import { ArrowLeft } from "lucide-react";
import NolPerformanceInfo from "./NolPerformanceInfo";
import NolSelectedSeatCount from "./NolSelectedSeatCount";

export default function NolReservationHeader() {
  return (
    <div className="bg-white border-b border-gray-200 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <NolPerformanceInfo />
          </div>
          <div className="flex items-center gap-3">
            <NolSelectedSeatCount />
          </div>
        </div>
      </div>
    </div>
  );
}
