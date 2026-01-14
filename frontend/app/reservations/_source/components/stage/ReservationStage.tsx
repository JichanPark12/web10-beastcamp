import InteractiveStage from "./InteractiveStage";

export default function ReservationStage() {
  return (
    <div className="flex-1 p-4 overflow-hidden flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col overflow-hidden">
        <InteractiveStage />
      </div>
    </div>
  );
}
