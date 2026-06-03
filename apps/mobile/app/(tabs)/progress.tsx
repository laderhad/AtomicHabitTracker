import { CalendarDays, Flame } from "lucide-react-native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorState } from "../../src/components/ErrorState";
import { Metric, Surface } from "../../src/components/primitives";
import { BadgeGalleryCard } from "../../src/features/progress/components/BadgeGalleryCard";
import { WeeklyReviewCard } from "../../src/features/progress/components/WeeklyReviewCard";
import { useGamificationSummary, useProgressDashboard } from "../../src/services/queries";
import { useAuthStore } from "../../src/store/auth";
import { useThemeStore } from "../../src/store/theme";
import { colors, layout, spacing } from "../../src/theme/theme";
import { uniqueProgressHabits } from "../../src/utils/habits";

export default function ProgressScreen() {
  const { t, i18n } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const palette = useThemeStore((state) => state.palette);
  const progress = useProgressDashboard();
  const gamification = useGamificationSummary(i18n.language);
  const habits = uniqueProgressHabits(progress.data?.habits ?? []);
  const completionPercent = Math.round((progress.data?.completionRate ?? 0) * 100);
  const normalizedCompletionPercent = Math.max(0, Math.min(100, completionPercent));
  const refreshing = progress.isRefetching || gamification.isRefetching;

  const refreshProgress = useCallback(() => {
    if (!token) {
      return;
    }

    void Promise.all([progress.refetch(), gamification.refetch()]);
  }, [gamification, progress, token]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.paper }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          token ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshProgress}
              tintColor={palette.green}
              colors={[palette.green]}
            />
          ) : undefined
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{t("progress.title")}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>{t("progress.subtitle")}</Text>
        </View>

        {!token ? (
          <Surface>
            <Text style={[styles.copy, { color: palette.muted }]}>{t("settings.signedOut")}</Text>
          </Surface>
        ) : progress.isLoading ? (
          <ActivityIndicator color={palette.green} />
        ) : progress.error ? (
          <ErrorState
            title={t("common.loadErrorTitle")}
            copy={t("common.loadErrorCopy")}
            actionLabel={t("common.retry")}
            onRetry={() => progress.refetch()}
          />
        ) : (
          <>
            <Surface style={styles.weekCard}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <CalendarDays color={palette.green} size={20} />
                  <Text style={[styles.cardTitle, { color: palette.ink }]}>{t("progress.lastSevenDays")}</Text>
                </View>
                <Text style={[styles.percentText, { color: palette.green }]}>%{completionPercent}</Text>
              </View>
              <Text style={[styles.copy, { color: palette.muted }]}>{t("progress.systemPulse")}</Text>
              <View style={[styles.progressTrack, { backgroundColor: palette.faint }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: palette.green, width: `${normalizedCompletionPercent}%` },
                  ]}
                />
              </View>
            </Surface>

            <WeeklyReviewCard />

            <View style={styles.metrics}>
              <Metric label={t("progress.weeklyCompletion")} value={`%${completionPercent}`} />
              <Metric
                label={t("progress.badges")}
                value={`${gamification.data?.unlockedBadgeCount ?? 0}/${gamification.data?.totalBadgeCount ?? 9}`}
              />
              <Metric label={t("progress.activeHabits")} value={`${habits.length}`} />
            </View>

            <BadgeGalleryCard summary={gamification.data} />

            <Surface>
              <View style={styles.row}>
                <Flame color={palette.coral} size={20} />
                <Text style={[styles.cardTitle, { color: palette.ink }]}>{t("progress.streaks")}</Text>
              </View>
              {habits.length ? (
                <FlatList
                  data={habits}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={[styles.streakRow, { borderBottomColor: palette.faint }]}>
                      <Text style={[styles.habitName, { color: palette.ink }]}>{item.name}</Text>
                      <Text style={[styles.streakText, { color: item.currentStreak > 0 ? palette.coral : palette.green }]}>
                        {item.currentStreak > 0
                          ? t("progress.streakDays", { count: item.currentStreak })
                          : t("progress.waitingToday")}
                      </Text>
                    </View>
                  )}
                />
              ) : (
                <Text style={[styles.copy, { color: palette.muted }]}>{t("progress.noData")}</Text>
              )}
            </Surface>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  container: {
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: layout.bottomContentPadding,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  weekCard: {
    gap: spacing.md,
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  percentText: {
    fontSize: 24,
    fontWeight: "900",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  streakRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  habitName: {
    flex: 1,
    fontWeight: "800",
  },
  streakText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
