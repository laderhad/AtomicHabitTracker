import { router, useGlobalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { ErrorState } from "../../../components/ErrorState";
import { Button } from "../../../components/primitives";
import {
  useBadgeNotifications,
  useClientConfig,
  useCompleteHabit,
  useMarkNotificationsSeen,
  useTodayDashboard,
} from "../../../services/queries";
import { useAuthStore } from "../../../store/auth";
import { colors, spacing } from "../../../theme/theme";
import { uniqueTodayHabits } from "../../../utils/habits";
import { BadgeNotificationsCard } from "../components/BadgeNotificationsCard";
import { CheckInFeedbackBanner } from "../components/CheckInFeedbackBanner";
import { HabitRow } from "../components/HabitRow";
import { LoadingView } from "../components/LoadingView";
import { ScreenFrame } from "../components/ScreenFrame";
import { SignedOutToday } from "../components/SignedOutToday";
import { TodayEmptyState } from "../components/TodayEmptyState";
import { TodaySummaryCard } from "../components/TodaySummaryCard";

export function TodayScreen() {
  const { t, i18n } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.isHydrated);
  const today = useTodayDashboard();
  const config = useClientConfig();
  const notifications = useBadgeNotifications(i18n.language);
  const completeHabit = useCompleteHabit();
  const markSeen = useMarkNotificationsSeen();
  const params = useGlobalSearchParams<{ habitCreated?: string | string[] }>();
  const habits = uniqueTodayHabits(today.data?.habits ?? []);
  const refreshing = today.isRefetching || notifications.isRefetching;
  const nextFeedbackId = useRef(0);
  const [checkInFeedback, setCheckInFeedback] = useState<{
    id: number;
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const refreshToday = useCallback(() => {
    void Promise.all([today.refetch(), notifications.refetch()]);
  }, [notifications, today]);

  const showCheckInFeedback = useCallback((tone: "success" | "error", message: string) => {
    nextFeedbackId.current += 1;
    setCheckInFeedback({ id: nextFeedbackId.current, tone, message });
  }, []);

  const dismissCheckInFeedback = useCallback(() => {
    setCheckInFeedback(null);
  }, []);

  const completeTodayHabit = useCallback(
    async (habitId: string) => {
      try {
        await completeHabit.mutateAsync(habitId);
        showCheckInFeedback("success", t("today.checkInSaved"));
      } catch {
        showCheckInFeedback("error", t("today.checkInError"));
      }
    },
    [completeHabit, showCheckInFeedback, t],
  );

  useEffect(() => {
    const habitCreated = Array.isArray(params.habitCreated)
      ? params.habitCreated[0]
      : params.habitCreated;

    if (habitCreated !== "1") {
      return;
    }

    showCheckInFeedback("success", t("today.habitCreated"));
    router.replace("/");
  }, [params.habitCreated, showCheckInFeedback, t]);

  if (!hydrated) {
    return <LoadingView />;
  }

  if (!token) {
    return <SignedOutToday service={config.data?.service} />;
  }

  return (
    <ScreenFrame
      title={t("today.title")}
      subtitle={t("today.subtitle")}
      refreshing={refreshing}
      onRefresh={refreshToday}
      overlay={
        checkInFeedback ? (
          <CheckInFeedbackBanner
            toastKey={checkInFeedback.id}
            tone={checkInFeedback.tone}
            message={checkInFeedback.message}
            onDismiss={dismissCheckInFeedback}
          />
        ) : null
      }
    >
      <TodaySummaryCard habits={habits} />

      <BadgeNotificationsCard
        notifications={notifications.data ?? []}
        onDismiss={(unlockIds) => markSeen.mutate(unlockIds)}
      />

      {today.isLoading ? <LoadingView compact /> : null}

      {today.error ? (
        <ErrorState
          title={t("common.loadErrorTitle")}
          copy={t("common.loadErrorCopy")}
          actionLabel={t("common.retry")}
          onRetry={() => today.refetch()}
        />
      ) : habits.length ? (
        <>
          <Button
            label={t("today.addHabit")}
            variant="secondary"
            icon={<Plus color={colors.green} size={18} />}
            onPress={() => router.push("/habit/new")}
          />
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
              <HabitRow
                habit={item}
                onOpen={() => router.push(`/habit/${item.id}`)}
                onComplete={() => void completeTodayHabit(item.id)}
                isLoading={completeHabit.isPending && completeHabit.variables === item.id}
              />
            )}
          />
        </>
      ) : today.isFetched ? (
        <TodayEmptyState />
      ) : null}
    </ScreenFrame>
  );
}
