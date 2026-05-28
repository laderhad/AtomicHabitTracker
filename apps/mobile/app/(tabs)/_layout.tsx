import { Tabs } from "expo-router";
import { ChartNoAxesColumnIncreasing, ListChecks, Settings2, UsersRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, layout, spacing } from "../../src/theme/theme";

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.md);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: layout.tabBarBaseHeight + bottomPadding,
          paddingTop: spacing.sm,
          paddingBottom: bottomPadding,
        },
        tabBarItemStyle: {
          minHeight: 56,
          paddingVertical: spacing.xs,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.today"),
          tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t("tabs.progress"),
          tabBarIcon: ({ color, size }) => <ChartNoAxesColumnIncreasing color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: t("tabs.social"),
          tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
