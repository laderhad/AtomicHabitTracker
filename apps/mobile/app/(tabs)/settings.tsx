import { router } from "expo-router";
import { Bell, Database, Globe2, LogOut, Moon, Server, ShieldCheck, UserRound } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface } from "../../src/components/primitives";
import { API_BASE_URL, ApiError } from "../../src/services/apiClient";
import { normalizeLanguage, saveLanguagePreference, SupportedLanguage } from "../../src/services/languagePreference";
import { useClientConfig, useUpdatePreferences } from "../../src/services/queries";
import { useAuthStore } from "../../src/store/auth";
import { colors, layout, spacing } from "../../src/theme/theme";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const config = useClientConfig();
  const updatePreferences = useUpdatePreferences();
  const [languageMessage, setLanguageMessage] = useState<string | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const [pendingLanguage, setPendingLanguage] = useState<SupportedLanguage | null>(null);
  const currentLanguage = normalizeLanguage(i18n.language);
  const activeLanguage = currentLanguage === "tr-TR" ? t("settings.turkish") : t("settings.english");

  async function changeLanguage(language: SupportedLanguage) {
    setLanguageMessage(null);
    setLanguageError(null);
    setPendingLanguage(language);

    try {
      const normalizedLanguage = await saveLanguagePreference(language);
      await i18n.changeLanguage(normalizedLanguage);

      if (user) {
        await updatePreferences.mutateAsync({
          preferredLanguage: normalizedLanguage,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || user.timeZone,
        });
      }

      setLanguageMessage(i18n.getFixedT(normalizedLanguage)("settings.languageSaved"));
    } catch (error) {
      setLanguageError(error instanceof ApiError ? error.message : t("settings.languageError"));
    } finally {
      setPendingLanguage(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("settings.title")}</Text>
        </View>

        <SettingsCard
          icon={<UserRound color={colors.green} size={20} />}
          title={t("settings.account")}
          copy={user?.email ?? t("settings.signedOut")}
        />

        <Surface>
          <View style={styles.row}>
            <Globe2 color={colors.blue} size={20} />
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
              <Text style={styles.copy}>
                {t("settings.activeLanguage")}: {activeLanguage}
              </Text>
            </View>
          </View>
          <View style={styles.languageRow}>
            <Button
              label="TR"
              variant={currentLanguage === "tr-TR" ? "primary" : "secondary"}
              disabled={updatePreferences.isPending}
              isLoading={pendingLanguage === "tr-TR"}
              onPress={() => changeLanguage("tr-TR")}
            />
            <Button
              label="EN"
              variant={currentLanguage === "en-US" ? "primary" : "secondary"}
              disabled={updatePreferences.isPending}
              isLoading={pendingLanguage === "en-US"}
              onPress={() => changeLanguage("en-US")}
            />
          </View>
          {languageMessage ? <Text style={styles.feedback}>{languageMessage}</Text> : null}
          {languageError ? <Text style={styles.error}>{languageError}</Text> : null}
        </Surface>

        <SettingsCard
          icon={<Bell color={colors.coral} size={20} />}
          title={t("settings.notifications")}
          copy={t("settings.notificationsCopy")}
        />
        <SettingsCard icon={<Moon color={colors.blue} size={20} />} title={t("settings.theme")} copy={t("settings.themeCopy")} />
        <SettingsCard
          icon={<ShieldCheck color={colors.green} size={20} />}
          title={t("settings.dataPrivacy")}
          copy={t("settings.dataPrivacyCopy")}
          onPress={() => router.push("/privacy")}
        />

        {user ? (
          <Button
            label={t("common.logout")}
            variant="secondary"
            icon={<LogOut color={colors.green} size={18} />}
            onPress={() => clearAuth()}
          />
        ) : null}

        {__DEV__ ? (
          <Surface>
            <View style={styles.row}>
              <Server color={colors.green} size={20} />
              <Text style={styles.sectionTitle}>{t("settings.api")}</Text>
            </View>
            <Text style={styles.mono}>{API_BASE_URL}</Text>
            <View style={styles.row}>
              <Database color={colors.muted} size={16} />
              <Text style={styles.copy}>
                {t("settings.config")}: {config.data?.apiVersion ?? "v1"} / {config.data?.deepLinkScheme ?? "atomichabits"}
              </Text>
            </View>
          </Surface>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsCard({
  icon,
  title,
  copy,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.row}>
      {icon}
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.copy}>{copy}</Text>
      </View>
    </View>
  );

  return (
    <Surface>
      {onPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
          {content}
        </Pressable>
      ) : (
        content
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  container: {
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: layout.bottomContentPadding,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  mono: {
    color: colors.ink,
    fontFamily: "Menlo",
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  languageRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  feedback: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "800",
  },
  error: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
  },
});
