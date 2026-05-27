import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from "react-native";
import { colors, radius, shadow, spacing } from "../theme/theme";

type ButtonProps = PressableProps & {
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  loadingLabel?: string;
};

export function Button({
  label,
  icon,
  variant = "primary",
  isLoading,
  loadingLabel,
  disabled,
  style,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        disabled && !isLoading && styles.disabled,
        disabled && !isLoading && variant === "primary" && styles.disabledPrimary,
        disabled && !isLoading && variant !== "primary" && styles.disabledSecondary,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...props}
    >
      {isLoading ? <ActivityIndicator color={variant === "primary" ? colors.surface : colors.green} /> : icon}
      <Text
        style={[
          styles.buttonText,
          variant === "primary" ? styles.primaryText : styles.secondaryText,
          disabled && !isLoading && styles.disabledText,
        ]}
      >
        {isLoading && loadingLabel ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}

export function Surface({
  children,
  tone = "plain",
  style,
}: ViewProps & { children: ReactNode; tone?: "plain" | "green" | "coral" }) {
  return <View style={[styles.surface, styles[`${tone}Surface`], style]}>{children}</View>;
}

export function Field({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[styles.input, style]}
      autoCapitalize="none"
      {...props}
    />
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.green,
  },
  secondary: {
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: colors.greenLine,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.76,
  },
  disabled: {
    opacity: 1,
  },
  disabledPrimary: {
    backgroundColor: colors.faint,
    borderWidth: 1,
    borderColor: colors.line,
  },
  disabledSecondary: {
    backgroundColor: colors.faint,
    borderColor: colors.line,
  },
  disabledText: {
    color: colors.muted,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.green,
  },
  surface: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow,
  },
  plainSurface: {},
  greenSurface: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.greenLine,
  },
  coralSurface: {
    backgroundColor: colors.coralSoft,
    borderColor: "#ecc6ba",
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  metric: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
});

export const primitives = styles;
