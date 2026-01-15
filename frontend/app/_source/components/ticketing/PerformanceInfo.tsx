import { Performance } from "@/types/performance";
import { Calendar, MapPin, DollarSign, TrendingUp } from "lucide-react";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "상":
      return "bg-red-100 text-red-700";
    case "중":
      return "bg-yellow-100 text-yellow-700";
    case "하":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

interface PerformanceInfoProps {
  performance: Performance;
}

export default function PerformanceInfo({ performance }: PerformanceInfoProps) {
  const performanceDate = new Date(performance.performance_date);

  console.log(performanceDate);
  const formattedDate = performanceDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return (
    <div>
      <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
        <span className="text-sm">다음 티켓팅</span>
      </div>

      <h2 className="text-3xl md:text-4xl mb-4">
        {performance.performance_name}
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white/80" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-white/80" />
          <span>{performance.venue_name}</span>
        </div>
      </div>
    </div>
  );
}
