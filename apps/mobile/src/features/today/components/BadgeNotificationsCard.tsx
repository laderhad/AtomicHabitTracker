import { Award, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { BadgeNotification } from "../../../services/types";
import { colors } from "../../../theme/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

type BadgeNotificationsCardProps = {
  notifications: BadgeNotification[];
  onDismiss: (unlockIds: string[]) => void;
};

export function BadgeNotificationsCard({ notifications, onDismiss }: BadgeNotificationsCardProps) {
  const { t } = useTranslation();

  if (!notifications.length) {
    return null;
  }

  return (
    <Surface tone="coral">
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Award color={colors.coral} size={20} />
          <Text style={styles.cardTitle}>{t("today.notifications")}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("today.dismissNotifications")}
          onPress={() => onDismiss(notifications.map((item) => item.unlockId))}
          style={styles.iconButton}
        >
          <Check color={colors.coral} size={18} />
        </Pressable>
      </View>
      {notifications.map((item) => (
        <View key={item.unlockId} style={styles.notification}>
          <Text style={styles.badgeTitle}>{item.title}</Text>
          <Text style={styles.copy}>{item.description}</Text>
        </View>
      ))}
    </Surface>
  );
}
