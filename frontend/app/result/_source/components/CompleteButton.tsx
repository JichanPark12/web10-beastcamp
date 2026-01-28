"use client";

import { useRouter } from "next/navigation";

export default function CompleteButton() {
  const router = useRouter();

  const handleClickComplete = () => {
    router.replace("/");
  };

  return (
    <button
      onClick={handleClickComplete}
      className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      완료
    </button>
  );
}
