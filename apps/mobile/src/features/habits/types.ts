import {
  CreateHabitInput,
  HabitReminderResponse,
  HabitResponse,
  UpdateHabitInput,
  UpsertHabitReminderInput,
} from "../../services/types";

export type HabitTemplateId = "reading" | "walking" | "water" | "focus";

export type HabitTemplate = {
  id: HabitTemplateId;
  icon: string;
  title: string;
  form: HabitFormState;
  reminder: ReminderFormState;
};

export type Difficulty = "easy" | "medium" | "hard";
export type BehaviorType = "positive" | "negative";
export type OptionalDifficulty = Difficulty | "";
export type OptionalBehaviorType = BehaviorType | "";

export type HabitFormState = {
  name: string;
  category: string;
  identityStatement: string;
  cueText: string;
  rewardText: string;
  difficulty: OptionalDifficulty;
  behaviorType: OptionalBehaviorType;
};

export type ReminderFormState = {
  enabled: boolean;
  triggerTime: string;
  daysOfWeek: number[];
};

export type HabitValidation = {
  isValid: boolean;
  errors: Partial<Record<"name" | "category" | "cueText" | "reminderTime", string>>;
};

export const difficultyOptions: Difficulty[] = ["easy", "medium", "hard"];
export const behaviorTypeOptions: BehaviorType[] = ["positive", "negative"];

export const emptyHabitFormState: HabitFormState = {
  name: "",
  category: "",
  identityStatement: "",
  cueText: "",
  rewardText: "",
  difficulty: "",
  behaviorType: "",
};

export const defaultReminderDays = [1, 2, 3, 4, 5, 6, 7];

export const emptyReminderFormState: ReminderFormState = {
  enabled: false,
  triggerTime: "",
  daysOfWeek: defaultReminderDays,
};

export function toCreateHabitInput(form: HabitFormState): CreateHabitInput {
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    identityStatement: form.identityStatement.trim(),
    cueType: "time_and_context",
    cueText: form.cueText.trim(),
    rewardText: form.rewardText.trim(),
    difficulty: form.difficulty || "easy",
    isPositive: form.behaviorType !== "negative",
  };
}

export function toUpdateHabitInput(form: HabitFormState): UpdateHabitInput {
  return toCreateHabitInput(form);
}

export function toHabitFormState(habit: HabitResponse): HabitFormState {
  return {
    name: habit.name,
    category: habit.category ?? "",
    identityStatement: habit.identityStatement ?? "",
    cueText: habit.cueText ?? "",
    rewardText: habit.rewardText ?? "",
    difficulty: isDifficulty(habit.difficulty) ? habit.difficulty : "easy",
    behaviorType: habit.isPositive ? "positive" : "negative",
  };
}

export function toUpsertHabitReminderInput(
  reminder: ReminderFormState,
  timeZone: string,
): UpsertHabitReminderInput {
  return {
    enabled: reminder.enabled,
    triggerTime: reminder.triggerTime.trim(),
    timeZone,
    channel: "local",
    daysOfWeek: reminder.daysOfWeek,
  };
}

export function toReminderFormState(reminder: HabitReminderResponse | null | undefined): ReminderFormState {
  if (!reminder) {
    return emptyReminderFormState;
  }

  return {
    enabled: reminder.enabled,
    triggerTime: reminder.triggerTime,
    daysOfWeek: reminder.daysOfWeek.length ? [...reminder.daysOfWeek] : defaultReminderDays,
  };
}

function isDifficulty(value: string | undefined): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}
