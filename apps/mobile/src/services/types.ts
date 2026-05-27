import { AuthPayload } from "../store/auth";

export type ClientConfig = {
  service: string;
  apiVersion: string;
  utcNow: string;
  supportedCultures: string[];
  defaultCulture: string;
  fallbackCulture: string;
  deepLinkScheme: string;
  openApiUrl: string;
  openApiEnabled: boolean;
  features: Record<string, boolean>;
};

export type TodayHabit = {
  id: string;
  name: string;
  category: string;
  cueText: string;
  completedToday: boolean;
};

export type TodayDashboard = {
  date: string;
  habits: TodayHabit[];
};

export type CreateHabitInput = {
  name: string;
  description?: string;
  category?: string;
  identityStatement?: string;
  cueType?: string;
  cueText?: string;
  rewardText?: string;
  difficulty?: string;
  isPositive: boolean;
};

export type HabitResponse = CreateHabitInput & {
  id: string;
  isArchived: boolean;
  createdAt: string;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastCompletedOn: string | null;
  };
};

export type UpsertHabitReminderInput = {
  enabled: boolean;
  triggerTime: string;
  timeZone?: string;
  channel?: "local" | "push";
  daysOfWeek?: number[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
};

export type HabitReminderResponse = UpsertHabitReminderInput & {
  id: string;
  habitId: string;
  timeZone: string;
  channel: "local" | "push";
  daysOfWeek: number[];
  createdAt: string;
  updatedAt: string;
};

export type ProgressDashboard = {
  from: string;
  to: string;
  completionRate: number;
  habits: Array<{
    id: string;
    name: string;
    currentStreak: number;
    longestStreak: number;
  }>;
};

export type BadgeNotification = {
  unlockId: string;
  badgeCode: string;
  category: string;
  title: string;
  description: string;
  unlockedAt: string;
  contextJson: string;
};

export type GamificationSummary = {
  totalBadgeCount: number;
  unlockedBadgeCount: number;
  unseenUnlockCount: number;
  badges: Array<{
    code: string;
    category: string;
    sortOrder: number;
    title: string;
    description: string;
    isUnlocked: boolean;
    unlockedAt: string | null;
  }>;
  recentUnlocks: Array<{
    id: string;
    badgeCode: string;
    unlockedAt: string;
    seenAt: string | null;
    contextJson: string;
  }>;
};

export type AuthResponse = AuthPayload;
