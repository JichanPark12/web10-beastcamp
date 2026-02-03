export type TicketPlatform =
  | "nol-ticket"
  | "yes24"
  | "melon-ticket"
  | "interpark"; // deprecated interpark platform

export interface Performance {
  performance_id: number;
  performance_name: string;
  poster_url: string | null;
  ticketing_date: string;
  platform: TicketPlatform;
  platform_ticketing_url: string | null;
  cast_info: string | null;
  runtime: string | null;
  age_limit: string | null;
}

export interface Session {
  id: number;
  performanceId: number;
  venueId: number;
  sessionDate: string;
}

export interface ResponsePerformances {
  performances: Performance[];
}
