import { Clock } from "lucide-react";

interface CountdownTimerProps {
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export default function CountdownTimer({ timeLeft }: CountdownTimerProps) {
  const timeUnits = [
    { label: "일", value: timeLeft.days },
    { label: "시간", value: timeLeft.hours },
    { label: "분", value: timeLeft.minutes },
    { label: "초", value: timeLeft.seconds },
  ];

  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="w-5 h-5" />
        <span className="text-sm text-white/80">티켓팅 시작까지</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {timeUnits.map((item, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3"
          >
            <div className="text-2xl md:text-3xl">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-white/70 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
