import { api } from "@/lib/api";
import { ResponsePerformances, Session } from "@/types/performance";

export async function getLatestPerformance() {
  const response = await api.get<ResponsePerformances>(
    `/performances?limit=1`,
    {
      next: {
        revalidate: 60,
        tags: ["performance", "latest-performance"],
      },
    }
  );

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
    }
  );

  return response;
}
