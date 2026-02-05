import TicketResult from "./_source/components/TicketResult";
import { ResultProvider } from "./_source/contexts/ResultProvider";

export default async function TicketResultPage() {
  return (
    <ResultProvider>
      <TicketResult />
    </ResultProvider>
  );
}
