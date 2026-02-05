import PracticeSection from "./demoTicketing/PracticeSection";

export const metadata = {
  title: "티켓팅 체험학기",
  description: "가상 데이터를 통해 실제 예매 프로세스를 미리 체험해보세요!",
};

export default function ExperiencePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PracticeSection />
    </main>
  );
}
