import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";

export function SegmentedLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.segmentBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.segmentRow}>{children}</View>
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}
