import { Maximize2, Minus, Plus } from "lucide-react";

interface StageControllerProps {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
}

export default function StageController({
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
}: StageControllerProps) {
  return (
    <div className="flex items-center justify-between mb-4 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="축소"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomReset}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
          title="초기화"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="확대"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
