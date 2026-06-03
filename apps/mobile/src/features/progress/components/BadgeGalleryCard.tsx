import { Award, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { GamificationSummary } from "../../../services/types";
import { useThemeStore } from "../../../store/theme";
import { radius, spacing } from "../../../theme/theme";

type BadgeGalleryCardProps = {
  summary?: GamificationSummary;
};

export function BadgeGalleryCard({ summary }: BadgeGalleryCardProps) {
  const { t, i18n } = useTranslation();
  const palette = useThemeStore((state) => state.palette);
  const totalBadgeCount = summary?.totalBadgeCount ?? 0;
  const unlockedBadgeCount = summary?.unlockedBadgeCount ?? 0;
  const progressPercent = totalBadgeCount > 0 ? Math.round((unlockedBadgeCount / totalBadgeCount) * 100) : 0;
  const latestUnlock = summary?.recentUnlocks[0];
  const latestBadge = latestUnlock
    ? summary.badges.find((badge) => badge.code === latestUnlock.badgeCode)
    : null;
  const latestUnlockDate = latestUnlock ? formatUnlockDate(latestUnlock.unlockedAt, i18n.language) : null;

  return (
    <Surface style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Award color={palette.gold} size={20} />
          <Text style={[styles.title, { color: palette.ink }]}>{t("progress.badgeGalleryTitle")}</Text>
        </View>
        <View style={[styles.countPill, { backgroundColor: palette.goldSoft }]}>
          <Text style={[styles.countText, { color: palette.gold }]}>
            {t("progress.badgeProgress", { unlocked: unlockedBadgeCount, total: totalBadgeCount })}
          </Text>
        </View>
      </View>

      <Text style={[styles.copy, { color: palette.muted }]}>
        {unlockedBadgeCount === totalBadgeCount && totalBadgeCount > 0
          ? t("progress.allBadgesUnlocked")
          : t("progress.badgeGalleryCopy")}
      </Text>

      <View style={[styles.progressTrack, { backgroundColor: palette.faint }]}>
        <View style={[styles.progressFill, { backgroundColor: palette.gold, width: `${progressPercent}%` }]} />
      </View>

      {latestBadge && latestUnlockDate ? (
        <View style={[styles.latestUnlock, { backgroundColor: palette.greenSoft, borderColor: palette.greenLine }]}>
          <Sparkles color={palette.green} size={18} />
          <View style={styles.latestCopy}>
            <Text style={[styles.latestLabel, { color: palette.green }]}>{t("progress.latestUnlock")}</Text>
            <Text style={[styles.latestTitle, { color: palette.ink }]}>
              {latestBadge.title} · {latestUnlockDate}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.latestUnlock, { backgroundColor: palette.faint, borderColor: palette.line }]}>
          <LockKeyhole color={palette.muted} size={18} />
          <Text style={[styles.copy, { color: palette.muted }]}>{t("progress.noBadgesUnlocked")}</Text>
        </View>
      )}

      <View style={styles.badgeGrid}>
        {summary?.badges.map((badge) => (
          <View
            key={badge.code}
            style={[
              styles.badgeTile,
              {
                backgroundColor: badge.isUnlocked ? palette.goldSoft : palette.faint,
                borderColor: badge.isUnlocked ? palette.gold : palette.line,
              },
            ]}
          >
            <View style={styles.badgeTileHeader}>
              {badge.isUnlocked ? (
                <CheckCircle2 color={palette.gold} size={17} />
              ) : (
                <LockKeyhole color={palette.muted} size={16} />
              )}
              <Text style={[styles.badgeStatus, { color: badge.isUnlocked ? palette.gold : palette.muted }]}>
                {badge.isUnlocked ? t("progress.unlockedBadge") : t("progress.lockedBadge")}
              </Text>
            </View>
            <Text style={[styles.badgeTitle, { color: palette.ink }]}>{badge.title}</Text>
            <Text style={[styles.badgeDescription, { color: palette.muted }]} numberOfLines={2}>
              {badge.description}
            </Text>
          </View>
        ))}
      </View>
    </Surface>
  );
}

function formatUnlockDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  countPill: {
    minHeight: 30,
    borderRadius: 999,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  countText: {
    fontSize: 12,
    fontWeight: "900",
  },
  copy: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
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
  latestUnlock: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  latestCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  latestLabel: {
    fontSize: 12,
    fontWeight: "900",
  },
  latestTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badgeTile: {
    minWidth: 150,
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  badgeTileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  badgeStatus: {
    fontSize: 11,
    fontWeight: "900",
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  badgeDescription: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
});
