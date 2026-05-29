import { router } from "expo-router";
import { Bell, Globe2, LogOut, ShieldCheck, UserRound } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Appearance, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface } from "../../src/components/primitives";
import { ThemePicker } from "../../src/features/settings/components/ThemePicker";
import { ThemeOption } from "../../src/features/settings/themeOptions";
import { ApiError } from "../../src/services/apiClient";
import { normalizeLanguage, saveLanguagePreference, SupportedLanguage } from "../../src/services/languagePreference";
import { useUpdatePreferences } from "../../src/services/queries";
import { useAuthStore } from "../../src/store/auth";
import { useThemeStore } from "../../src/store/theme";
import { colors, layout, spacing } from "../../src/theme/theme";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const palette = useThemeStore((state) => state.palette);
  const setTheme = useThemeStore((state) => state.setTheme);
  const updatePreferences = useUpdatePreferences();
  const [languageMessage, setLanguageMessage] = useState<string | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const [pendingLanguage, setPendingLanguage] = useState<SupportedLanguage | null>(null);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [themeMessage, setThemeMessage] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
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

  async function changeTheme(theme: ThemeOption) {
    setThemeMessage(null);
    setThemeError(null);

    try {
      const savedTheme = await setTheme(theme);
      applyNativeColorScheme(savedTheme);
      setThemePickerOpen(false);
      setThemeMessage(t("settings.themeSaved"));
    } catch {
      setThemeError(t("settings.themeError"));
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.paper }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{t("settings.title")}</Text>
        </View>

        <SettingsCard
          icon={<UserRound color={palette.green} size={20} />}
          title={t("settings.account")}
          copy={user?.email ?? t("settings.signedOut")}
        />

        <Surface>
          <View style={styles.row}>
            <Globe2 color={palette.blue} size={20} />
            <View style={styles.sectionCopy}>
              <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t("settings.language")}</Text>
              <Text style={[styles.copy, { color: palette.muted }]}>
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
          {languageMessage ? <Text style={[styles.feedback, { color: palette.green }]}>{languageMessage}</Text> : null}
          {languageError ? <Text style={[styles.error, { color: palette.coral }]}>{languageError}</Text> : null}
        </Surface>

        <SettingsCard
          icon={<Bell color={palette.coral} size={20} />}
          title={t("settings.notifications")}
          copy={t("settings.notificationsCopy")}
          onPress={() => router.push("/notifications")}
        />
        <ThemePicker
          selectedTheme={selectedTheme}
          isOpen={themePickerOpen}
          onToggle={() => setThemePickerOpen((isOpen) => !isOpen)}
          onSelect={changeTheme}
        />
        {themeMessage ? <Text style={[styles.feedback, { color: palette.green }]}>{themeMessage}</Text> : null}
        {themeError ? <Text style={[styles.error, { color: palette.coral }]}>{themeError}</Text> : null}
        <SettingsCard
          icon={<ShieldCheck color={palette.green} size={20} />}
          title={t("settings.dataPrivacy")}
          copy={t("settings.dataPrivacyCopy")}
          onPress={() => router.push("/privacy")}
        />

        {user ? (
          <Button
            label={t("common.logout")}
            variant="secondary"
            icon={<LogOut color={palette.green} size={18} />}
            onPress={() => clearAuth()}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function applyNativeColorScheme(theme: ThemeOption) {
  if (Platform.OS === "web") {
    return;
  }

  const setColorScheme = Appearance.setColorScheme as (scheme: "light" | "dark" | null) => void;
  setColorScheme(theme.colorScheme);
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
  const palette = useThemeStore((state) => state.palette);
  const content = (
    <View style={styles.row}>
      {icon}
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, { color: palette.ink }]}>{title}</Text>
        <Text style={[styles.copy, { color: palette.muted }]}>{copy}</Text>
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
