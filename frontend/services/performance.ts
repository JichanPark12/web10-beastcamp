import { api } from "@/lib/api/api";
import { ResponsePerformances, Session } from "@/types/performance";

export async function getLatestPerformance() {
  const response = await api.get<ResponsePerformances>(
    `/performances?limit=1`,
    {
      next: {
        revalidate: 60,
        tags: ["performance", "latest-performance"],
      },
    },
  );

  if (!response.performances || response.performances.length === 0) {
    throw new Error("공연 정보를 찾을 수 없습니다.");
  }

  return response.performances[0];
}

export async function getSessions(performanceId: number) {
  if (!performanceId) return [];
  const response = await api.get<Session[]>(
    `/performances/${performanceId}/sessions`,
    {
      next: {
        revalidate: 60,
        tags: ["performance", `performance-${performanceId}`, "sessions"],
      },
    },
  );

  return response;
}
