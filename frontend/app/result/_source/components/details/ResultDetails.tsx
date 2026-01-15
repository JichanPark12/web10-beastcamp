"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import dynamic from "next/dynamic";
import TimeLog from "./TimeLog";
import UserRank from "./UserRank";

const SelectedSeats = dynamic(() => import("./SelectedSeats"), {
  ssr: false,
  loading: () => <div>결과를 불러오는 중입니다.</div>,
});

export default function ResultDetails() {
  return (
    <>
      <ErrorBoundary
        fallback={<div>결과를 불러오는 중 오류가 발생했습니다.</div>}
      >
        <Suspense fallback={<div>결과를 불러오는 중입니다.</div>}>
          <SelectedSeats />
          <TimeLog />
          <UserRank />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
