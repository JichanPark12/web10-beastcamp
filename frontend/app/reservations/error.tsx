"use client";

import ReservationError from "./_source/components/ReservationError";

export default function ErrorPage(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ReservationError {...props} />;
}
