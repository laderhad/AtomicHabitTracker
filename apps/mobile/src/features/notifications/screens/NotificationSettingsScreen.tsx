import { router } from "expo-router";
import { ArrowLeft, Bell, BellRing, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Surface } from "../../../components/primitives";
import {
  clearAllLocalHabitReminders,
  getLocalNotificationPermissionStatus,
  getLocalReminderSummary,
  LocalNotificationPermissionStatus,
  LocalReminderSummary,
  requestLocalNotificationPermission,
} from "../../../services/localNotifications";
import { colors } from "../../../theme/theme";
import { notificationSettingsStyles as styles } from "../NotificationSettingsScreen.styles";

const emptySummary: LocalReminderSummary = {
  habitCount: 0,
  notificationCount: 0,
};

export function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<LocalNotificationPermissionStatus | null>(null);
  const [summary, setSummary] = useState<LocalReminderSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setIsLoading(true);
    setError(null);

    try {
      const [nextPermission, nextSummary] = await Promise.all([
        getLocalNotificationPermissionStatus(),
        getLocalReminderSummary(),
      ]);

      setPermission(nextPermission);
      setSummary(nextSummary);
    } catch {
      setError(t("notifications.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  async function requestPermission() {
    setMessage(null);
    setError(null);
    setIsRequesting(true);

    try {
      const nextPermission = await requestLocalNotificationPermission();
      setPermission(nextPermission);
      setMessage(nextPermission.granted ? t("notifications.permissionGranted") : t("notifications.permissionDenied"));
    } catch {
      setError(t("notifications.permissionError"));
    } finally {
      setIsRequesting(false);
    }
  }

  function confirmClearReminders() {
    Alert.alert(t("notifications.clearTitle"), t("notifications.clearConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("notifications.clearAction"),
        style: "destructive",
        onPress: () => {
          void clearReminders();
        },
      },
    ]);
  }

  async function clearReminders() {
    setMessage(null);
    setError(null);

    try {
      await clearAllLocalHabitReminders();
      setSummary(emptySummary);
      setMessage(t("notifications.clearDone"));
    } catch {
      setError(t("notifications.clearError"));
    }
  }

  const isSupported = permission?.supported ?? false;
  const isGranted = permission?.granted ?? false;

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
            <Text style={styles.title}>{t("notifications.title")}</Text>
            <Text style={styles.subtitle}>{t("notifications.subtitle")}</Text>
          </View>
        </View>

        <Surface tone="green">
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <BellRing color={colors.green} size={20} />
              <Text style={styles.cardTitle}>{t("notifications.permissionTitle")}</Text>
            </View>
            <View style={[styles.statusPill, isGranted && styles.statusPillGranted]}>
              <Text style={[styles.statusText, isGranted && styles.statusTextGranted]}>
                {isLoading ? t("common.loading") : permissionLabel(permission, t)}
              </Text>
            </View>
          </View>
          <Text style={styles.copy}>
            {isSupported ? t("notifications.permissionCopy") : t("notifications.unsupportedCopy")}
          </Text>
          {message ? <Text style={styles.feedback}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={t("notifications.requestPermission")}
            loadingLabel={t("notifications.requesting")}
            disabled={!isSupported || isRequesting || isGranted}
            isLoading={isRequesting}
            onPress={requestPermission}
          />
        </Surface>

        <Surface>
          <View style={styles.row}>
            <Bell color={colors.coral} size={20} />
            <Text style={styles.cardTitle}>{t("notifications.localReminders")}</Text>
          </View>
          <Text style={styles.copy}>{t("notifications.localRemindersCopy")}</Text>
          <View style={styles.metrics}>
            <Metric label={t("notifications.habitCount")} value={String(summary.habitCount)} />
            <Metric label={t("notifications.notificationCount")} value={String(summary.notificationCount)} />
          </View>
          <Button label={t("common.retry")} variant="secondary" onPress={refresh} />
        </Surface>

        <Surface tone="coral">
          <View style={styles.row}>
            <Trash2 color={colors.coral} size={20} />
            <Text style={styles.cardTitle}>{t("notifications.clearTitle")}</Text>
          </View>
          <Text style={styles.copy}>{t("notifications.clearCopy")}</Text>
          <Button
            label={t("notifications.clearAction")}
            variant="secondary"
            disabled={summary.notificationCount === 0}
            onPress={confirmClearReminders}
          />
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function permissionLabel(permission: LocalNotificationPermissionStatus | null, t: ReturnType<typeof useTranslation>["t"]) {
  if (!permission?.supported) {
    return t("notifications.unsupported");
  }

  return permission.granted ? t("notifications.granted") : t("notifications.notGranted");
}
