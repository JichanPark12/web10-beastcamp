import { Calendar } from "@/components/ui/calendar";
import { isSunday } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { Session } from "@/types/performance";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  sessions?: Session[];
}

export default function DateSelector({
  selectedDate,
  onDateSelect,
  sessions,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const availableDates =
    sessions?.map((s) => new Date(s.sessionDate).toDateString()) || [];
  const defaultMonth =
    sessions && sessions.length > 0
      ? new Date(sessions[0].sessionDate)
      : undefined;

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
            defaultMonth={defaultMonth}
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
              return !availableDates.includes(date.toDateString());
            }}
          />
        </div>
      )}
    </div>
  );
}
