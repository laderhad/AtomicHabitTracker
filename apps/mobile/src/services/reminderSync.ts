import { ApiError, apiRequest } from "./apiClient";
import {
  cancelHabitReminder,
  reconcileLocalHabitReminders,
  scheduleHabitReminder,
} from "./localNotifications";
import { HabitReminderResponse, HabitResponse } from "./types";

export type ReminderSyncResult = {
  habitCount: number;
  scheduledCount: number;
  skippedCount: number;
  failedCount: number;
};

export async function syncLocalHabitReminders(notificationBody: string): Promise<ReminderSyncResult> {
  const habits = await apiRequest<HabitResponse[]>("/api/v1/habits");
  const activeHabitIds = habits.map((habit) => habit.id);

  await reconcileLocalHabitReminders(activeHabitIds);

  const results = await Promise.all(
    habits.map(async (habit) => {
      try {
        const reminder = await getHabitReminder(habit.id);

        if (!reminder?.enabled) {
          await cancelHabitReminder(habit.id);
          return "skipped";
        }

        const scheduleResult = await scheduleHabitReminder({
          habitId: habit.id,
          habitName: habit.name,
          enabled: reminder.enabled,
          triggerTime: reminder.triggerTime,
          daysOfWeek: reminder.daysOfWeek,
          body: notificationBody,
          requestPermission: false,
        });

        return scheduleResult.status === "scheduled" ? "scheduled" : "skipped";
      } catch {
        return "failed";
      }
    }),
  );

  return {
    habitCount: habits.length,
    scheduledCount: results.filter((result) => result === "scheduled").length,
    skippedCount: results.filter((result) => result === "skipped").length,
    failedCount: results.filter((result) => result === "failed").length,
  };
}

async function getHabitReminder(habitId: string) {
  try {
    return await apiRequest<HabitReminderResponse>(`/api/v1/habits/${habitId}/reminders`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
