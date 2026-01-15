const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

export const API_PREFIX =
  process.env.NEXT_PUBLIC_API_MODE === "mock"
    ? `${API_BASE_URL}/mock`
    : API_BASE_URL;
