import { ArrowLeft } from "lucide-react";
import SelectedSeatCount from "./SelectedSeatCount";
import PerformanceInfo from "./PerformanceInfo";

export default function ReservationHeader() {
  return (
    <div className="bg-white border-b border-gray-200 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <PerformanceInfo />
          </div>
          <div className="flex items-center gap-3">
            <SelectedSeatCount />
          </div>
        </div>
      </div>
    </div>
  );
}
