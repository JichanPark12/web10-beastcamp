import { TraceService } from "./trace.service";

export type PubSubPayload = {
  userId: string;
  traceId?: string;
  isVirtual?: boolean;
};

export const parsePubSubPayload = (message: string): PubSubPayload => {
  try {
    const parsed = JSON.parse(message) as {
      userId?: unknown;
      traceId?: unknown;
    };
    if (parsed && typeof parsed === "object") {
      const userId =
        typeof parsed.userId === "string" ? parsed.userId : undefined;
      const traceId =
        typeof parsed.traceId === "string" ? parsed.traceId : undefined;

      if (userId) {
        return { userId, traceId, isVirtual: userId.startsWith("V_") };
      }
    }
  } catch {
    // JSON이 아닌 평문 메시지인 경우 폴백으로 진행
  }

  return { userId: message, isVirtual: message.startsWith("V_") };
};

export const runWithPubSubContext = async <T>(
  traceService: TraceService,
  message: string,
  handler: (payload: PubSubPayload) => Promise<T> | T
): Promise<T> => {
  const payload = parsePubSubPayload(message);
  const traceId = payload.traceId || traceService.generateTraceId();

  return traceService.runWithTraceId(traceId, () => handler(payload));
};
