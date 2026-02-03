"use client";

import { ApiError } from "@/lib/api/api";
import { FallbackProps } from "react-error-boundary";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StageMapFallback({ error }: FallbackProps) {
  const router = useRouter();
  const isForbidden =
    error instanceof ApiError && (error.status === 403 || error.status === 401);

  useEffect(() => {
    if (isForbidden) {
      alert("마감된 티케팅 입니다. 메인으로 이동합니다.");
      router.replace("/");
    }
  }, [isForbidden, router]);

  if (isForbidden) {
    return <div>마감된 티케팅 입니다.</div>;
  }

  return <div>공연장 정보를 불러오는 중 오류가 발생했습니다.</div>;
}
