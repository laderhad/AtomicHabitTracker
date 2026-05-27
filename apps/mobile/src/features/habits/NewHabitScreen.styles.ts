import { StyleSheet } from "react-native";
import { colors, layout, radius, spacing } from "../../theme/theme";

export const newHabitStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  scrollContainer: {
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  headerText: {
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
  templateSurface: {
    gap: spacing.lg,
  },
  detailsSurface: {
    gap: spacing.lg,
  },
  reminderSurface: {
    gap: spacing.lg,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  sectionTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  templateButton: {
    width: "48%",
    minHeight: 92,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fbfcf8",
    padding: spacing.md,
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  templateSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  templateIcon: {
    fontSize: 22,
  },
  templateCopy: {
    gap: spacing.xs,
  },
  templateTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  templateTitleSelected: {
    color: colors.green,
  },
  templateMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  formField: {
    gap: spacing.sm,
  },
  textArea: {
    minHeight: 84,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: colors.coral,
    backgroundColor: colors.coralSoft,
  },
  segmentBlock: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  chipText: {
    color: colors.muted,
    fontWeight: "800",
  },
  chipTextSelected: {
    color: colors.green,
  },
  error: {
    color: colors.coral,
    fontWeight: "700",
  },
  fieldError: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: "700",
  },
  switchRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  switchCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  footer: {
    width: "100%",
    maxWidth: layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
