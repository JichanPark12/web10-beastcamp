export interface QueueToken {
  token: string;
  userId: string;
  position: number;
  estimatedWaitTime: number;
}

export interface QueueStatus {
  isActive: boolean;
  position?: number;
  totalWaiting: number;
}
