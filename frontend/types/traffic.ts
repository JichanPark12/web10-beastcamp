// 개별 데이터포인트
export interface TrafficDataPoint {
  timestamp: string;
  concurrentUsers: number;
}

// 사이트별 트래픽 데이터
export interface SiteTraffic {
  site: string;
  displayName: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  data: TrafficDataPoint[];
  currentConcurrentUsers: number;
}

// API 응답
export interface TrafficResponse {
  sites: SiteTraffic[];
  lastUpdated: string;
}

// Recharts 차트 데이터
export interface TrafficChartData {
  timestamp: string;
  [siteKey: string]: number | string;
}
