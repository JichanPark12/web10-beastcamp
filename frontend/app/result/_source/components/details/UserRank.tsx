"use client";

import { useResult } from "@/contexts/ResultContext";
import { useEffect, useState } from "react";
import { useExperienceMode } from "@/hooks/useExperienceMode";

export default function UserRank() {
  const { result } = useResult();
  const [animatedRank, setAnimatedRank] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const isExperience = useExperienceMode();

  const userRank = result?.rank ?? 0;
  const virtualUserSize =
    result?.virtualUserSize && result.virtualUserSize > 0
      ? result.virtualUserSize
      : 50000;

  useEffect(() => {
    if (!result) return;

    // 숫자 카운트 업 애니메이션
    const duration = 500;
    const steps = 150;
    const increment = userRank / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= userRank) {
        setAnimatedRank(userRank);
        clearInterval(timer);
      } else {
        setAnimatedRank(Math.floor(current));
      }
    }, duration / steps);

    const targetPercent = Math.max(0, (userRank / virtualUserSize) * 100);

    setTimeout(() => setProgressWidth(targetPercent), 100);

    return () => clearInterval(timer);
  }, [result, userRank, virtualUserSize]);

  if (!result || isExperience) return null;

  const percentile = (userRank / virtualUserSize) * 100;

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Decoration (Subtle) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-2 w-full">
          {/* Top Badge */}
          <div className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-100 mb-4">
            Top {Math.max(0.01, percentile).toFixed(2)}%
          </div>

          {/* Main Content: Big Rank Number */}
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-gray-400 font-semibold tracking-widest text-[10px] uppercase mb-2">
              Final Ranking
            </h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl sm:text-8xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
                {animatedRank.toLocaleString()}
              </span>
              <span className="text-gray-400 font-bold text-2xl">위</span>
            </div>
          </div>

          {/* Bottom Graph Section */}
          <div className="w-full max-w-[280px] mt-10 relative group">
            {/* Tooltip (Speech Bubble) */}
            <div
              className="absolute -top-9 transform -translate-x-1/2 transition-all duration-1000 ease-out z-10 flex flex-col items-center"
              style={{ left: `${progressWidth}%` }}
            >
              <div className="bg-gray-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap relative">
                Me
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>

            {/* Linear Progress Bar (Full Gradient Track) */}
            <div className="h-4 w-full rounded-full relative overflow-visible">
              {/* Fixed Gradient Background for Track */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-gray-200"></div>

              {/* White Dot Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-md transition-all duration-1000 ease-out z-10 transform -translate-x-1/2"
                style={{ left: `${progressWidth}%` }}
              ></div>
            </div>

            {/* Bottom Labels */}
            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 font-medium px-1">
              <span className="text-purple-600 font-bold">1st</span>
              <span className="text-gray-300">
                Total {virtualUserSize.toLocaleString()}
              </span>
              <span>Last</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
