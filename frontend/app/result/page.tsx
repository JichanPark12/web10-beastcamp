import TicketResult from "./_source/components/TicketResult";
import { ResultProvider } from "./_source/contexts/ResultProvider";

interface TicketResultPageProps {
  searchParams: Promise<{
    rank?: string;
  }>;
}

export default async function TicketResultPage({
  searchParams,
}: TicketResultPageProps) {
  const resolvedSearchParams = await searchParams;
  const rank = resolvedSearchParams.rank;

  return (
    <ResultProvider rank={rank}>
      <TicketResult />
    </ResultProvider>
  );
}
