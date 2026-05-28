import { StyleSheet } from "react-native";
import { colors, layout, radius, spacing } from "../../theme/theme";

export const privacyStyles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  backButton: {
    width: layout.controlMinHeight,
    height: layout.controlMinHeight,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
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
    lineHeight: 20,
    fontWeight: "600",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metaChip: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.greenLine,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  metaValue: {
    color: colors.green,
    fontSize: 16,
    fontWeight: "900",
  },
  exportBox: {
    maxHeight: 260,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fbfcf8",
    padding: spacing.md,
  },
  mono: {
    color: colors.ink,
    fontFamily: "Menlo",
    fontSize: 11,
    lineHeight: 16,
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
