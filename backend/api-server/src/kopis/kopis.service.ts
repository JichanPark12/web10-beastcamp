import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';
import {
  KopisApiResponse,
  KopisPerformance,
  KopisPerformanceDetail,
} from './interfaces/kopis.interfaces';
import { Performance } from '../performances/entities/performance.entity';

@Injectable()
export class KopisService {
  private readonly logger = new Logger(KopisService.name);

  private readonly SERVICE_KEY: string =
    process.env.KOPIS_SERVICE_KEY || 'test-key';
  private readonly KOPIS_URL: string =
    'https://www.kopis.or.kr/openApi/restful';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  private readonly xmlParser = new XMLParser();

  private readonly venueCodes = [
    'FC001837-02',
    'FC001247-01',
    'FC001837-04',
    'FC003347',
    'FC001837-05',
    'FC001901',
    'FC003670',
    'FC003577',
  ];

  constructor(private readonly httpService: HttpService) {}

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  private getKopisDateRange() {
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    return {
      stdate: this.formatDate(today),
      eddate: this.formatDate(endOfYear),
    };
  }

  /**
   * KOPIS API의 한국어 플랫폼명을 영문 플랫폼 코드로 변환
   * @param relatenm KOPIS API의 예매처 이름 (예: "예스24", "인터파크", "멜론티켓")
   * @returns 영문 플랫폼 코드 또는 null (지원되지 않는 플랫폼)
   */
  private convertPlatform(
    relatenm: string,
  ): 'yes24' | 'interpark' | 'melon-ticket' | null {
    const platformMap: Record<string, 'yes24' | 'interpark' | 'melon-ticket'> =
      {
        예스24: 'yes24',
        인터파크: 'interpark',
        멜론티켓: 'melon-ticket',
      };

    return platformMap[relatenm] || null;
  }

  /**
   * XML 파싱 및 데이터 추출
   */
  private parseKopisXml<T>(xmlData: string): T[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const parsedJson: unknown = this.xmlParser.parse(xmlData);

    if (!this.isKopisApiResponse(parsedJson)) {
      // 구조가 맞지 않으면 빈 배열 반환
      return [];
    }

    const dbData = parsedJson.dbs?.db;
    if (!dbData) return [];

    return (Array.isArray(dbData) ? dbData : [dbData]) as T[];
  }

  /**
   * KOPIS 공연 목록 조회
   */
  async getPerformancesFromKopis(): Promise<KopisPerformance[]> {
    try {
      const { stdate, eddate } = this.getKopisDateRange();

      const promises = this.venueCodes.map((venueCode) =>
        this.fetchVenuePerformances(venueCode, stdate, eddate),
      );

      const results = await Promise.all(promises);
      return results.flat();
    } catch (error) {
      this.logger.error(`전체 조회 프로세스 실패: ${error}`);
      throw new InternalServerErrorException('KOPIS 데이터 수집 실패');
    }
  }

  /**
   * 단일 공연장의 공연 목록 조회
   */
  private async fetchVenuePerformances(
    venueCode: string,
    stdate: string,
    eddate: string,
  ): Promise<KopisPerformance[]> {
    try {
      const url = `${this.KOPIS_URL}/pblprfr`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const response$ = this.httpService.get<string>(url, {
        params: {
          service: this.SERVICE_KEY,
          stdate,
          eddate,
          rows: 100,
          cpage: 1,
          prfplccd: venueCode,
        },
        responseType: 'text',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await lastValueFrom(response$);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const items = this.parseKopisXml<KopisPerformance>(response.data);

      return items.filter((item) => item?.prfstate?.trim() !== '공연완료');
    } catch (error) {
      this.logger.error(
        `공연장(${venueCode}) 조회 실패: ${error instanceof Error ? error.message : error}`,
      );
      return [];
    }
  }

  /**
   * 공연 상세 조회
   */
  async getPerformanceDetailsFromKopis(
    performanceId: string,
  ): Promise<KopisPerformanceDetail | null> {
    try {
      const url = `${this.KOPIS_URL}/pblprfr/${performanceId}`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const response$ = this.httpService.get<string>(url, {
        params: { service: this.SERVICE_KEY },
        responseType: 'text',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await lastValueFrom(response$);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const items = this.parseKopisXml<KopisPerformanceDetail>(response.data);
      const detail = items[0]; // 상세 조회는 항상 1개라고 가정

      if (!detail) {
        this.logger.warn(`상세 정보 없음 - ID: ${performanceId}`);
        return null;
      }

      // 인스파이어 아레나 필터링
      if (detail.mt10id === 'FC003670' && !detail.fcltynm.includes('아레나')) {
        return null;
      }

      // 플랫폼 필터링: 지원되는 플랫폼이 없으면 null 반환
      if (!this.hasSupportedPlatform(detail)) {
        this.logger.debug(
          `지원되지 않는 플랫폼 - ID: ${performanceId}, 플랫폼: ${this.extractPlatformNames(detail)}`,
        );
        return null;
      }

      // relates 배열에서 지원되지 않는 플랫폼 제거
      this.filterSupportedPlatforms(detail);

      return detail;
    } catch (error) {
      this.logger.error(
        `상세 조회 실패: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }

  /**
   * 공연 상세 정보에 지원되는 플랫폼이 있는지 확인
   */
  private hasSupportedPlatform(detail: KopisPerformanceDetail): boolean {
    if (!detail.relates?.relate) return false;

    const relates = Array.isArray(detail.relates.relate)
      ? detail.relates.relate
      : [detail.relates.relate];

    return relates.some((relate) => this.convertPlatform(relate.relatenm));
  }

  /**
   * 디버깅용: 플랫폼명 추출
   */
  private extractPlatformNames(detail: KopisPerformanceDetail): string {
    if (!detail.relates?.relate) return '없음';

    const relates = Array.isArray(detail.relates.relate)
      ? detail.relates.relate
      : [detail.relates.relate];

    return relates.map((r) => r.relatenm).join(', ');
  }

  /**
   * relates 배열에서 지원되지 않는 플랫폼 제거하고 우선순위가 가장 높은 플랫폼만 남김 (in-place 수정)
   * relatenm을 영문 플랫폼 코드로 변환
   */
  private filterSupportedPlatforms(detail: KopisPerformanceDetail): void {
    if (!detail.relates?.relate) return;

    const relates = Array.isArray(detail.relates.relate)
      ? detail.relates.relate
      : [detail.relates.relate];

    // 우선순위 순서
    const priorityOrder: Array<'yes24' | 'interpark' | 'melon-ticket'> = [
      'interpark',
      'melon-ticket',
      'yes24',
    ];

    // 우선순위가 가장 높은 플랫폼 찾기
    for (const priorityPlatform of priorityOrder) {
      for (const relate of relates) {
        const platform = this.convertPlatform(relate.relatenm);
        if (platform === priorityPlatform) {
          // 우선순위가 가장 높은 플랫폼 하나만 설정하고, relatenm을 영문 코드로 변환
          detail.relates.relate = {
            ...relate,
            relatenm: platform, // 한국어 → 영문 코드 변환
          };
          return;
        }
      }
    }

    // 지원되는 플랫폼이 없으면 undefined
    detail.relates.relate = undefined;
  }

  /**
   * 공연 상세 정보에서 우선순위에 따라 플랫폼 코드 반환
   * 주의: filterSupportedPlatforms()를 먼저 호출해야 함 (relatenm이 이미 영문 코드로 변환됨)
   * 우선순위: 인터파크 > 멜론티켓 > 예스24
   */
  getSupportedPlatform(
    detail: KopisPerformanceDetail,
  ): 'yes24' | 'interpark' | 'melon-ticket' | null {
    if (!detail.relates?.relate) return null;

    // filterSupportedPlatforms()에서 이미 단일 객체로 변환했으므로 배열이 아님
    const relate = detail.relates.relate;

    // 배열이 아닌 경우에만 처리 (filterSupportedPlatforms에서 단일 객체로 변환됨)
    if (Array.isArray(relate)) {
      return null;
    }

    // relatenm이 이미 영문 코드로 변환되어 있음
    const platform = relate.relatenm;

    // 유효한 플랫폼인지 확인
    if (
      platform === 'yes24' ||
      platform === 'interpark' ||
      platform === 'melon-ticket'
    ) {
      return platform;
    }

    return null;
  }

  /**
   * KopisPerformanceDetail을 Performance Entity로 변환
   */
  toPerformanceEntity(detail: KopisPerformanceDetail): Performance {
    const performance = new Performance();

    performance.kopisId = detail.mt20id;
    performance.performanceName = detail.prfnm;
    performance.posterUrl = detail.poster;

    const ticketingDate = this.parseKopisDate(detail.prfpdfrom);
    performance.ticketingDate = ticketingDate ?? new Date();

    const platform = this.getSupportedPlatform(detail);
    performance.platform = platform ?? 'nol-ticket';

    return performance;
  }

  /**
   * KOPIS 날짜 형식(YYYY.MM.DD)을 Date 객체로 변환
   */
  private parseKopisDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.split('.');
      if (parts.length !== 3) return null;

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * dtguidance 파싱하여 공연 세션 일정 생성
   * 예: "토요일(18:00), 일요일(15:00)" -> [토요일 18:00, 일요일 15:00]
   *
   * @param detail KOPIS 공연 상세 정보
   * @returns 공연 세션 일정 배열
   */
  parseSessionDates(detail: KopisPerformanceDetail): Date[] {
    const sessions: Date[] = [];

    const startDate = this.parseKopisDate(detail.prfpdfrom);
    const endDate = this.parseKopisDate(detail.prfpdto);

    if (!startDate || !endDate) {
      return sessions;
    }

    // dtguidance 파싱: "토요일(18:00), 일요일(15:00)" 형식
    const dtguidance = detail.dtguidance || '';

    // 요일과 시간 추출: 정규식으로 "요일(시간)" 패턴 찾기
    const pattern = /(월|화|수|목|금|토|일)요일\((\d{1,2}):(\d{2})\)/g;
    const matches = [...dtguidance.matchAll(pattern)];

    if (matches.length === 0) {
      // 파싱 실패 시 시작일 19:00로 기본 세션 하나 생성
      const defaultSession = new Date(startDate);
      defaultSession.setHours(19, 0, 0, 0);
      sessions.push(defaultSession);
      return sessions;
    }

    const dayMap: Record<string, number> = {
      일: 0,
      월: 1,
      화: 2,
      수: 3,
      목: 4,
      금: 5,
      토: 6,
    };

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // 현재 요일에 해당하는 공연 시간 찾기
      for (const match of matches) {
        const [, day, hour, minute] = match;
        if (dayMap[day] === dayOfWeek) {
          const sessionDate = new Date(currentDate);
          sessionDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
          sessions.push(sessionDate);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }

  private isKopisApiResponse(obj: unknown): obj is KopisApiResponse {
    if (typeof obj !== 'object' || obj === null) return false;
    return 'dbs' in obj;
  }
}
