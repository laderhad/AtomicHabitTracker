import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { Button, Surface } from "../../../components/primitives";
import { colors } from "../../../theme/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

export function TodayEmptyState() {
  const { t } = useTranslation();

  return (
    <Surface>
      <Text style={styles.cardTitle}>{t("today.noHabitsTitle")}</Text>
      <Text style={styles.copy}>{t("today.noHabitsCopy")}</Text>
      <Button
        label={t("today.createHabit")}
        icon={<Plus color={colors.surface} size={18} />}
        onPress={() => router.push("/habit/new")}
      />
    </Surface>
  );
}
