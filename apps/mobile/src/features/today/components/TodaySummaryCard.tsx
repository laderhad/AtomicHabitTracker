import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { TodayHabit } from "../../../services/types";
import { todayStyles as styles } from "../TodayScreen.styles";

export function TodaySummaryCard({ habits }: { habits: TodayHabit[] }) {
  const { t } = useTranslation();
  const total = habits.length;
  const completed = habits.filter((habit) => habit.completedToday).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  if (!total) {
    return null;
  }

  return (
    <Surface style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View>
          <Text style={styles.summaryTitle}>{t("today.summaryTitle", { completed, total })}</Text>
          <Text style={styles.summaryCopy}>{getMotivation(total - completed, completed, t)}</Text>
        </View>
        <Text style={styles.summaryPercent}>%{percent}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </Surface>
  );
}

function getMotivation(remaining: number, completed: number, t: ReturnType<typeof useTranslation>["t"]) {
  if (remaining === 0) {
    return t("today.motivation.keepSystem");
  }

  if (remaining === 1) {
    return t("today.motivation.oneLeft");
  }

  if (completed === 0) {
    return t("today.motivation.smallStep");
  }

  return t("today.motivation.keepGoing");
}
