export default function MTicket() {
  return (
    <button
      disabled
      className="flex flex-col items-center justify-center w-full h-24 sm:h-32 bg-gray-50 rounded-xl border border-gray-200 cursor-not-allowed opacity-80 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-300" />
      <div className="text-xl sm:text-2xl font-black tracking-tight grayscale opacity-50">
        <span className="text-[#00CD3C]">ME </span>
        <span className="text-black">Ticket</span>
      </div>
      <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400 font-medium">
        개발중...
      </div>
    </button>
  );
}
