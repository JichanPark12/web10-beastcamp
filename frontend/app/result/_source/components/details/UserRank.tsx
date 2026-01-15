export default function UserRank() {
  const userRank = 1000;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
      <p className="text-gray-600 mb-2">전체 사용자 중</p>
      <p className="text-3xl text-purple-600 mb-2">{userRank}위</p>
      <p className="text-sm text-gray-500">
        상위 {((userRank / 10000) * 100).toFixed(1)}%
      </p>
    </div>
  );
}
