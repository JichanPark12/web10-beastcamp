import { useMutation, useQuery } from "@tanstack/react-query";
import { CurrentQueueResponse, EntryResponse } from "../types/entryType";
import { api } from "@/lib/api/api";

export const useEnterQueue = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<EntryResponse>(
        `/queue/entries`,
        {},
        {
          serverType: "queue",
          credentials: "include",
        },
      );
      return response;
    },
  });
};

export const useCurrentQueue = (hasToken: boolean = false) => {
  return useQuery({
    queryKey: ["currentQueue"],
    queryFn: async () => {
      const response = await api.get<CurrentQueueResponse>(
        `/queue/entries/me`,
        { serverType: "queue", credentials: "include" },
      );
      return response;
    },
    enabled: hasToken,
    refetchInterval: 2000,
  });
};
