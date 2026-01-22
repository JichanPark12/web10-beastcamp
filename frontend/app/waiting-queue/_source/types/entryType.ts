export interface EntryResponse {
  userId: string;
  position: number;
}

export interface CurrentQueueResponse {
  position: number;
  token?: string;
}
