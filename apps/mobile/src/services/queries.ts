import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./apiClient";
import {
  AuthResponse,
  BadgeNotification,
  ClientConfig,
  CreateHabitInput,
  GamificationSummary,
  HabitResponse,
  HabitReminderResponse,
  ProgressDashboard,
  TodayDashboard,
  UpsertHabitReminderInput,
} from "./types";
import { useAuthStore } from "../store/auth";

export const queryKeys = {
  clientConfig: ["clientConfig"] as const,
  today: ["today"] as const,
  progress: ["progress"] as const,
  gamification: ["gamification"] as const,
  badgeNotifications: ["badgeNotifications"] as const,
};

export function useClientConfig() {
  return useQuery({
    queryKey: queryKeys.clientConfig,
    queryFn: () => apiRequest<ClientConfig>("/api/v1/client/config", { skipAuth: true }),
  });
}

export function useTodayDashboard() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.today,
    queryFn: () => apiRequest<TodayDashboard>("/api/v1/dashboard/today"),
    enabled: Boolean(token),
  });
}

export function useProgressDashboard() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.progress,
    queryFn: () => apiRequest<ProgressDashboard>("/api/v1/dashboard/progress"),
    enabled: Boolean(token),
  });
}

export function useGamificationSummary(culture: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: [...queryKeys.gamification, culture],
    queryFn: () => apiRequest<GamificationSummary>(`/api/v1/gamification/summary?culture=${culture}`),
    enabled: Boolean(token),
  });
}

export function useBadgeNotifications(culture: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: [...queryKeys.badgeNotifications, culture],
    queryFn: () =>
      apiRequest<BadgeNotification[]>(`/api/v1/gamification/notifications?culture=${culture}&limit=5`),
    enabled: Boolean(token),
  });
}

export function useAuthMutation(mode: "login" | "register") {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      displayName?: string;
      preferredLanguage: string;
      timeZone: string;
    }) => {
      const path = mode === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";
      const body =
        mode === "login"
          ? { email: input.email, password: input.password, deviceName: "mobile" }
          : {
              email: input.email,
              password: input.password,
              displayName: input.displayName?.trim() || input.email,
              preferredLanguage: input.preferredLanguage,
              timeZone: input.timeZone,
              deviceName: "mobile",
            };

      return apiRequest<AuthResponse>(path, {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(body),
      });
    },
    onSuccess: async (payload) => {
      await setAuth(payload);
      await queryClient.invalidateQueries();
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHabitInput) =>
      apiRequest<HabitResponse>("/api/v1/habits", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateDashboard(queryClient),
  });
}

export function useUpsertHabitReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, input }: { habitId: string; input: UpsertHabitReminderInput }) =>
      apiRequest<HabitReminderResponse>(`/api/v1/habits/${habitId}/reminders`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateDashboard(queryClient),
  });
}

export function useCompleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (habitId: string) =>
      apiRequest(`/api/v1/habits/${habitId}/logs`, {
        method: "POST",
        body: JSON.stringify({
          status: "completed",
          occurredAt: new Date().toISOString(),
          source: "manual",
        }),
      }),
    onSuccess: () => invalidateDashboard(queryClient),
  });
}

export function useMarkNotificationsSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unlockIds: string[]) =>
      apiRequest("/api/v1/gamification/unlocks/mark-seen", {
        method: "POST",
        body: JSON.stringify({ unlockIds }),
      }),
    onSuccess: () => invalidateDashboard(queryClient),
  });
}

function invalidateDashboard(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.today });
  void queryClient.invalidateQueries({ queryKey: queryKeys.progress });
  void queryClient.invalidateQueries({ queryKey: queryKeys.gamification });
  void queryClient.invalidateQueries({ queryKey: queryKeys.badgeNotifications });
}
