import ResultHeader from "./ResultHeader";
import CompleteButton from "./CompleteButton";
import ResultDetails from "./details/ResultDetails";

export default function TicketResult() {
  return (
    <div className="min-h-[calc(100vh-81px)] flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full px-16 py-8 shadow-xl">
        <ResultHeader />
        <div className="space-y-6 mt-6">
          <ResultDetails />
          <CompleteButton />
        </div>
      </div>
    </div>
  );
}
