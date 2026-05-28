import { StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../../theme/theme";

export const weeklyReviewStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  range: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  scoreChip: {
    minHeight: 44,
    minWidth: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  scoreChipSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  scoreText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "900",
  },
  scoreTextSelected: {
    color: colors.green,
  },
  textArea: {
    minHeight: 86,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  moodChip: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  moodChipSelected: {
    borderColor: colors.coral,
    backgroundColor: colors.coralSoft,
  },
  moodText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  moodTextSelected: {
    color: colors.coral,
  },
  message: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "800",
  },
  error: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
  },
});
