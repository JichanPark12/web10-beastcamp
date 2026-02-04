import Link from "next/link";

export default function YTicket() {
  return (
    <Link
      href="/yes24"
      className="flex flex-col items-center justify-center w-full h-24 sm:h-32 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[#1c4587]" />
      <div className="text-xl sm:text-2xl font-black tracking-tight">
        <span className="text-[#1c4587]">YE </span>
        <span className="text-black">Ticket 연습</span>
      </div>
    </Link>
  );
}
