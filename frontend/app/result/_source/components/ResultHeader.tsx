import { Trophy } from "lucide-react";

export default function ResultHeader() {
  return (
    <div className="py-6">
      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Trophy className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl mb-2 text-center">예매 완료!</h3>
      <p className="text-gray-500 text-center">티켓팅 결과를 확인하세요</p>
    </div>
  );
}
