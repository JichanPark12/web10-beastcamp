"use client";

import { useEffect, useState, ReactNode } from "react";

interface MountedProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function Mounted({ children, fallback = null }: MountedProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
