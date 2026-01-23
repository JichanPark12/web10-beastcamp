import { Calendar } from '@/components/ui/calendar';
import { isSunday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Session } from '@/types/performance';

interface DetailDateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  sessions?: Session[];
}

export default function DetailDateSelector({
  selectedDate,
  onDateSelect,
  sessions,
}: DetailDateSelectorProps) {
  const availableDates =
    sessions?.map((s) => new Date(s.sessionDate).toDateString()) || [];
  const defaultMonth =
    sessions && sessions.length > 0
      ? new Date(sessions[0].sessionDate)
      : undefined;

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => onDateSelect(date)}
        className="rounded-lg w-2xl"
        defaultMonth={defaultMonth}
        locale={ko}
        classNames={{
          weekdays: 'flex p-1',
          day_button:
            '!bg-transparent focus:!ring-0 focus:!outline-none transition-none hover:bg-purple-50',
          selected:
            '!bg-purple-600 !rounded-lg !text-white hover:!bg-purple-700',
          today: 'border border-purple-300',
        }}
        modifiers={{
          isSunday: (date) => isSunday(date),
        }}
        modifiersClassNames={{
          isSunday: 'text-red-500',
        }}
        disabled={(date) => {
          return !availableDates.includes(date.toDateString());
        }}
      />
    </div>
  );
}
