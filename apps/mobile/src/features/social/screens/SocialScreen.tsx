import { router } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Button, Surface } from "../../../components/primitives";
import { queryKeys } from "../../../services/queries";
import { colors } from "../../../theme/theme";
import { useAuthStore } from "../../../store/auth";
import { ChallengeList } from "../components/ChallengeList";
import { CreateChallengeCard } from "../components/CreateChallengeCard";
import { ShareProgressCard } from "../components/ShareProgressCard";
import { socialStyles as styles } from "../SocialScreen.styles";

export function SocialScreen() {
  const { t } = useTranslation();
  const hydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const socialFetchCount =
    useIsFetching({ queryKey: queryKeys.challenges }) + useIsFetching({ queryKey: queryKeys.shareCards });

  const refreshSocial = useCallback(() => {
    if (!token) {
      return;
    }

    void Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges }),
      queryClient.invalidateQueries({ queryKey: queryKeys.shareCards }),
    ]);
  }, [queryClient, token]);

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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          token ? (
            <RefreshControl
              refreshing={socialFetchCount > 0}
              onRefresh={refreshSocial}
              tintColor={colors.green}
              colors={[colors.green]}
            />
          ) : undefined
        }
      >
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
