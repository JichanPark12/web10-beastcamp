import { useEffect } from "react";
import { useCurrentQueue, useEnterQueue } from "../queries/position";

export const useWaitingQueue = () => {
  const {
    mutate,
    data: entryData,
    isSuccess: isEntrySuccess,
    isError,
  } = useEnterQueue();

  const { data: currentData } = useCurrentQueue(isEntrySuccess);

  useEffect(() => {
    mutate();
  }, [mutate]);

  return {
    isLoading: !isEntrySuccess && !isError,
    isError,
    initialOrder: entryData?.position,
    currentOrder: currentData?.position,
    isFinished: currentData?.position && currentData?.position <= 0,
  };
};
