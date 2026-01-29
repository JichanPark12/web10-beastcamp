// app/yes24/page.tsx
/**
 * Yes24 Ticket Detail Page (/yes24)
 */

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import Yes24PerformanceDetailData from "./_source/components/Yes24PerformanceDetailData";

export const dynamic = "force-dynamic";

export default function Yes24Page() {
  return (
    <>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">오류가 발생했습니다.</p>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          }
        >
          <Yes24PerformanceDetailData />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
