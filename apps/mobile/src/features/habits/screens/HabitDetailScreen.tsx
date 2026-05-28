import { router, useLocalSearchParams } from "expo-router";
import { Archive, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Surface } from "../../../components/primitives";
import { ApiError } from "../../../services/apiClient";
import { cancelHabitReminder, scheduleHabitReminder } from "../../../services/localNotifications";
import {
  useArchiveHabit,
  useDisableHabitReminder,
  useHabit,
  useHabitReminder,
  useUpdateHabit,
  useUpsertHabitReminder,
} from "../../../services/queries";
import { useAuthStore } from "../../../store/auth";
import { colors, spacing } from "../../../theme/theme";
import { isHabitFormReady, validateHabitForm } from "../habitFormValidation";
import { HabitDetailsForm } from "../components/HabitDetailsForm";
import { NewHabitHeader } from "../components/NewHabitHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { ReminderSection } from "../components/ReminderSection";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";
import {
  emptyHabitFormState,
  emptyReminderFormState,
  HabitFormState,
  ReminderFormState,
  toHabitFormState,
  toReminderFormState,
  toUpdateHabitInput,
  toUpsertHabitReminderInput,
} from "../types";

export function HabitDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ habitId?: string | string[] }>();
  const habitId = Array.isArray(params.habitId) ? params.habitId[0] : params.habitId ?? null;
  const insets = useSafeAreaInsets();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.isHydrated);
  const habit = useHabit(habitId);
  const habitReminder = useHabitReminder(habitId);
  const updateHabit = useUpdateHabit();
  const upsertReminder = useUpsertHabitReminder();
  const disableReminder = useDisableHabitReminder();
  const archiveHabit = useArchiveHabit();
  const [form, setForm] = useState<HabitFormState>(emptyHabitFormState);
  const [reminder, setReminder] = useState<ReminderFormState>(emptyReminderFormState);
  const [initializedHabitId, setInitializedHabitId] = useState<string | null>(null);
  const [initializedReminderHabitId, setInitializedReminderHabitId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (habit.data && habit.data.id !== initializedHabitId) {
      setForm(toHabitFormState(habit.data));
      setInitializedHabitId(habit.data.id);
      setSubmitError(null);
      setHasSubmitted(false);
    }
  }, [habit.data, initializedHabitId]);

  useEffect(() => {
    if (habitId && habitReminder.isFetched && habitId !== initializedReminderHabitId) {
      setReminder(toReminderFormState(habitReminder.data));
      setInitializedReminderHabitId(habitId);
    }
  }, [habitId, habitReminder.data, habitReminder.isFetched, initializedReminderHabitId]);

  const formReady = isHabitFormReady(form, reminder);
  const validation = hasSubmitted
    ? validateHabitForm(form, reminder, t)
    : { isValid: formReady, errors: {} };
  const isSaving = updateHabit.isPending || upsertReminder.isPending || disableReminder.isPending;
  const isArchiving = archiveHabit.isPending;

  function patchForm(update: Partial<HabitFormState>) {
    setSubmitError(null);
    setForm((current) => ({ ...current, ...update }));
  }

  function patchReminder(update: Partial<ReminderFormState>) {
    setSubmitError(null);
    setReminder((current) => ({ ...current, ...update }));
  }

  async function submit() {
    setHasSubmitted(true);
    setSubmitError(null);

    if (!habitId) {
      setSubmitError(t("habitDetail.notFound"));
      return;
    }

    const nextValidation = validateHabitForm(form, reminder, t);
    if (!nextValidation.isValid) {
      return;
    }

    try {
      const updatedHabit = await updateHabit.mutateAsync({
        habitId,
        input: toUpdateHabitInput(form),
      });

      if (reminder.enabled) {
        await upsertReminder.mutateAsync({
          habitId,
          input: toUpsertHabitReminderInput(
            reminder,
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul",
          ),
        });

        await scheduleHabitReminder({
          habitId,
          habitName: updatedHabit.name,
          enabled: reminder.enabled,
          triggerTime: reminder.triggerTime,
          daysOfWeek: reminder.daysOfWeek,
          body: t("habitForm.reminderNotificationBody"),
        });
      } else {
        await disableReminder.mutateAsync(habitId);
        await cancelHabitReminder(habitId);
      }

      router.replace("/");
    } catch (submitError) {
      setSubmitError(submitError instanceof ApiError ? submitError.message : t("habitDetail.updateError"));
    }
  }

  function confirmArchive() {
    if (!habitId) {
      return;
    }

    Alert.alert(t("habitDetail.archiveTitle"), t("habitDetail.archiveCopy"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("habitDetail.archive"),
        style: "destructive",
        onPress: () => {
          void archive();
        },
      },
    ]);
  }

  async function archive() {
    if (!habitId) {
      return;
    }

    setSubmitError(null);

    try {
      await archiveHabit.mutateAsync(habitId);
      await cancelHabitReminder(habitId);
      router.replace("/");
    } catch (archiveError) {
      setSubmitError(archiveError instanceof ApiError ? archiveError.message : t("habitDetail.archiveError"));
    }
  }

  if (!hydrated || habit.isLoading || habitReminder.isLoading) {
    return <HabitDetailLoading />;
  }

  if (!token) {
    return <SignedOutHabitDetail />;
  }

  if (!habitId || habit.error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <NewHabitHeader title={t("habitDetail.title")} subtitle={t("habitDetail.notFound")} />
          <Surface>
            <Text style={styles.error}>{t("habitDetail.loadError")}</Text>
            <Button label={t("common.retry")} variant="secondary" onPress={() => habit.refetch()} />
          </Surface>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
          <NewHabitHeader title={t("habitDetail.title")} subtitle={t("habitDetail.subtitle")} />
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
          <Surface tone="coral">
            <Text style={styles.cardTitle}>{t("habitDetail.archiveTitle")}</Text>
            <Text style={styles.helperText}>{t("habitDetail.archiveCopy")}</Text>
            <Button
              label={t("habitDetail.archive")}
              loadingLabel={t("habitDetail.archiving")}
              variant="secondary"
              icon={<Archive color={colors.green} size={18} />}
              disabled={isArchiving || isSaving}
              isLoading={isArchiving}
              onPress={confirmArchive}
            />
          </Surface>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <PrimaryButton
            label={t("habitDetail.save")}
            loadingLabel={t("habitDetail.saving")}
            icon={<Check color={colors.surface} size={18} />}
            disabled={!formReady || isArchiving}
            isLoading={isSaving}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function HabitDetailLoading() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loading}>
        <ActivityIndicator color={colors.green} />
      </View>
    </SafeAreaView>
  );
}

function SignedOutHabitDetail() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NewHabitHeader title={t("habitDetail.title")} subtitle={t("habitDetail.subtitle")} />
        <Surface>
          <Text style={styles.cardTitle}>{t("today.signedOutTitle")}</Text>
          <Button label={t("common.login")} onPress={() => router.replace("/auth")} />
        </Surface>
      </View>
    </SafeAreaView>
  );
}
