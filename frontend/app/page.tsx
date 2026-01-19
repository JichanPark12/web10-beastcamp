// app/page.tsx
/**
 * Home page (/)
 * Resources: app/_source/
 */

import Header from "./_source/components/Header";
import Ticketing from "./_source/components/ticketing/Ticketing";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <Ticketing />
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 티켓팅 시뮬레이터. 모의 연습 서비스입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
