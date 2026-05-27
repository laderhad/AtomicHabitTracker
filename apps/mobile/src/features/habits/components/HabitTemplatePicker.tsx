import { Sparkles } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { Surface } from "../../../components/primitives";
import { colors } from "../../../theme/theme";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";
import { HabitTemplate } from "../types";

type HabitTemplatePickerProps = {
  title: string;
  description: string;
  templates: HabitTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: HabitTemplate) => void;
};

export function HabitTemplatePicker({
  title,
  description,
  templates,
  selectedTemplateId,
  onSelect,
}: HabitTemplatePickerProps) {
  return (
    <Surface style={styles.templateSurface}>
      <View style={styles.sectionHeading}>
        <Sparkles color={colors.green} size={20} />
        <View style={styles.sectionTitleBlock}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.helperText}>{description}</Text>
        </View>
      </View>
      <View style={styles.templateGrid}>
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;

          return (
            <Pressable
              key={template.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(template)}
              style={[styles.templateButton, isSelected && styles.templateSelected]}
            >
              <Text style={styles.templateIcon}>{template.icon}</Text>
              <View style={styles.templateCopy}>
                <Text style={[styles.templateTitle, isSelected && styles.templateTitleSelected]}>
                  {template.title}
                </Text>
                <Text style={styles.templateMeta}>{template.form.category}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Surface>
  );
}
