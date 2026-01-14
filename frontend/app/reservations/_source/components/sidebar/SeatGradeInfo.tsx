import { gradeInfo } from "../../data/seat";

export default function SeatGradeInfo() {
  return (
    <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
      <h4 className="text-sm mb-3">좌석 등급 & 가격</h4>
      <div className="space-y-2">
        {Object.entries(gradeInfo).map(([key, info]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: info.fillColor }}
              ></div>
              <span className="text-sm text-gray-700">{info.name}</span>
            </div>
            <span className="text-sm text-gray-600">
              {info.price.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
