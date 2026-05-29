import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Button, Surface } from "./primitives";
import { colors, spacing } from "../theme/theme";

type ErrorStateProps = {
  title: string;
  copy: string;
  actionLabel: string;
  onRetry: () => void;
  embedded?: boolean;
};

export function ErrorState({ title, copy, actionLabel, onRetry, embedded }: ErrorStateProps) {
  const content = (
    <>
      <View style={styles.titleRow}>
        <View style={styles.iconBubble}>
          <AlertTriangle color={colors.coral} size={18} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.copy}>{copy}</Text>
      <Button
        label={actionLabel}
        variant="secondary"
        icon={<RefreshCw color={colors.green} size={18} />}
        onPress={onRetry}
      />
    </>
  );

  if (embedded) {
    return <View style={styles.embedded}>{content}</View>;
  }

  return <Surface tone="coral">{content}</Surface>;
}

const styles = StyleSheet.create({
  embedded: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ecc6ba",
    backgroundColor: colors.coralSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  title: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
