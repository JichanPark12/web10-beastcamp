"use client";

import { useRouter } from "next/navigation";
import { enableExperienceMode } from "@/app/actions/experience";

export default function NTicket() {
  const router = useRouter();

  const handleExperienceTicketing = async () => {
    await enableExperienceMode();

    router.push("/nol-ticket");
  };

  return (
    <button
      onClick={handleExperienceTicketing}
      className=" cursor-pointer flex flex-col items-center justify-center w-full h-24 sm:h-32 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
      <div className="text-xl sm:text-2xl font-black tracking-tight">
        <span className="text-blue-500">NO1 </span>
        <span className="text-black">Ticket 체험하기</span>
      </div>
    </button>
  );
}
