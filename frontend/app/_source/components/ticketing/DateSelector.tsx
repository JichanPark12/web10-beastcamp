import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

interface DateSelectorProps {
  selectedDate: number | null;
  onDateSelect: (day: number) => void;
  performanceDate?: string;
}

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
};

export default function DateSelector({
  selectedDate,
  onDateSelect,
  performanceDate,
}: DateSelectorProps) {
  // performanceDate가 있으면 그 월로, 없으면 2026년 1월
  const getInitialMonth = () => {
    if (performanceDate) {
      const date = new Date(performanceDate);
      return new Date(date.getFullYear(), date.getMonth());
    }
    return new Date(2026, 0);
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const [isOpen, setIsOpen] = useState(true);

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  // performanceDate에서 날짜 추출
  const performanceDay = performanceDate
    ? new Date(performanceDate).getDate()
    : null;
  const performanceMonth = performanceDate
    ? new Date(performanceDate).getMonth()
    : null;
  const performanceYear = performanceDate
    ? new Date(performanceDate).getFullYear()
    : null;

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (day: number) => {
    // 현재 달력의 년/월이 performance 년/월과 같고, 날짜도 일치할 때만 선택 가능
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();

    // performanceDate가 없으면 선택 불가
    if (
      performanceYear === null ||
      performanceMonth === null ||
      performanceDay === null
    ) {
      return;
    }

    // 년, 월, 일이 모두 일치해야만 선택 가능
    if (
      performanceYear === currentYear &&
      performanceMonth === currentMonthIndex &&
      performanceDay === day
    ) {
      onDateSelect(day);
    }
  };

  return (
    <div className="mb-4 bg-white rounded-xl p-4 text-gray-900">
      <div
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-base">관람일</h3>
        <ChevronUp
          className={`w-5 h-5 transition-transform ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </div>

      {isOpen && (
        <>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm">
              {currentMonth.getFullYear()}.{" "}
              {String(currentMonth.getMonth() + 1).padStart(2, "0")}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center text-xs py-1 ${
                  index === 0
                    ? "text-red-500"
                    : index === 6
                    ? "text-blue-500"
                    : "text-gray-600"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const currentYear = currentMonth.getFullYear();
              const currentMonthIndex = currentMonth.getMonth();

              const isAvailable =
                performanceYear !== null &&
                performanceMonth !== null &&
                performanceDay !== null &&
                performanceYear === currentYear &&
                performanceMonth === currentMonthIndex &&
                performanceDay === day;

              const isSelected = selectedDate === day;
              const dayOfWeek = (firstDay + i) % 7;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={!isAvailable}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white scale-110"
                      : isAvailable
                      ? "hover:bg-blue-50 cursor-pointer bg-blue-100"
                      : "cursor-not-allowed"
                  } ${
                    !isAvailable
                      ? "text-gray-300"
                      : dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                      ? "text-blue-500"
                      : "text-gray-900"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
