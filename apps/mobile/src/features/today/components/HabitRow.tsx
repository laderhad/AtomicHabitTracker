import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { TodayHabit } from "../../../services/types";
import { colors } from "../../../theme/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

export function HabitRow({
  habit,
  onComplete,
  isLoading,
}: {
  habit: TodayHabit;
  onComplete: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Surface>
      <View style={styles.rowBetween}>
        <View style={styles.habitText}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.copy}>
            {t("today.cue")}: {habit.cueText || habit.category}
          </Text>
        </View>
        {habit.completedToday ? (
          <View style={styles.donePill}>
            <Check color={colors.green} size={16} />
            <Text style={styles.doneText}>{t("today.completed")}</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("today.complete")}
            onPress={onComplete}
            style={styles.completeButton}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={colors.surface} /> : <Check color={colors.surface} size={20} />}
          </Pressable>
        )}
      </View>
    </Surface>
  );
}
