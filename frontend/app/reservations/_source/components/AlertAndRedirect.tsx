"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AlertAndRedirectProps {
  message: string;
  to: string;
}

export default function AlertAndRedirect({
  message,
  to,
}: AlertAndRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    alert(message);
    router.replace(to);
  }, [message, to, router]);

  return null;
}
