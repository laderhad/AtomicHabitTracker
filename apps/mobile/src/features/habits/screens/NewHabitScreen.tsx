import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Surface } from "../../../components/primitives";
import { ApiError } from "../../../services/apiClient";
import { scheduleHabitReminder } from "../../../services/localNotifications";
import { useCreateHabit, useUpsertHabitReminder } from "../../../services/queries";
import { useAuthStore } from "../../../store/auth";
import { colors, spacing } from "../../../theme/theme";
import { isHabitFormReady, validateHabitForm } from "../habitFormValidation";
import { makeHabitTemplates } from "../habitTemplates";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";
import {
  emptyHabitFormState,
  emptyReminderFormState,
  HabitFormState,
  HabitTemplate,
  ReminderFormState,
  toCreateHabitInput,
  toUpsertHabitReminderInput,
} from "../types";
import { HabitDetailsForm } from "../components/HabitDetailsForm";
import { NewHabitHeader } from "../components/NewHabitHeader";
import { HabitTemplatePicker } from "../components/HabitTemplatePicker";
import { PrimaryButton } from "../components/PrimaryButton";
import { ReminderSection } from "../components/ReminderSection";

export function NewHabitScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.isHydrated);
  const templates = useMemo(() => makeHabitTemplates(t), [t]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [form, setForm] = useState<HabitFormState>(emptyHabitFormState);
  const [reminder, setReminder] = useState<ReminderFormState>(emptyReminderFormState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const createHabit = useCreateHabit();
  const upsertReminder = useUpsertHabitReminder();
  const formReady = isHabitFormReady(form, reminder);
  const isSaving = createHabit.isPending || upsertReminder.isPending;
  const validation = hasSubmitted
    ? validateHabitForm(form, reminder, t)
    : { isValid: formReady, errors: {} };

  function patchForm(update: Partial<HabitFormState>) {
    setSubmitError(null);
    setForm((current) => ({ ...current, ...update }));
  }

  function applyTemplate(template: HabitTemplate) {
    setSubmitError(null);
    setHasSubmitted(false);
    setSelectedTemplateId(template.id);
    setForm(template.form);
    setReminder(template.reminder);
  }

  function patchReminder(update: Partial<ReminderFormState>) {
    setSubmitError(null);
    setReminder((current) => ({ ...current, ...update }));
  }

  async function submit() {
    setHasSubmitted(true);
    setSubmitError(null);

    const nextValidation = validateHabitForm(form, reminder, t);
    if (!nextValidation.isValid) {
      return;
    }

    try {
      const habit = await createHabit.mutateAsync(toCreateHabitInput(form));

      if (reminder.enabled) {
        await upsertReminder.mutateAsync({
          habitId: habit.id,
          input: toUpsertHabitReminderInput(
            reminder,
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul",
          ),
        });

        await scheduleHabitReminder({
          habitId: habit.id,
          habitName: habit.name,
          enabled: reminder.enabled,
          triggerTime: reminder.triggerTime,
          daysOfWeek: reminder.daysOfWeek,
          body: t("habitForm.reminderNotificationBody"),
        });
      }

      router.replace("/");
    } catch (submitError) {
      setSubmitError(submitError instanceof ApiError ? submitError.message : t("habitForm.errorGeneric"));
    }
  }

  if (!hydrated) {
    return <NewHabitLoading />;
  }

  if (!token) {
    return <SignedOutNewHabit title={t("habitForm.title")} subtitle={t("habitForm.subtitle")} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
          <NewHabitHeader title={t("habitForm.title")} subtitle={t("habitForm.subtitle")} />
          <HabitTemplatePicker
            title={t("habitForm.templateTitle")}
            description={t("habitForm.templateDescription")}
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelect={applyTemplate}
          />
          <HabitDetailsForm
            form={form}
            submitError={submitError}
            validation={validation}
            onChange={patchForm}
          />
          <ReminderSection
            reminder={reminder}
            error={validation.errors.reminderTime}
            onChange={patchReminder}
          />
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <PrimaryButton
            label={t("habitForm.save")}
            loadingLabel={t("habitForm.saving")}
            icon={<Check color={colors.surface} size={18} />}
            disabled={!formReady}
            isLoading={isSaving}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function NewHabitLoading() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loading}>
        <ActivityIndicator color={colors.green} />
      </View>
    </SafeAreaView>
  );
}

function SignedOutNewHabit({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NewHabitHeader title={title} subtitle={subtitle} />
        <Surface>
          <Text style={styles.cardTitle}>{t("today.signedOutTitle")}</Text>
          <Button label={t("common.login")} onPress={() => router.replace("/auth")} />
        </Surface>
      </View>
    </SafeAreaView>
  );
}
