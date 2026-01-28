import { SiteTraffic, TrafficDataPoint } from '@/types/traffic';
import { SITE_COLORS, ACTIVE_SITES } from './trafficConfig';

export function generateMockTrafficData(): SiteTraffic[] {
  const now = new Date();
  const sites: SiteTraffic[] = [];

  ACTIVE_SITES.forEach((siteKey) => {
    const config = SITE_COLORS[siteKey];
    const data: TrafficDataPoint[] = [];

    // 최근 24시간 데이터 생성
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: time.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        concurrentUsers: Math.floor(Math.random() * 50000) + 10000,
      });
    }

    sites.push({
      site: siteKey,
      displayName: config.displayName,
      color: config.color,
      backgroundColor: config.backgroundColor,
      borderColor: config.borderColor,
      textColor: config.textColor,
      data,
      currentConcurrentUsers: Math.floor(Math.random() * 50000) + 20000,
    });
  });

  return sites;
}
