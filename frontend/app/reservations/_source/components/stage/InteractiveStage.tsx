"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";

const StageMap = dynamic(() => import("./StageMap"), {
  ssr: false,
  loading: () => <div>좌석 데이터를 불러오는 중입니다.</div>,
});

export default function InteractiveStage() {
  return (
    <>
      <ErrorBoundary
        fallback={<div>좌석 정보를 불러오는 중 오류가 발생했습니다.</div>}
      >
        <Suspense fallback={<div>좌석 데이터를 불러오는 중입니다.</div>}>
          <StageMap />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
