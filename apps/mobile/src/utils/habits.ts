import { ProgressDashboard, TodayHabit } from "../services/types";

type ProgressHabit = ProgressDashboard["habits"][number];

export function normalizeHabitName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
}

export function uniqueTodayHabits(habits: TodayHabit[] = []) {
  const byName = new Map<string, TodayHabit>();

  for (const habit of habits) {
    const key = normalizeHabitName(habit.name);
    const current = byName.get(key);

    if (!current || (!current.completedToday && habit.completedToday)) {
      byName.set(key, habit);
    }
  }

  return [...byName.values()];
}

export function uniqueProgressHabits(habits: ProgressHabit[] = []) {
  const byName = new Map<string, ProgressHabit>();

  for (const habit of habits) {
    const key = normalizeHabitName(habit.name);
    const current = byName.get(key);

    if (!current || habit.currentStreak > current.currentStreak || habit.longestStreak > current.longestStreak) {
      byName.set(key, habit);
    }
  }

  return [...byName.values()];
}
