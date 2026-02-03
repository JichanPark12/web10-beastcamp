import { useQuery } from "@tanstack/react-query";

export interface NetworkStatusType {
  pings: { name: string; latency: number | null }[];
  bandwidth: number | null;
  grade: "very-good" | "good" | "bad" | null;
  isChecking: boolean;
  message: string;
}

import { TICKETING_SITES } from "@/constants/ticketingSites";

const PING_TARGETS = TICKETING_SITES;

// mbps 속도 테스트를 위한 public cdn 주소 (jsdelivr)
const SPEED_TEST_FILE =
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg";
const FILE_SIZE_BYTES = 512606;
const PARALLEL_REQUESTS = 5;

const BITS_PER_BYTE = 8;
const MS_PER_SEC = 1000;
const BITS_PER_MBIT = 1000000;

const PING_THRESHOLD_GOOD = 75;
const PING_THRESHOLD_NORMAL = 150;
const SPEED_THRESHOLD_GOOD = 200;
const SPEED_THRESHOLD_NORMAL = 100;

const measurePing = async (): Promise<{
  pings: { name: string; latency: number | null }[];
  avgPing: number | null;
}> => {
  const pingPromises = PING_TARGETS.map(async (target) => {
    const start = performance.now();
    try {
      await fetch(target.url, { mode: "no-cors", method: "HEAD" });
      const latency = performance.now() - start;
      return { name: target.name, latency };
    } catch {
      return { name: target.name, latency: null };
    }
  });
  const pings = await Promise.all(pingPromises);
  const validPings = pings
    .filter((p) => p.latency !== null)
    .map((p) => p.latency as number);

  const avgPing =
    validPings.length > 0
      ? validPings.reduce((a, b) => a + b, 0) / validPings.length
      : null;

  return { pings, avgPing };
};

const measureSpeed = async (): Promise<number> => {
  const downloadPromises = Array(PARALLEL_REQUESTS)
    .fill(0)
    .map(async () => {
      const start = performance.now();
      const response = await fetch(
        `${SPEED_TEST_FILE}?t=${Date.now()}-${Math.random()}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Download failed");
      await response.blob();
      return performance.now() - start;
    });

  const durations = await Promise.all(downloadPromises);

  const maxDurationSec = Math.max(...durations) / MS_PER_SEC;
  const totalBits = FILE_SIZE_BYTES * BITS_PER_BYTE * PARALLEL_REQUESTS;
  const mbps = totalBits / BITS_PER_MBIT / maxDurationSec;

  return mbps;
};

const calculateGrade = (
  avgPing: number | null,
  mbps: number,
): { grade: NetworkStatusType["grade"]; message: string } => {
  let grade: NetworkStatusType["grade"] = "bad";
  let message = "네트워크가 불안정합니다.";

  const isPingGood = avgPing !== null && avgPing < PING_THRESHOLD_GOOD;
  const isPingNormal = avgPing !== null && avgPing < PING_THRESHOLD_NORMAL;
  const isSpeedGood = mbps > SPEED_THRESHOLD_GOOD;
  const isSpeedNormal = mbps > SPEED_THRESHOLD_NORMAL;

  if (isPingGood && isSpeedGood) {
    grade = "very-good";
    message = "티켓팅 준비 완료! (최적)";
  } else if (isPingNormal && isSpeedNormal) {
    grade = "good";
    message = "양호합니다.";
  } else {
    grade = "bad";
    if (mbps <= SPEED_THRESHOLD_NORMAL) {
      message = "속도가 느립니다. PC방을 추천합니다.";
    } else {
      message = "지연 시간이 높습니다.";
    }
  }

  return { grade, message };
};

export const useNetworkLatency = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    // suspense를 사용하지 않기에 useQuery 사용
    queryKey: ["networkLatency"],
    queryFn: async () => {
      const { avgPing, pings } = await measurePing();
      const mbps = await measureSpeed();
      const { grade, message } = calculateGrade(avgPing, mbps);

      return {
        pings,
        bandwidth: Math.round(mbps),
        avgPing,
        grade,
        message,
      };
    },
    staleTime: 0,
    gcTime: 0,
    enabled: false,
    retry: false,
  });

  const result = data || {
    pings: null,
    bandwidth: null,
    avgPing: null,
    grade: null,
    message: "네트워크 상태를 확인해주세요.",
  };

  return {
    ...result,
    isLoading,
    isError,
    checkNetwork: refetch,
  };
};
