import { clearQueueCookies } from "@/app/actions/clearQueueCookie";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function useExitPage() {
  const { setToken } = useAuth();
  useEffect(() => {
    return () => {
      setToken(null);
      clearQueueCookies();
    };
  }, [setToken]);
}
