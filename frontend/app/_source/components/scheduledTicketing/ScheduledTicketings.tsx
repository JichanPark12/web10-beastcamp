import { ErrorBoundary } from "react-error-boundary";
import PreviewCards from "./PreviewCards";
import { Suspense } from "react";

export function ScheduledTicketings() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
      <div className="mb-6">
        <h3 className="text-2xl mb-2">다가오는 티켓팅 일정</h3>
        <p className="text-gray-500">예정된 모의 티켓팅 목록입니다</p>
      </div>
      <ErrorBoundary
        fallback={<div>예정된 티켓팅 정보를 불러오는 것에 실패하였습니다</div>}
      >
        <Suspense fallback={<div>예정된 티켓팅 정보를 불러오고 있습니다</div>}>
          <PreviewCards />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
