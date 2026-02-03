"use client";

interface AreaHeaderProps {
  title: string;
  onRefresh: () => void;
  onBack: () => void;
}

export default function AreaHeader({
  title,
  onRefresh,
  onBack,
}: AreaHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between bg-white z-10 sticky top-0">
      <h2 className="text-lg font-bold">{title} 구역 좌석 선택</h2>
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
        >
          새로고침
        </button>
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
        >
          지도 보기
        </button>
      </div>
    </div>
  );
}
