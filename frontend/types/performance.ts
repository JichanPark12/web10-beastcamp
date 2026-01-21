export interface Performance {
  performance_id: number;
  performance_name: string;
  ticketing_date: string;
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
