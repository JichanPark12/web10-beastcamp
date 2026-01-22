import { api } from "@/lib/api/api";
import { VenueDetail, BlockGrade, Grade } from "@/types/venue";

export async function getVenue(venueId: number) {
  if (!venueId) return null;
  const response = await api.get<VenueDetail>(`/venues/${venueId}`, {
    next: {
      tags: ["venue", `venue-${venueId}`],
    },
    cache: "force-cache",
  });
  return response;
}

export async function getBlockGrades(sessionId: number) {
  if (!sessionId) return [];
  const response = await api.get<BlockGrade[]>(
    `/sessions/${sessionId}/block-grades`,
    {
      next: {
        tags: ["block-grades", `session-${sessionId}-grades`],
      },
      cache: "force-cache",
    },
  );
  return response;
}

export async function getGradeInfo(sessionId: number) {
  if (!sessionId) return [];
  const response = await api.get<Grade[]>(`/sessions/${sessionId}/grades`, {
    next: {
      tags: ["grades", `session-${sessionId}-grades`],
    },
    cache: "force-cache",
  });
  return response;
}
