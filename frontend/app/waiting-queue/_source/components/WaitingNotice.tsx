export default function WaitingNotice() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <p className="text-sm text-gray-600 text-center">
          ⚠️ 새로고침 하거나 재접속 하시면
          <br />
          대기순서가 초기화되어 대기시간이 더 길어집니다
        </p>
      </div>
    </div>
  );
}
