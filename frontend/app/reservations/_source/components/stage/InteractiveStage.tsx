"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";
import StageMapFallback from "./StageMapFallback";

const StageMap = dynamic(() => import("./StageMap"), {
  ssr: false,
  loading: () => <div>좌석 데이터를 불러오는 중입니다.</div>,
});

export default function InteractiveStage() {
  return (
    <>
      <ErrorBoundary FallbackComponent={StageMapFallback}>
        <Suspense fallback={<div>좌석 데이터를 불러오는 중입니다.</div>}>
          <StageMap />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
