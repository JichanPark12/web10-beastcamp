import PerformanceInfo from "./PerformanceInfo";
import TicketingControls from "./TicketingControls";
import { api } from "@/lib/api";
import { ResponsePerformances } from "@/types/performance";

async function getLatestPerformance() {
  try {
    const response = await api.get<ResponsePerformances>(
      `/api/mock/performances?limit=1`
    );
    return response;
  } catch (e) {
    console.log(e);
  }
}

export default async function Ticketing() {
  const data = await getLatestPerformance();
  const performance = data?.performances[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <PerformanceInfo performance={performance} />
          <TicketingControls performance={performance} />
        </div>
      </div>
    </main>
  );
}
