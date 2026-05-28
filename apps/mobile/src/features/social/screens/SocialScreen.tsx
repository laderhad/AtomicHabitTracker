import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Button, Surface } from "../../../components/primitives";
import { useAuthStore } from "../../../store/auth";
import { colors } from "../../../theme/theme";
import { ChallengeList } from "../components/ChallengeList";
import { CreateChallengeCard } from "../components/CreateChallengeCard";
import { ShareProgressCard } from "../components/ShareProgressCard";
import { socialStyles as styles } from "../SocialScreen.styles";

export function SocialScreen() {
  const { t } = useTranslation();
  const hydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.accessToken);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator color={colors.green} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t("social.title")}</Text>
          <Text style={styles.subtitle}>{t("social.subtitle")}</Text>
        </View>

        {!token ? (
          <Surface tone="green">
            <Text style={styles.cardTitle}>{t("social.signedOutTitle")}</Text>
            <Text style={styles.copy}>{t("social.signedOutCopy")}</Text>
            <Button label={t("common.login")} onPress={() => router.push("/auth")} />
          </Surface>
        ) : (
          <>
            <ShareProgressCard />
            <CreateChallengeCard />
            <ChallengeList />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
