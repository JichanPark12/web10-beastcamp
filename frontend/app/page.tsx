// app/page.tsx
/**
 * Home page (/)
 * Resources: app/_source/
 */

import NetworkStatus from "./_source/components/network/NetworkStatus";
import UpcomingTicketing from "./_source/components/ticketing/UpcomingTicketing";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <UpcomingTicketing />
      <NetworkStatus />
    </main>
  );
}
