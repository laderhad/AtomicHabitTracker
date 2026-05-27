import { Text, View } from "react-native";
import { Field } from "../../../components/primitives";
import { newHabitStyles as styles } from "../NewHabitScreen.styles";

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
};

export function FormField({ label, value, placeholder, error, multiline, onChangeText }: FormFieldProps) {
  return (
    <View style={styles.formField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Field
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={[multiline && styles.textArea, error && styles.inputError]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}
