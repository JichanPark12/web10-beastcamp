// app/page.tsx
/**
 * Home page (/)
 * Resources: app/_source/
 */

import UpcomingTicketing from './_source/components/ticketing/UpcomingTicketing';
export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <>
      <UpcomingTicketing />
    </>
  );
}
