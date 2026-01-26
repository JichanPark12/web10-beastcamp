import { create } from "zustand";
import { TimeLogActions, TimeLogState } from "../types/time";

const calculateDuration = (
  startTime: number | null,
  endTime: number | null,
): number => {
  if (startTime && endTime) {
    return (endTime - startTime) / 1000;
  }
  return 0;
};

export const useTimeLogStore = create<TimeLogState & TimeLogActions>(
  (set, get) => ({
    waitingQueue: { startTime: null, endTime: null, duration: 0 },
    captcha: { startTime: null, endTime: null, duration: 0 },
    seatSelection: { startTime: null, endTime: null, duration: 0 },

    startWaitingQueue: () =>
      set((state) => ({
        waitingQueue: { ...state.waitingQueue, startTime: Date.now() },
      })),
    endWaitingQueue: () =>
      set((state) => {
        const endTime = Date.now();
        const duration = calculateDuration(
          state.waitingQueue.startTime,
          endTime,
        );
        return {
          waitingQueue: { ...state.waitingQueue, endTime, duration },
        };
      }),

    startCaptcha: () =>
      set((state) => ({
        captcha: { ...state.captcha, startTime: Date.now() },
      })),
    endCaptcha: () =>
      set((state) => {
        const endTime = Date.now();
        const duration = calculateDuration(state.captcha.startTime, endTime);
        return {
          captcha: { ...state.captcha, endTime, duration },
        };
      }),

    startSeatSelection: () =>
      set((state) => ({
        seatSelection: { ...state.seatSelection, startTime: Date.now() },
      })),
    endSeatSelection: () =>
      set((state) => {
        const endTime = Date.now();
        const duration = calculateDuration(
          state.seatSelection.startTime,
          endTime,
        );
        return {
          seatSelection: { ...state.seatSelection, endTime, duration },
        };
      }),

    resetAllTimers: () =>
      set({
        waitingQueue: { startTime: null, endTime: null, duration: 0 },
        captcha: { startTime: null, endTime: null, duration: 0 },
        seatSelection: { startTime: null, endTime: null, duration: 0 },
      }),

    getTotalDuration: () => {
      const { waitingQueue, captcha, seatSelection } = get();
      return waitingQueue.duration + captcha.duration + seatSelection.duration;
    },
  }),
);
