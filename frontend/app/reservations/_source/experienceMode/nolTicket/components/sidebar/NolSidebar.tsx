import NolSelectedSeatsList from "./NolSelectedSeatsList";
import NolPriceSummary from "./NolPriceSummary";
import NolReserveButton from "./NolReserveButton";
import NolSeatGradeInfo from "./NolSeatGradeInfo";

export default function NolSidebar() {
  return (
    <div className="w-120 bg-white border-l border-gray-200 p-6 overflow-auto">
      <div className="mb-6 font-bold text-lg text-gray-800 border-b pb-2">
        좌석 등급/가격
      </div>
      <NolSeatGradeInfo />
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">선택 좌석</h3>
        <NolSelectedSeatsList />
      </div>
      <NolPriceSummary />
      <NolReserveButton />
      <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        * 본 페이지는 체험 모드입니다.
      </div>
    </div>
  );
}
