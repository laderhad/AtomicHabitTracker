import { router } from "expo-router";
import { ArrowLeft, Download, ShieldCheck, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface } from "../../../components/primitives";
import { ApiError } from "../../../services/apiClient";
import { useDeleteAccount, useExportPrivacyData } from "../../../services/queries";
import { PrivacyExport } from "../../../services/types";
import { useAuthStore } from "../../../store/auth";
import { colors } from "../../../theme/theme";
import { privacyStyles as styles } from "../PrivacyScreen.styles";

export function PrivacyScreen() {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.accessToken);
  const exportPrivacyData = useExportPrivacyData();
  const deleteAccount = useDeleteAccount();
  const [exportedData, setExportedData] = useState<PrivacyExport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportPreview = useMemo(() => {
    if (!exportedData) {
      return "";
    }

    return JSON.stringify(exportedData, null, 2);
  }, [exportedData]);

  async function exportData() {
    setMessage(null);
    setError(null);

    try {
      const data = await exportPrivacyData.mutateAsync();
      setExportedData(data);
      setMessage(t("privacy.exportReady"));
    } catch (exportError) {
      setError(exportError instanceof ApiError ? exportError.message : t("privacy.exportError"));
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(t("privacy.deleteTitle"), t("privacy.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("privacy.deleteAction"),
        style: "destructive",
        onPress: () => {
          void deleteMyAccount();
        },
      },
    ]);
  }

  async function deleteMyAccount() {
    setMessage(null);
    setError(null);

    try {
      await deleteAccount.mutateAsync();
      router.replace("/auth");
    } catch (deleteError) {
      setError(deleteError instanceof ApiError ? deleteError.message : t("privacy.deleteError"));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            style={styles.backButton}
          >
            <ArrowLeft color={colors.ink} size={22} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t("privacy.title")}</Text>
            <Text style={styles.subtitle}>{t("privacy.subtitle")}</Text>
          </View>
        </View>

        {!token ? (
          <Surface tone="green">
            <Text style={styles.cardTitle}>{t("privacy.signedOutTitle")}</Text>
            <Text style={styles.copy}>{t("privacy.signedOutCopy")}</Text>
            <Button label={t("common.login")} onPress={() => router.replace("/auth")} />
          </Surface>
        ) : (
          <>
            <Surface tone="green">
              <View style={styles.cardTitleRow}>
                <ShieldCheck color={colors.green} size={20} />
                <Text style={styles.cardTitle}>{t("privacy.dataSummary")}</Text>
              </View>
              <Text style={styles.copy}>{t("privacy.dataSummaryCopy")}</Text>
              {exportedData ? (
                <View style={styles.metaGrid}>
                  <MetaChip label={t("privacy.habits")} value={String(exportedData.habits.length)} />
                  <MetaChip label={t("privacy.logs")} value={String(exportedData.habitLogs.length)} />
                  <MetaChip label={t("privacy.reviews")} value={String(exportedData.weeklyReviews.length)} />
                  <MetaChip label={t("privacy.badges")} value={String(exportedData.badgeUnlocks.length)} />
                </View>
              ) : null}
              {message ? <Text style={styles.feedback}>{message}</Text> : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                label={t("privacy.exportAction")}
                loadingLabel={t("privacy.exporting")}
                icon={<Download color={colors.surface} size={18} />}
                isLoading={exportPrivacyData.isPending}
                onPress={exportData}
              />
            </Surface>

            {exportedData ? (
              <Surface>
                <Text style={styles.cardTitle}>{t("privacy.exportPreview")}</Text>
                <View style={styles.exportBox}>
                  <ScrollView nestedScrollEnabled>
                    <Text selectable style={styles.mono}>
                      {exportPreview}
                    </Text>
                  </ScrollView>
                </View>
              </Surface>
            ) : null}

            <Surface tone="coral">
              <View style={styles.cardTitleRow}>
                <Trash2 color={colors.coral} size={20} />
                <Text style={styles.cardTitle}>{t("privacy.deleteTitle")}</Text>
              </View>
              <Text style={styles.copy}>{t("privacy.deleteCopy")}</Text>
              <Button
                label={t("privacy.deleteAction")}
                loadingLabel={t("privacy.deleting")}
                variant="secondary"
                disabled={deleteAccount.isPending}
                isLoading={deleteAccount.isPending}
                onPress={confirmDeleteAccount}
              />
            </Surface>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}
