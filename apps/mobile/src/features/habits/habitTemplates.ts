import { type TFunction } from "i18next";
import { type HabitTemplate, type HabitTemplateId } from "./types";

const templateIds: HabitTemplateId[] = ["reading", "walking", "water", "focus"];
const templateIcons: Record<HabitTemplateId, string> = {
  reading: "📚",
  walking: "🚶",
  water: "💧",
  focus: "🎯",
};

export function makeHabitTemplates(t: TFunction): HabitTemplate[] {
  return templateIds.map((id) => ({
    id,
    icon: templateIcons[id],
    title: t(`habitForm.templates.${id}.title`),
    form: {
      name: t(`habitForm.templates.${id}.name`),
      category: t(`habitForm.templates.${id}.category`),
      identityStatement: t(`habitForm.templates.${id}.identity`),
      cueText: t(`habitForm.templates.${id}.cue`),
      rewardText: t(`habitForm.templates.${id}.reward`),
      difficulty: "easy",
      behaviorType: "positive",
    },
    reminder: {
      enabled: true,
      triggerTime: t(`habitForm.templates.${id}.reminderTime`),
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    },
  }));
}
