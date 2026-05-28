import { AuthPayload } from "../store/auth";

export type UpdatePreferencesInput = {
  preferredLanguage?: string;
  timeZone?: string;
  privacyLevel?: "private" | "friends" | "public";
};

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

export type UpdateHabitInput = Partial<CreateHabitInput>;

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

export type WeeklyReview = {
  id: string;
  weekStartOn: string;
  weekEndOn: string;
  consistencyScore: number | null;
  whatWorked: string;
  whatWasHard: string;
  adjustment: string;
  mood: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentWeeklyReview = {
  weekStartOn: string;
  weekEndOn: string;
  review: WeeklyReview | null;
};

export type UpsertWeeklyReviewInput = {
  consistencyScore: number | null;
  whatWorked: string;
  whatWasHard: string;
  adjustment: string;
  mood: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  visibility: "private" | "invite_only" | "public";
  inviteCode: string | null;
  participantCount: number;
  currentUserRole: "owner" | "member" | null;
  createdAt: string;
};

export type CreateChallengeInput = {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  visibility: "invite_only" | "public";
};

export type ShareCard = {
  id: string;
  type: "progress" | "habit" | "challenge" | "weekly_review" | "streak";
  title: string;
  subtitle: string;
  imageUrl: string;
  deepLink: string;
  createdAt: string;
};

export type CreateShareCardInput = {
  type: "progress" | "habit" | "challenge" | "weekly_review" | "streak";
  title?: string;
  subtitle?: string;
  targetType?: "progress" | "habit" | "challenge" | "weekly_review" | "streak";
  targetId?: string | null;
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
