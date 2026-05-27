import { Bell } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Switch, Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { colors } from "../../../theme/theme";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";
import { ReminderFormState } from "../types";
import { Chip } from "./SegmentedControls";
import { FormField } from "./FormField";

type ReminderSectionProps = {
  reminder: ReminderFormState;
  error?: string;
  onChange: (update: Partial<ReminderFormState>) => void;
};

const allDays = [1, 2, 3, 4, 5, 6, 7];

export function ReminderSection({ reminder, error, onChange }: ReminderSectionProps) {
  const { t } = useTranslation();

  function toggleEnabled(enabled: boolean) {
    onChange({
      enabled,
      triggerTime: enabled && !reminder.triggerTime ? "09:00" : reminder.triggerTime,
      daysOfWeek: reminder.daysOfWeek.length ? reminder.daysOfWeek : allDays,
    });
  }

  function toggleDay(day: number) {
    const hasDay = reminder.daysOfWeek.includes(day);
    const nextDays = hasDay
      ? reminder.daysOfWeek.filter((item) => item !== day)
      : [...reminder.daysOfWeek, day].sort();

    onChange({ daysOfWeek: nextDays.length ? nextDays : allDays });
  }

  return (
    <Surface style={styles.reminderSurface}>
      <View style={styles.sectionHeading}>
        <Bell color={colors.green} size={20} />
        <View style={styles.sectionTitleBlock}>
          <Text style={styles.cardTitle}>{t("habitForm.reminderTitle")}</Text>
          <Text style={styles.helperText}>{t("habitForm.reminderDescription")}</Text>
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchCopy}>
          <Text style={styles.inputLabel}>{t("habitForm.reminderEnabled")}</Text>
          <Text style={styles.helperText}>{t("habitForm.reminderEveryDay")}</Text>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={toggleEnabled}
          trackColor={{ false: colors.line, true: colors.greenSoft }}
          thumbColor={reminder.enabled ? colors.green : colors.surface}
        />
      </View>

      {reminder.enabled ? (
        <>
          <FormField
            label={t("habitForm.reminderTime")}
            value={reminder.triggerTime}
            onChangeText={(value) => onChange({ triggerTime: value })}
            placeholder={t("habitForm.placeholders.reminderTime")}
            error={error}
          />

          <View style={styles.segmentBlock}>
            <Text style={styles.inputLabel}>{t("habitForm.reminderDays")}</Text>
            <View style={styles.segmentRow}>
              {allDays.map((day) => (
                <Chip
                  key={day}
                  label={t(`habitForm.dayShort.${day}`)}
                  selected={reminder.daysOfWeek.includes(day)}
                  onPress={() => toggleDay(day)}
                />
              ))}
            </View>
          </View>
        </>
      ) : null}
    </Surface>
  );
}
