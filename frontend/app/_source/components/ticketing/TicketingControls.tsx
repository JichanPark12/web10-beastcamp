'use client';

import { useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import CountdownTimer from './CountdownTimer';
import DateSelector from './DateSelector';
import RoundSelector from './RoundSelector';
import type { Performance, Session } from '@/types/performance';
import type { VenueDetail } from '@/types/venue';
import { useRouter } from 'next/navigation';
import { useTicketContext } from '../../../../contexts/TicketContext';

interface TicketingControlsProps {
  performance?: Performance;
  sessions?: Session[];
  venue: VenueDetail | null;
}

export default function TicketingControls({
  performance,
  sessions,
  venue,
}: TicketingControlsProps) {
  const router = useRouter();
  const { setPerformance, setVenue, selectSession } = useTicketContext();

  const { timeLeft, isActive } = useCountdown(performance?.ticketing_date);

  const handleBooking = () => {
    router.push('/nol-ticket');
  };

  const handleDemoStart = () => {
    if (!performance?.platform) {
      router.push('/nol-ticket');
      return;
    }

    const platformRoutes = {
      interpark: '/interpark',
      yes24: '/yes24',
      'melon-ticket': '/melon-ticket',
    };

    const route =
      platformRoutes[performance.platform as keyof typeof platformRoutes];
    router.push(route || '/nol-ticket');
  };

  return (
    <div className="bg-white/10 p-3 backdrop-blur-lg rounded-2xl border border-white/20">
      <CountdownTimer timeLeft={timeLeft} />

      <button
        onClick={handleBooking}
        disabled={!isActive}
        className={`w-full py-4 rounded-xl transition-all ${
          isActive
            ? 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl'
            : 'bg-white/30 text-white/50 cursor-not-allowed'
        }`}
      >
        {isActive ? '예매하기' : '대기 중...'}
      </button>

      {!isActive && (
        <p className="text-center text-sm text-white/60 mt-3">
          티켓팅 시작 시간에 활성화됩니다
        </p>
      )}

      <button
        onClick={handleDemoStart}
        className="w-full mt-3 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-sm border border-white/30"
      >
        데모 시작하기
      </button>
    </div>
  );
}
