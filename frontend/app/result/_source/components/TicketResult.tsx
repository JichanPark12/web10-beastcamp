import ResultHeader from "./ResultHeader";
import CompleteButton from "./CompleteButton";
import ResultDetails from "./details/ResultDetails";

export default function TicketResult() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full px-8 py-4 shadow-xl">
        <ResultHeader />
        <div className="max-w-md mx-auto space-y-4">
          <ResultDetails />
          <CompleteButton />
        </div>
      </div>
    </div>
  );
}
