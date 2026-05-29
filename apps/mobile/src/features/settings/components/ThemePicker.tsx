import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { colors, radius, spacing } from "../../../theme/theme";
import { useThemeStore } from "../../../store/theme";
import { ThemeId, ThemeOption, themeOptions } from "../themeOptions";

type ThemePickerProps = {
  selectedTheme: ThemeId;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (theme: ThemeOption) => void;
};

export function ThemePicker({ selectedTheme, isOpen, onToggle, onSelect }: ThemePickerProps) {
  const { t } = useTranslation();
  const palette = useThemeStore((state) => state.palette);

  return (
    <Surface>
      <Pressable accessibilityRole="button" accessibilityLabel={t("settings.theme")} onPress={onToggle} style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.sectionTitle, { color: palette.ink }]}>{t("settings.theme")}</Text>
          <Text style={[styles.copy, { color: palette.muted }]}>
            {t("settings.activeTheme")}: {t(`settings.themeOptions.${selectedTheme}.title`)}
          </Text>
        </View>
        {isOpen ? (
          <ChevronUp color={palette.muted} size={20} />
        ) : (
          <ChevronDown color={palette.muted} size={20} />
        )}
      </Pressable>
      {isOpen ? (
        <>
          <Text style={[styles.copy, { color: palette.muted }]}>{t("settings.themeCopy")}</Text>
          <View style={styles.grid}>
            {themeOptions.map((theme) => {
              const isSelected = theme.id === selectedTheme;

              return (
                <Pressable
                  key={theme.id}
                  accessibilityRole="button"
                  accessibilityLabel={t(`settings.themeOptions.${theme.id}.title`)}
                  onPress={() => onSelect(theme)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: palette.faint,
                      borderColor: palette.line,
                    },
                    isSelected && {
                      backgroundColor: palette.greenSoft,
                      borderColor: palette.green,
                    },
                  ]}
                >
                  <View style={styles.optionHeader}>
                    <View style={styles.swatches}>
                      {theme.swatches.map((swatch) => (
                        <View key={swatch} style={[styles.swatch, { backgroundColor: swatch }]} />
                      ))}
                    </View>
                    {isSelected ? (
                      <View style={[styles.checkBubble, { backgroundColor: palette.green }]}>
                        <Check color={palette.surface} size={14} />
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.optionTitle, { color: palette.ink }]}>
                    {t(`settings.themeOptions.${theme.id}.title`)}
                  </Text>
                  <Text style={[styles.optionCopy, { color: palette.muted }]}>
                    {t(`settings.themeOptions.${theme.id}.copy`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.collapsedPreview}>
          {themeOptions
            .find((theme) => theme.id === selectedTheme)
            ?.swatches.map((swatch) => (
              <View key={swatch} style={[styles.swatch, { backgroundColor: swatch }]} />
            ))}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  collapsedPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.xs,
  },
  option: {
    minWidth: 150,
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  swatches: {
    flexDirection: "row",
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surface,
    marginRight: -spacing.xs,
  },
  checkBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  optionCopy: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
});
