"use client";

import { usePreventRefresh } from "@/hooks/usePreventRefresh";
import { useWaitingQueue } from "../hooks/useWaitingQueue";
import ProgressBar from "./ProgressBar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WaitingProgress() {
  const router = useRouter();
  const { data, isFinished } = useWaitingQueue();

  usePreventRefresh();

  useEffect(() => {
    if (isFinished) {
      router.replace("/reservations");
    }
  }, [isFinished, router]);

  const statusText = isFinished ? "입장 중입니다" : `${data?.order ?? 0}번`;

  return (
    <div className="flex flex-col gap-y-8 my-8">
      <p className="text-gray-500  text-xl text-center">{statusText}</p>

      <div className="bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <ProgressBar value={data?.order ?? 0} />
      </div>
    </div>
  );
}
