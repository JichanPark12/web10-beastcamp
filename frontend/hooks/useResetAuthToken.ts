import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function useResetAuthToken() {
  const { setToken } = useAuth();
  useEffect(() => {
    setToken(null);

    return () => {};
  }, [setToken]);
}
