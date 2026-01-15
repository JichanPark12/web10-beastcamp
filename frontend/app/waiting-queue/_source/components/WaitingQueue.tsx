import WaitingProgress from "./WaitingProgress";
import WaitingHeader from "./WaitingHeader";
import WaitingNotice from "./WaitingNotice";
import WaitingQueueTimeTracker from "./WaitingQueueTimeTracker";

export default function WaitingQueue() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-xl">
        <WaitingQueueTimeTracker />
        <div className="py-8">
          <WaitingHeader />
          <div className="max-w-md mx-auto">
            <WaitingProgress />
            <WaitingNotice />
          </div>
        </div>
      </div>
    </div>
  );
}
