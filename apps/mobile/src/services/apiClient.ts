import { Platform } from "react-native";
import { AuthPayload, useAuthStore } from "../store/auth";

const defaultBaseUrl = Platform.select({
  android: "http://10.0.2.2:8080",
  default: "http://localhost:8080",
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl;

type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await rawRequest<T>(path, options);

  if (
    response.status !== 401 ||
    options.skipAuth ||
    options.retryOnUnauthorized === false ||
    path.includes("/auth/refresh")
  ) {
    return handleResponse<T>(response);
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    throw new ApiError("Unauthorized", 401);
  }

  return handleResponse<T>(await rawRequest<T>(path, { ...options, retryOnUnauthorized: false }));
}

async function rawRequest<T>(path: string, options: ApiRequestOptions) {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(data?.error ?? data?.title ?? response.statusText, response.status, data);
  }

  return data as T;
}

async function refreshAccessToken() {
  const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();
  if (!refreshToken) {
    return false;
  }

  try {
    const payload = await apiRequest<AuthPayload>("/api/v1/auth/refresh", {
      method: "POST",
      skipAuth: true,
      retryOnUnauthorized: false,
      body: JSON.stringify({ refreshToken }),
    });

    await setAuth(payload);
    return true;
  } catch {
    await clearAuth();
    return false;
  }
}
