import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { Button, Surface } from "../../../components/primitives";
import { useThemeStore } from "../../../store/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

export function TodayEmptyState() {
  const { t } = useTranslation();
  const palette = useThemeStore((state) => state.palette);

  return (
    <Surface>
      <Text style={[styles.cardTitle, { color: palette.ink }]}>{t("today.noHabitsTitle")}</Text>
      <Text style={[styles.copy, { color: palette.muted }]}>{t("today.noHabitsCopy")}</Text>
      <Button
        label={t("today.createHabit")}
        icon={<Plus color={palette.surface} size={18} />}
        onPress={() => router.push("/habit/new")}
      />
    </Surface>
  );
}
