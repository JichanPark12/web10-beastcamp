import { Users } from "lucide-react";

export default function WaitingHeader() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl mb-2">대기열 진행 중</h3>
      <p className="text-gray-500">잠시만 기다려주세요...</p>
    </div>
  );
}
