export interface Performance {
  performance_id: number;
  performance_name: string;
  ticketing_date: string;
  performance_date: string;
  venue_id: number;
  venue_name: string;
}

export interface ResponsePerformances {
  performances: Performance[];
}
