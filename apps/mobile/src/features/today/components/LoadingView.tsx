import { ActivityIndicator, View } from "react-native";
import { colors } from "../../../theme/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

export function LoadingView({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.loading, compact && styles.compactLoading]}>
      <ActivityIndicator color={colors.green} />
    </View>
  );
}
