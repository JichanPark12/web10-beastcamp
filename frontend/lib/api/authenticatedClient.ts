import { api, type ApiRequestOptions } from "@/lib/api/api";

export function createAuthenticatedApi(token: string) {
  const withAuth = (options?: ApiRequestOptions): ApiRequestOptions => ({
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
      api.get<T>(endpoint, withAuth(options)),

    post: <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: ApiRequestOptions,
    ) => api.post<T>(endpoint, data, withAuth(options)),

    put: <T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: ApiRequestOptions,
    ) => api.put<T>(endpoint, data, withAuth(options)),

    delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
      api.delete<T>(endpoint, withAuth(options)),
  };
}
