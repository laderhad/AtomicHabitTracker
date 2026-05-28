import { Award, CalendarDays, Flame, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Metric, Surface } from "../../src/components/primitives";
import { useGamificationSummary, useProgressDashboard } from "../../src/services/queries";
import { useAuthStore } from "../../src/store/auth";
import { colors, layout, spacing } from "../../src/theme/theme";
import { uniqueProgressHabits } from "../../src/utils/habits";
import { WeeklyReviewCard } from "../../src/features/progress/components/WeeklyReviewCard";

export default function ProgressScreen() {
  const { t, i18n } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const progress = useProgressDashboard();
  const gamification = useGamificationSummary(i18n.language);
  const habits = uniqueProgressHabits(progress.data?.habits ?? []);
  const completionPercent = Math.round((progress.data?.completionRate ?? 0) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("progress.title")}</Text>
          <Text style={styles.subtitle}>{t("progress.subtitle")}</Text>
        </View>

        {!token ? (
          <Surface>
            <Text style={styles.copy}>{t("settings.signedOut")}</Text>
          </Surface>
        ) : progress.isLoading ? (
          <ActivityIndicator color={colors.green} />
        ) : (
          <>
            <Surface style={styles.weekCard}>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <CalendarDays color={colors.green} size={20} />
                  <Text style={styles.cardTitle}>{t("progress.lastSevenDays")}</Text>
                </View>
                <Text style={styles.percentText}>%{completionPercent}</Text>
              </View>
              <Text style={styles.copy}>{t("progress.systemPulse")}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
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

            <Surface>
              <View style={styles.row}>
                <Award color={colors.gold} size={20} />
                <Text style={styles.cardTitle}>{t("progress.badges")}</Text>
              </View>
              <View style={styles.badgeGrid}>
                {gamification.data?.badges.map((badge) => (
                  <View key={badge.code} style={[styles.badgeChip, badge.isUnlocked && styles.badgeUnlocked]}>
                    <Text style={[styles.badgeText, badge.isUnlocked && styles.badgeUnlockedText]}>{badge.title}</Text>
                  </View>
                ))}
              </View>
            </Surface>

            <Surface>
              <View style={styles.row}>
                <Flame color={colors.coral} size={20} />
                <Text style={styles.cardTitle}>{t("progress.streaks")}</Text>
              </View>
              {habits.length ? (
                <FlatList
                  data={habits}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.streakRow}>
                      <Text style={styles.habitName}>{item.name}</Text>
                      <Text style={styles.streakText}>
                        {item.currentStreak > 0
                          ? t("progress.streakDays", { count: item.currentStreak })
                          : t("progress.waitingToday")}
                      </Text>
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.copy}>{t("progress.noData")}</Text>
              )}
            </Surface>
          </>
        )}

        {progress.error ? (
          <Button
            label={t("common.retry")}
            variant="secondary"
            icon={<RefreshCw color={colors.green} size={18} />}
            onPress={() => progress.refetch()}
          />
        ) : null}
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
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
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
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  percentText: {
    color: colors.green,
    fontSize: 24,
    fontWeight: "900",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.faint,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.green,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badgeChip: {
    borderRadius: 999,
    backgroundColor: colors.faint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeUnlocked: {
    backgroundColor: colors.goldSoft,
  },
  badgeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  badgeUnlockedText: {
    color: colors.gold,
  },
  streakRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.faint,
    gap: spacing.md,
  },
  habitName: {
    flex: 1,
    color: colors.ink,
    fontWeight: "800",
  },
  streakText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: "900",
  },
});
