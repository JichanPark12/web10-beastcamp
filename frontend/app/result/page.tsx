import TicketResult from "./_source/components/TicketResult";
import { ResultProvider } from "./_source/contexts/ResultProvider";

interface TicketResultPageProps {
  searchParams: Promise<{
    rank?: string;
    virtualUserSize?: number;
  }>;
}

export default async function TicketResultPage() {
  return (
    <ResultProvider>
      <TicketResult />
    </ResultProvider>
  );
}
