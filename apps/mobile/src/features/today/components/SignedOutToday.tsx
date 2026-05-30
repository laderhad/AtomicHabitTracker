import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { Button, Surface } from "../../../components/primitives";
import { todayStyles as styles } from "../TodayScreen.styles";
import { ScreenFrame } from "./ScreenFrame";

export function SignedOutToday({ service }: { service?: string }) {
  const { t } = useTranslation();

  return (
    <ScreenFrame title={t("today.title")} subtitle={t("today.subtitle")}>
      <Surface tone="green">
        <Text style={styles.cardTitle}>{t("today.signedOutTitle")}</Text>
        <Text style={styles.copy}>{t("today.signedOutCopy")}</Text>
        <Button label={t("common.login")} onPress={() => router.push("/auth")} />
      </Surface>
      <Text style={styles.meta}>{service ?? "Routivo.Api"}</Text>
    </ScreenFrame>
  );
}
