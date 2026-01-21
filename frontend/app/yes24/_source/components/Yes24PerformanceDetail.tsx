'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, ChevronRight } from 'lucide-react';
import { Performance, Session } from '@/types/performance';
import Yes24Calendar from './Yes24Calendar';
import { useRouter } from 'next/navigation';

interface Yes24PerformanceDetailProps {
  performance: Performance;
  sessions: Session[];
  venueName?: string;
}

export default function Yes24PerformanceDetail({
  performance,
  sessions,
  venueName,
}: Yes24PerformanceDetailProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(436);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // 날짜 범위 계산
  let dateRange = '';
  if (sessions && sessions.length > 0) {
    const dates = sessions.map((s) => new Date(s.sessionDate).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    };

    if (minDate.getTime() === maxDate.getTime()) {
      dateRange = formatDate(minDate);
    } else {
      dateRange = `${formatDate(minDate)} ~ ${formatDate(maxDate)}`;
    }
  }

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleReservation = () => {
    if (selectedDate && selectedSession) {
      router.push('/waiting-queue');
    }
  };

  // 선택된 날짜의 세션들 필터링
  const filteredSessions = selectedDate
    ? sessions.filter((session) => {
        const sessionDate = new Date(session.sessionDate);
        return (
          sessionDate.getFullYear() === selectedDate.getFullYear() &&
          sessionDate.getMonth() === selectedDate.getMonth() &&
          sessionDate.getDate() === selectedDate.getDate()
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 태그 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">콘서트</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">국내뮤지션</span>
          </div>
        </div>
      </div>

      {/* 타이틀 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              단독판매
            </span>
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
              지금 예매 받기
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {performance.performance_name}
          </h1>
          <p className="text-sm text-gray-600">{dateRange}</p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 포스터 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative aspect-[3/4]">
                <Image
                  src="/images/poster.jpg"
                  alt={performance.performance_name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* 좋아요 버튼 */}
              <div className="p-4 border-t">
                <button
                  onClick={handleLike}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                  <span className="text-sm text-gray-700">{likeCount}</span>
                  <span className="text-sm text-gray-600">Likes</span>
                </button>
              </div>
            </div>
          </div>

          {/* 우측: 상세 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* 기본 정보 테이블 */}
              <div className="space-y-4">
                <div className="flex border-b pb-3">
                  <div className="w-24 text-gray-600 font-medium text-sm">
                    등급
                  </div>
                  <div className="flex-1 text-gray-900 text-sm">
                    만 7세이상 관람가능
                  </div>
                </div>

                <div className="flex border-b pb-3">
                  <div className="w-24 text-gray-600 font-medium text-sm">
                    관람시간
                  </div>
                  <div className="flex-1 text-gray-900 text-sm">120분</div>
                </div>

                <div className="flex border-b pb-3">
                  <div className="w-24 text-gray-600 font-medium text-sm">
                    출연
                  </div>
                  <div className="flex-1 text-gray-900 text-sm">이창섭</div>
                </div>

                <div className="flex border-b pb-3">
                  <div className="w-24 text-gray-600 font-medium text-sm">
                    가격
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 text-sm">VIP석</span>
                      <span className="text-red-600 font-medium text-sm line-through">
                        154,000원
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 text-sm">R석</span>
                      <span className="text-gray-900 font-medium text-sm">
                        143,000원
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 text-sm">S석</span>
                      <span className="text-gray-900 font-medium text-sm">
                        132,000원
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex border-b pb-3">
                  <div className="w-24 text-gray-600 font-medium text-sm">
                    혜택
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded whitespace-nowrap">
                        사용가능쿠폰(0)
                      </span>
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        무이자할부
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        제휴카드할인
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        제휴카드무이자
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-24 text-gray-600 font-medium text-sm">
                    배송정보
                  </div>
                  <div className="flex-1 text-gray-700 text-sm">
                    현장 수령만 가능
                  </div>
                </div>
              </div>

              {/* 공연시간 안내 */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">
                  공연시간 안내
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>2026년 1월 24일(토) 오후 6시</p>
                  <p>2026년 1월 25일(일) 오후 5시</p>
                </div>
              </div>

              {/* 배송정보 */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">
                  배송정보
                </h3>
                <p className="text-sm text-gray-700">현장 수령만 가능</p>
              </div>
            </div>

            {/* 보안문자 안내 */}
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-bold">본 상품은</span>{' '}
                  <span className="text-red-600 font-bold">
                    자동예매방지(CAPTCHA)
                  </span>
                  가 적용된 상품입니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 날짜/시간 선택 */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 날짜/시간 선택 */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-900">
                날짜/시간 선택
              </h2>

              <div className="flex gap-8">
                <div className="flex-1">
                  <Yes24Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    sessions={sessions}
                  />
                </div>
                <div className="w-48 flex items-start justify-center pt-16">
                  <span className="inline-block px-6 py-3 bg-orange-500 text-white text-sm font-bold rounded whitespace-nowrap">
                    1회 오후 6시 00분
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 예매 가능 좌석 */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">
                예매 가능 좌석
              </h2>

              {!selectedDate && (
                <div className="text-center py-12 text-gray-400">
                  본 공연은 전화예약 서비스를 제공하지 않습니다.
                </div>
              )}

              {selectedDate && filteredSessions.length > 0 && (
                <div className="space-y-3">
                  {filteredSessions.map((session) => {
                    const sessionDate = new Date(session.sessionDate);
                    const hours = sessionDate.getHours();
                    const minutes = sessionDate.getMinutes();
                    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;

                    return (
                      <button
                        key={session.id}
                        onClick={() =>
                          setSelectedSession(session.id.toString())
                        }
                        className={`w-full p-4 text-left border rounded-lg transition-colors ${
                          selectedSession === session.id.toString()
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {timeStr} 회차
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              VIP석 154,000원 / R석 143,000원 / S석 132,000원
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedDate && filteredSessions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  선택하신 날짜에 예매 가능한 회차가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handleReservation}
            disabled={!selectedDate || !selectedSession}
            className={`px-32 py-4 rounded font-bold text-lg transition-colors ${
              selectedDate && selectedSession
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            예매하기
          </button>
          <button className="px-20 py-4 rounded border-2 border-gray-300 bg-white text-gray-700 font-bold text-lg hover:bg-gray-50 transition-colors">
            GLOBAL BOOKING
          </button>
        </div>
      </div>
    </div>
  );
}
