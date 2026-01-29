import { Ticket } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-fit">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl">티켓팅 시뮬레이터</h1>
            <p className="text-sm text-gray-500">실전처럼 연습하세요</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
