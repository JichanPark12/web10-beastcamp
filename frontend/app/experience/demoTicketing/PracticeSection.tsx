import ExperienceLinks from "./links/ExperienceLinks";

export default function PracticeSection() {
  return (
    <section className="rounded-2xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 mb-2">
          티켓팅 체험하기
        </h2>
        <p className="text-gray-600 mb-6 max-w-lg">
          티켓팅 오픈 전, 심심하신가요? <br className="sm:hidden" />
          가상 데이터를 통해 실제 예매 프로세스를 미리 체험해보세요!
        </p>
        <ExperienceLinks />
      </div>
    </section>
  );
}
