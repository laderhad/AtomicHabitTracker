import { Bell, Database, Globe2, LogOut, Moon, Server, ShieldCheck, UserRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface } from "../../src/components/primitives";
import { API_BASE_URL } from "../../src/services/apiClient";
import { useClientConfig } from "../../src/services/queries";
import { useAuthStore } from "../../src/store/auth";
import { colors, layout, spacing } from "../../src/theme/theme";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const config = useClientConfig();
  const activeLanguage = i18n.language.startsWith("tr") ? t("settings.turkish") : t("settings.english");

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
              variant={i18n.language.startsWith("tr") ? "primary" : "secondary"}
              onPress={() => i18n.changeLanguage("tr-TR")}
            />
            <Button
              label="EN"
              variant={i18n.language.startsWith("en") ? "primary" : "secondary"}
              onPress={() => i18n.changeLanguage("en-US")}
            />
          </View>
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

function SettingsCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <Surface>
      <View style={styles.row}>
        {icon}
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.copy}>{copy}</Text>
        </View>
      </View>
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
});
