const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const API_PREFIX =
  process.env.NEXT_PUBLIC_API_MODE === "mock"
    ? `${API_BASE_URL}/mock`
    : API_BASE_URL;
