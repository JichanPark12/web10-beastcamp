import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Seat } from "@/types/seat";

export const useResultQuery = (resultId: string = "") => {
  return useSuspenseQuery({
    queryKey: ["result", resultId],

    queryFn: async () => {
      return api.get<Seat[]>(`/result`);
    },
  });
};
