// app/page.tsx
/**
 * Home page (/)
 * Resources: app/_source/
 */

import ExperienceCleanup from "./experience/demoTicketing/ExperienceCleanup";

import NetworkStatus from "./_source/components/network/NetworkStatus";
import { ScheduledTicketings } from "./_source/components/scheduledTicketing/ScheduledTicketings";
import UpcomingTicketing from "./_source/components/ticketing/UpcomingTicketing";
import Chat from "./_source/components/chat/Chat";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <UpcomingTicketing />
      <NetworkStatus />
      <Chat />
      <ScheduledTicketings />
      <ExperienceCleanup />
    </main>
  );
}
