import { Check, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { TodayHabit } from "../../../services/types";
import { useThemeStore } from "../../../store/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

export function HabitRow({
  habit,
  onComplete,
  onOpen,
  isLoading,
}: {
  habit: TodayHabit;
  onComplete: () => void;
  onOpen: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const palette = useThemeStore((state) => state.palette);

  return (
    <Surface>
      <View style={styles.rowBetween}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("today.openHabit", { name: habit.name })}
          onPress={onOpen}
          style={styles.habitText}
        >
          <Text style={[styles.habitName, { color: palette.ink }]}>{habit.name}</Text>
          <Text style={[styles.copy, { color: palette.muted }]}>
            {t("today.cue")}: {habit.cueText || habit.category}
          </Text>
        </Pressable>
        {habit.completedToday ? (
          <View style={[styles.donePill, { backgroundColor: palette.greenSoft }]}>
            <Check color={palette.green} size={16} />
            <Text style={[styles.doneText, { color: palette.green }]}>{t("today.completed")}</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("today.complete")}
            onPress={onComplete}
            style={[styles.completeButton, { backgroundColor: palette.green }]}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={palette.surface} /> : <Check color={palette.surface} size={20} />}
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("today.openHabit", { name: habit.name })}
          onPress={onOpen}
          style={styles.openHabitButton}
        >
          <ChevronRight color={palette.muted} size={20} />
        </Pressable>
      </View>
    </Surface>
  );
}
