import { useMemo } from 'react';
import { generateMockTrafficData } from '../components/traffic/mockData';
import { SiteTraffic } from '@/types/traffic';

// 백엔드 API 완성 후 useTrafficData 훅을 임포트하여 사용
// import { useTrafficData } from '../queries/traffic';

interface UseTrafficResult {
  sites: SiteTraffic[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useTraffic = (useMockData: boolean = true): UseTrafficResult => {
  // 백엔드 API 완성 후 아래 주석을 해제하고 사용
  // const { data, isLoading, isError, error } = useTrafficData();

  // 현재는 Mock 데이터만 사용 (백엔드 대기 중)
  const mockSites = useMemo(() => generateMockTrafficData(), []);

  if (useMockData) {
    return {
      sites: mockSites,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  // 백엔드 API 완성 후 아래 코드 사용
  // return {
  //   sites: data?.sites ?? [],
  //   isLoading,
  //   isError,
  //   error: error as Error | null,
  // };

  // 현재는 Mock 데이터 반환
  return {
    sites: mockSites,
    isLoading: false,
    isError: false,
    error: null,
  };
};
