import { getLatestPerformance, getSessions } from '@/services/performance';
import { getVenue } from '@/services/venue';
import Yes24PerformanceDetail from './Yes24PerformanceDetail';

export default async function Yes24PerformanceDetailData() {
  const performance = await getLatestPerformance();
  const sessions = performance
    ? await getSessions(performance.performance_id)
    : [];
  const venueId = sessions.length > 0 ? sessions[0].venueId : 0;
  const venue = venueId ? await getVenue(venueId) : null;

  if (!performance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">공연 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <Yes24PerformanceDetail
      performance={performance}
      sessions={sessions}
      venueName={venue?.venueName || '수원월드컵경기장 전시홀'}
    />
  );
}
