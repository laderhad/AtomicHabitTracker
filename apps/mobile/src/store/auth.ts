import { create } from "zustand";
import { deleteSecureItem, getSecureItem, setSecureItem } from "../services/secureStorage";

const ACCESS_TOKEN_KEY = "atomic.accessToken";
const REFRESH_TOKEN_KEY = "atomic.refreshToken";
const USER_KEY = "atomic.user";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: string;
  timeZone: string;
  privacyLevel: string;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setAuth: (payload: AuthPayload) => Promise<void>;
  clearAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isHydrated: false,
  hydrate: async () => {
    const [accessToken, refreshToken, userJson] = await Promise.all([
      getSecureItem(ACCESS_TOKEN_KEY),
      getSecureItem(REFRESH_TOKEN_KEY),
      getSecureItem(USER_KEY),
    ]);

    set({
      accessToken,
      refreshToken,
      user: userJson ? (JSON.parse(userJson) as AuthUser) : null,
      isHydrated: true,
    });
  },
  setAuth: async (payload) => {
    await Promise.all([
      setSecureItem(ACCESS_TOKEN_KEY, payload.accessToken),
      setSecureItem(REFRESH_TOKEN_KEY, payload.refreshToken),
      setSecureItem(USER_KEY, JSON.stringify(payload.user)),
    ]);

    set({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
      isHydrated: true,
    });
  },
  clearAuth: async () => {
    await Promise.all([
      deleteSecureItem(ACCESS_TOKEN_KEY),
      deleteSecureItem(REFRESH_TOKEN_KEY),
      deleteSecureItem(USER_KEY),
    ]);

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isHydrated: true,
    });
  },
}));
