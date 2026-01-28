import { SiteTraffic } from '@/types/traffic';

interface Props {
  sites: SiteTraffic[];
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

export function TrafficSummaryCards({ sites }: Props) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {sites.map((site) => (
        <div
          key={site.site}
          className={`${site.backgroundColor} rounded-lg p-3 border ${site.borderColor}`}
        >
          <div className={`text-xs ${site.textColor} mb-1`}>
            {site.displayName}
          </div>
          <div className="text-lg font-semibold">
            {formatNumber(site.currentConcurrentUsers)}
          </div>
          <div className="text-xs text-gray-500">현재 접속자</div>
        </div>
      ))}
    </div>
  );
}
