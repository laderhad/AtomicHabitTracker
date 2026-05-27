import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { colors } from "../../../theme/theme";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";

export function NewHabitHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useTranslation();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
        onPress={goBack}
        style={styles.backButton}
      >
        <ArrowLeft color={colors.ink} size={22} />
      </Pressable>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}
