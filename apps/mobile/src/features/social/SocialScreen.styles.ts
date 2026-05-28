import { StyleSheet } from "react-native";
import { colors, layout, radius, spacing } from "../../theme/theme";

export const socialStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  container: {
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: layout.bottomContentPadding,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
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
  textArea: {
    minHeight: 82,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segment: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  segmentSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  segmentTextSelected: {
    color: colors.green,
  },
  challengeCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  challengeMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  inviteCode: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
  },
  linkBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.greenLine,
    backgroundColor: colors.greenSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  linkText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "800",
  },
  feedback: {
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
