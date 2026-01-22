"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
  error: Error & { digest?: string };
}

export default function ErrorPage({ error }: ErrorPageProps) {
  const router = useRouter();
  const is500 = error.message.includes("500");

  useEffect(() => {
    if (!is500) {
      alert("정상적이지 않은 접근입니다.");
      router.replace("/");
    }
  }, [is500, router]);

  if (!is500) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <h2 className="text-2xl font-bold text-gray-800">
        예약 정보를 불러오는 중 문제가 발생했습니다
      </h2>
      <p className="text-gray-500">{error.message}</p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
        >
          메인으로 이동
        </button>
      </div>
    </div>
  );
}
