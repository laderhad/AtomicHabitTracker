import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { Surface } from "../../../components/primitives";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";
import { HabitFormState, HabitValidation } from "../types";
import { BehaviorTypeSelector } from "./BehaviorTypeSelector";
import { DifficultySelector } from "./DifficultySelector";
import { FormField } from "./FormField";

type HabitDetailsFormProps = {
  form: HabitFormState;
  submitError: string | null;
  validation: HabitValidation;
  onChange: (update: Partial<HabitFormState>) => void;
};

export function HabitDetailsForm({ form, submitError, validation, onChange }: HabitDetailsFormProps) {
  const { t } = useTranslation();

  return (
    <Surface style={styles.detailsSurface}>
      <Text style={styles.cardTitle}>{t("habitForm.detailsTitle")}</Text>

      <FormField
        label={t("habitForm.name")}
        value={form.name}
        onChangeText={(value) => onChange({ name: value })}
        placeholder={t("habitForm.placeholders.name")}
        error={validation.errors.name}
      />

      <FormField
        label={t("habitForm.category")}
        value={form.category}
        onChangeText={(value) => onChange({ category: value })}
        placeholder={t("habitForm.placeholders.category")}
        error={validation.errors.category}
      />

      <FormField
        label={t("habitForm.identity")}
        value={form.identityStatement}
        onChangeText={(value) => onChange({ identityStatement: value })}
        placeholder={t("habitForm.placeholders.identity")}
        multiline
      />

      <FormField
        label={t("habitForm.cue")}
        value={form.cueText}
        onChangeText={(value) => onChange({ cueText: value })}
        placeholder={t("habitForm.placeholders.cue")}
        error={validation.errors.cueText}
        multiline
      />

      <FormField
        label={t("habitForm.reward")}
        value={form.rewardText}
        onChangeText={(value) => onChange({ rewardText: value })}
        placeholder={t("habitForm.placeholders.reward")}
        multiline
      />

      <DifficultySelector value={form.difficulty} onChange={(difficulty) => onChange({ difficulty })} />
      <BehaviorTypeSelector
        value={form.behaviorType}
        onChange={(behaviorType) => onChange({ behaviorType })}
      />

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
    </Surface>
  );
}
