"use server";

import { ALLOWED_HOSTS } from "../constants/allowList";

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

export async function getPlatformTime(
  baseUrl: string,
): Promise<ServerTimeResponse | null> {
  const normalizedUrl = baseUrl.replace(/\/$/, "");

  let isAllowed = false;
  try {
    const { host } = new URL(normalizedUrl);
    isAllowed = ALLOWED_HOSTS.has(host);
  } catch {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  const now = Date.now();

  const cached = globalCache[normalizedUrl];
  if (cached && cached.expiresAt > now) {
    return {
      serverDate: cached.serverDate,
      fetchedAt: cached.fetchedAt,
      serverNow: now,
    };
  }

  try {
    const targetUrl = `${normalizedUrl}/favicon.ico`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        console.warn(
          `[ServerTime] Fetch failed status: ${response.status} for ${normalizedUrl}`,
        );
        return null;
      }

      const dateHeader = response.headers.get("date");
      if (!dateHeader) {
        return null;
      }

      const serverDate = new Date(dateHeader).getTime();
      const fetchedAt = Date.now();

      globalCache[normalizedUrl] = {
        serverDate,
        fetchedAt,
        expiresAt: fetchedAt + CACHE_TTL,
      };

      return {
        serverDate,
        fetchedAt,
        serverNow: fetchedAt,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`[ServerTime] Fetch timeout for ${normalizedUrl}`);
    } else {
      console.error(`Server Time Fetch Error (${normalizedUrl}):`, error);
    }
    return null;
  }
}
