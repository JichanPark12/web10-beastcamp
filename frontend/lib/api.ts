import { API_PREFIX } from "@/constants/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean>;
  requireAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = API_PREFIX || "";

// 인증 절차가 어찌될진 아직 잘 모르지만 일단 localStorage와 sessionStorage를 사용한다 가정하고 진행
// 추후 next auth사용해서 구현할 수도 있음 next auth 사용 시 코드 변경 필요
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("queue_token") || sessionStorage.getItem("queue_token")
  );
}

function buildUrl(
  url: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${searchParams.toString()}`;
}

async function request<T = unknown>(
  method: HttpMethod,
  endpoint: string,
  data?: unknown,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, headers = {}, requireAuth = false, ...restOptions } = options;

  const url = buildUrl(`${BASE_URL}${endpoint}`, params);

  // 인증이 필요한 경우 토큰 확인 및 추가
  const authHeaders: Record<string, string> = {};
  if (requireAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError("인증 토큰이 없습니다", 401, "Unauthorized");
    }
    authHeaders.Authorization = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    ...restOptions,
  };

  if (data && method !== "GET" && method !== "DELETE") {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let errorData: unknown;
      try {
        // 응답이 json일 수도 아닐 수도 있음
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData
      );
    }

    if (
      // 혹시 트래픽 테스트를 위해 응답이 비어있는 경우가 있을 수 있다고 생각함
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return undefined as T;
    }
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json(); // 응답이 json일 경우
    }

    return (await response.text()) as T; // 응답이 json이 아닐 경우
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 0, "네트워크 오류");
    }

    throw new ApiError("알 수 없는 오류가 발생했습니다", 0, "알수없는 에러");
  }
}

export async function get<T = unknown>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  return request<T>("GET", endpoint, undefined, options);
}

export async function post<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return request<T>("POST", endpoint, data, options);
}

export async function put<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  return request<T>("PUT", endpoint, data, options);
}

export async function del<T = unknown>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  return request<T>("DELETE", endpoint, undefined, options);
}

export const api = {
  get,
  post,
  put,
  delete: del,
};
