import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { syncLocalHabitReminders } from "../../services/reminderSync";
import { useAuthStore } from "../../store/auth";

export function ReminderSyncBootstrap() {
  const { t, i18n } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const lastSyncKey = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "web" || !isHydrated || !accessToken) {
      lastSyncKey.current = null;
      return;
    }

    const syncKey = `${accessToken}:${i18n.language}`;
    if (lastSyncKey.current === syncKey) {
      return;
    }

    lastSyncKey.current = syncKey;

    void syncLocalHabitReminders(t("habitForm.reminderNotificationBody")).catch(() => {
      lastSyncKey.current = null;
    });
  }, [accessToken, i18n.language, isHydrated, t]);

  return null;
}
