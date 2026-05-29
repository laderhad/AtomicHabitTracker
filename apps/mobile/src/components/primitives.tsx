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
import { radius, shadow, spacing } from "../theme/theme";
import { useThemeStore } from "../store/theme";

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
  const palette = useThemeStore((state) => state.palette);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && { backgroundColor: palette.green },
        variant === "secondary" && {
          backgroundColor: palette.greenSoft,
          borderWidth: 1,
          borderColor: palette.greenLine,
        },
        variant === "ghost" && styles.ghost,
        pressed && styles.pressed,
        disabled && !isLoading && styles.disabled,
        disabled && !isLoading && variant === "primary" && {
          backgroundColor: palette.faint,
          borderWidth: 1,
          borderColor: palette.line,
        },
        disabled && !isLoading && variant !== "primary" && {
          backgroundColor: palette.faint,
          borderColor: palette.line,
        },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...props}
    >
      {isLoading ? <ActivityIndicator color={variant === "primary" ? palette.surface : palette.green} /> : icon}
      <Text
        style={[
          styles.buttonText,
          { color: variant === "primary" ? palette.surface : palette.green },
          disabled && !isLoading && { color: palette.muted },
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
  const palette = useThemeStore((state) => state.palette);
  const toneStyle =
    tone === "green"
      ? { backgroundColor: palette.greenSoft, borderColor: palette.greenLine }
      : tone === "coral"
        ? { backgroundColor: palette.coralSoft, borderColor: palette.coral }
        : {};

  return (
    <View
      style={[
        styles.surface,
        { backgroundColor: palette.surface, borderColor: palette.line },
        toneStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Field({ style, ...props }: TextInputProps) {
  const palette = useThemeStore((state) => state.palette);

  return (
    <TextInput
      placeholderTextColor={palette.muted}
      style={[
        styles.input,
        {
          borderColor: palette.line,
          backgroundColor: palette.surface,
          color: palette.ink,
        },
        style,
      ]}
      autoCapitalize="none"
      {...props}
    />
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  const palette = useThemeStore((state) => state.palette);

  return (
    <View style={[styles.metric, { borderColor: palette.line, backgroundColor: palette.surface }]}>
      <Text style={[styles.metricValue, { color: palette.ink }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: palette.muted }]}>{label}</Text>
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
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.76,
  },
  disabled: {
    opacity: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  surface: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  metric: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export const primitives = styles;
