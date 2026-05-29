import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback } from "react";
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
  const habits = uniqueTodayHabits(today.data?.habits ?? []);
  const refreshing = today.isRefetching || notifications.isRefetching;

  const refreshToday = useCallback(() => {
    void Promise.all([today.refetch(), notifications.refetch()]);
  }, [notifications, today]);

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
                onComplete={() => completeHabit.mutate(item.id)}
                isLoading={completeHabit.isPending}
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
