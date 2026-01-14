import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { isSunday } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  performanceDate?: string;
}

export default function DateSelector({
  selectedDate,
  onDateSelect,
  performanceDate,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const pDate = performanceDate ? new Date(performanceDate) : undefined;

  return (
    <div className="mb-4 bg-white rounded-xl p-4 text-gray-900 min-w-80">
      <div
        className="flex items-center justify-between cursor-pointer"
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
        <div className="flex justify-center mt-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onDateSelect(date)}
            className="rounded-md border shadow-sm border-"
            defaultMonth={pDate}
            locale={ko}
            classNames={{
              weekdays: "flex bg-gray-50 p-1 rounded-r-full rounded-l-full",
              day_button:
                "!bg-transparent focus:!ring-0 focus:!outline-none transition-none",
              selected: "!bg-blue-500 !rounded-full ",
            }}
            modifiers={{
              isSunday: (date) => isSunday(date),
            }}
            modifiersClassNames={{
              isSunday: "text-red-500",
            }}
            disabled={(date) => {
              if (!pDate) return true;
              return (
                date.getFullYear() !== pDate.getFullYear() ||
                date.getMonth() !== pDate.getMonth() ||
                date.getDate() !== pDate.getDate()
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
