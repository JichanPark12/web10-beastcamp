import { RefreshCcw, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { NetworkStatusType } from "../../hooks/useNetworkLatency";

interface NetworkStatusHeaderProps {
  grade: NetworkStatusType["grade"];
  isError: boolean;
  checkNetwork: () => void;
}

const getStatusMessage = (
  grade: NetworkStatusType["grade"],
  isError: boolean,
) => {
  if (isError) return "네트워크 요청 중 에러가 발생했습니다";
  if (!grade) return "네트워크 확인 필요";

  const messages: Record<string, string> = {
    "very-good": "최적의 환경",
    good: "양호한 환경",
    bad: "불안정",
  };
  return messages[grade] ?? "네트워크 확인 필요";
};

export default function NetworkStatusHeader({
  grade,
  isError,
  checkNetwork,
}: NetworkStatusHeaderProps) {
  const renderStatusIcon = () => {
    switch (grade) {
      case "very-good":
        return <Wifi className="w-5 h-5" />;
      case "good":
        return <Wifi className="w-5 h-5" />;
      case "bad":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <WifiOff className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {renderStatusIcon()}
        <h3 className="font-bold text-lg">
          {getStatusMessage(grade, isError)}
        </h3>
      </div>
      <button
        onClick={() => checkNetwork()}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="네트워크 재측정"
      >
        <RefreshCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
