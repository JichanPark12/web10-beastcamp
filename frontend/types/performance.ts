export type TicketPlatform =
  | "nol-ticket"
  | "yes24"
  | "melon-ticket"
  | "interpark"; // deprecated interpark platform

export interface Performance {
  performance_id: number;
  performance_name: string;
  ticketing_date: string;
  platform: TicketPlatform;
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
