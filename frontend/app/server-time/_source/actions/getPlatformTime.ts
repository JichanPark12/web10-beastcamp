"use server";

interface ServerTimeResponse {
  serverDate: number; // 타겟 서버(인터파크)의 Date 헤더 시간
  fetchedAt: number; // 위 데이터를 가져왔을 때의 우리 서버 시간 (캐시 생성 시점)
  serverNow: number; // 현재 요청을 처리하는 시점의 우리 서버 시간 (Age 계산용)
}

// Global In-Memory Cache
// { [url]: { data: { serverDate, fetchedAt }, expiresAt } }
const globalCache: Record<
  string,
  { serverDate: number; fetchedAt: number; expiresAt: number }
> = {};
const CACHE_TTL = 1000; // 1초 유지

import { TICKETING_SITES } from "@/constants/ticketingSites";

const ALLOWED_ORIGINS = TICKETING_SITES.map((site) => site.url);

export async function getPlatformTime(
  baseUrl: string,
): Promise<ServerTimeResponse | null> {
  const isAllowed = ALLOWED_ORIGINS.some((origin) =>
    baseUrl.startsWith(origin),
  );

  if (!isAllowed) {
    return null;
  }

  const now = Date.now();

  const cached = globalCache[baseUrl];
  if (cached && cached.expiresAt > now) {
    return {
      serverDate: cached.serverDate,
      fetchedAt: cached.fetchedAt,
      serverNow: now,
    };
  }

  try {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    const targetUrl = `${cleanUrl}/favicon.ico`;

    const response = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "Server-Time-Proxy",
      },
    });

    const dateHeader = response.headers.get("date");
    if (!dateHeader) {
      return null;
    }

    const serverDate = new Date(dateHeader).getTime();
    const fetchedAt = Date.now();

    globalCache[baseUrl] = {
      serverDate,
      fetchedAt,
      expiresAt: fetchedAt + CACHE_TTL,
    };

    return {
      serverDate,
      fetchedAt,
      serverNow: fetchedAt,
    };
  } catch (error) {
    console.error(`Server Time Fetch Error (${baseUrl}):`, error);
    return null;
  }
}
