import { api } from "@/lib/api";
import { ResponsePerformances } from "@/types/performance";
import PerformanceInfo from "./PerformanceInfo";
import TicketingControls from "./TicketingControls";

async function getLatestPerformance() {
  const response = await api.get<ResponsePerformances>(
    `/performances?limit=1`,
    { next: { revalidate: 3000 } }
  );

  return response;
}

export default async function TicketingData() {
  const data = await getLatestPerformance();
  const performance = data?.performances[0];

  return (
    <>
      <PerformanceInfo performance={performance} />
      <TicketingControls performance={performance} />
    </>
  );
}
