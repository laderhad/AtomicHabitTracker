import { ReactNode } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "../../../store/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

type ScreenFrameProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  overlay?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function ScreenFrame({ title, subtitle, children, overlay, refreshing, onRefresh }: ScreenFrameProps) {
  const palette = useThemeStore((state) => state.palette);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.paper }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              tintColor={palette.green}
              colors={[palette.green]}
            />
          ) : undefined
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
      {overlay}
    </SafeAreaView>
  );
}
