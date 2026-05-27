import { type TFunction } from "i18next";
import { HabitFormState, HabitValidation, ReminderFormState } from "./types";

export function validateHabitForm(form: HabitFormState, reminder: ReminderFormState, t: TFunction): HabitValidation {
  const errors: HabitValidation["errors"] = {};

  if (!form.name.trim()) {
    errors.name = t("habitForm.errors.nameRequired");
  }

  if (!form.category.trim()) {
    errors.category = t("habitForm.errors.categoryRequired");
  }

  if (!form.cueText.trim()) {
    errors.cueText = t("habitForm.errors.cueRequired");
  }

  if (reminder.enabled && !isReminderTimeValid(reminder.triggerTime)) {
    errors.reminderTime = t("habitForm.errors.reminderTimeRequired");
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function isHabitFormReady(form: HabitFormState, reminder: ReminderFormState) {
  return Boolean(
    form.name.trim() &&
      form.category.trim() &&
      form.cueText.trim() &&
      (!reminder.enabled || isReminderTimeValid(reminder.triggerTime)),
  );
}

export function isReminderTimeValid(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}
