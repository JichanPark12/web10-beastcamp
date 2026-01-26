interface TimeLogEntry {
  startTime: number | null;
  endTime: number | null;
  duration: number;
}

export interface TimeLogState {
  waitingQueue: TimeLogEntry;
  captcha: TimeLogEntry;
  seatSelection: TimeLogEntry;
}

export interface TimeLogActions {
  startWaitingQueue: () => void;
  endWaitingQueue: () => void;
  startCaptcha: () => void;
  endCaptcha: () => void;
  startSeatSelection: () => void;
  endSeatSelection: () => void;
  resetAllTimers: () => void;
  getTotalDuration: () => number;
}
