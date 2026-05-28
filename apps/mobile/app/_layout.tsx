import i18n from "../src/i18n";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppProviders } from "../src/providers/AppProviders";
import { getSavedLanguage, normalizeLanguage } from "../src/services/languagePreference";
import { configureNotificationHandler } from "../src/services/localNotifications";
import { useAuthStore } from "../src/store/auth";
import { colors } from "../src/theme/theme";

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const userLanguage = useAuthStore((state) => state.user?.preferredLanguage);

  useEffect(() => {
    void hydrate();
    configureNotificationHandler();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void applyPreferredLanguage(userLanguage);
  }, [isHydrated, userLanguage]);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" options={{ presentation: "modal" }} />
      </Stack>
    </AppProviders>
  );
}

async function applyPreferredLanguage(userLanguage?: string) {
  const savedLanguage = await getSavedLanguage();
  const nextLanguage = savedLanguage ?? normalizeLanguage(userLanguage);

  if (i18n.language !== nextLanguage) {
    await i18n.changeLanguage(nextLanguage);
  }
}
