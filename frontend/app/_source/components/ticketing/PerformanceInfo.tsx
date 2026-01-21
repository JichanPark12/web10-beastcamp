import { Performance, Session } from '@/types/performance';
import { Calendar, MapPin, TrendingUp } from 'lucide-react';

interface PerformanceInfoProps {
  performance: Performance;
  sessions?: Session[];
  venueName?: string;
}

export default function PerformanceInfo({
  performance,
  sessions,
  venueName,
}: PerformanceInfoProps) {
  let dateDisplay = '';

  if (sessions && sessions.length > 0) {
    const dates = sessions.map((s) => new Date(s.sessionDate).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const formatDate = (d: Date) =>
      d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    if (minDate.getTime() === maxDate.getTime()) {
      dateDisplay = formatDate(minDate);
    } else {
      dateDisplay = `${formatDate(minDate)} ~ ${formatDate(maxDate)}`;
    }
  }

  const platformDisplayName = {
    interpark: '인터파크',
    yes24: 'YES24',
    'melon-ticket': '멜론티켓',
  }[performance.platform];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '상':
        return 'bg-red-500/90 text-white';
      case '중':
        return 'bg-yellow-500/90 text-white';
      case '하':
        return 'bg-green-500/90 text-white';
      default:
        return 'bg-white/20 text-white';
    }
  };

  return (
    <div className="h-full flex flex-col justify-center w-full">
      <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
        <span className="text-sm">다음 티켓팅</span>
      </div>

      <h2 className="text-3xl md:text-4xl mb-4">
        {performance.performance_name}
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white/80" />
          <span>
            {dateDisplay || (
              <span className="animate-pulse bg-white/20 rounded h-5 w-48 inline-block" />
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-white/80" />
          <span>
            {venueName || (
              <span className="animate-pulse bg-white/20 rounded h-5 w-32 inline-block" />
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
          콘서트
        </span>
        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
          {platformDisplayName}
        </span>
        <span
          className={`${getDifficultyColor('상')} px-3 py-1 rounded-lg text-sm flex items-center gap-1`}
        >
          <TrendingUp className="w-4 h-4" />
          난이도: 상
        </span>
      </div>
    </div>
  );
}
