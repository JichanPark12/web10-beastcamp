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
    { label: "분", value: timeLeft.minutes },
    { label: "초", value: timeLeft.seconds },
  ];

  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="w-5 h-5" />
        <span className="text-sm text-white/80">티켓팅 시작까지</span>
      </div>
      <div className="grid grid-cols-2 gap-3 ">
        {timeUnits.map((item, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3"
          >
            {/* csr ssr시간의 차이가 1초정도 남 => 하이드레이션 미스매칭문제 발생 => 1초의 차이때문에 화면 깜빡임이 존재할 이유는 없다 판단해서 에러 경고 무시를 넣음 */}
            <div className="text-2xl md:text-3xl" suppressHydrationWarning>
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-white/70 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
