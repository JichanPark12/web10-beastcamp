// app/nol-ticket/page.tsx
/**
 * NOL Ticket Detail Page (/nol-ticket)
 */

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import PerformanceDetailData from './_source/components/PerformanceDetailData';

export const dynamic = 'force-dynamic';

export default function NolTicketPage() {
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
          <PerformanceDetailData />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
