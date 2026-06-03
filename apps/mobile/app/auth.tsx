import { router } from "expo-router";
import { type TFunction } from "i18next";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Field, Surface } from "../src/components/primitives";
import { ApiError } from "../src/services/apiClient";
import { useAuthMutation } from "../src/services/queries";
import { useThemeStore } from "../src/store/theme";
import { colors, spacing } from "../src/theme/theme";

export default function AuthScreen() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const palette = useThemeStore((state) => state.palette);
  const authMutation = useAuthMutation(mode);
  const isRegister = mode === "register";
  const trimmedEmail = email.trim();
  const isFormReady = isRegister
    ? Boolean(trimmedEmail && password && displayName.trim() && isPasswordPolicyReady(password))
    : Boolean(trimmedEmail && password);

  function clearError() {
    setFormError(null);
    authMutation.reset();
  }

  async function submit() {
    clearError();

    const validationError = validateAuthForm(trimmedEmail, password, displayName, isRegister, t);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      await authMutation.mutateAsync({
        email: trimmedEmail,
        password,
        displayName,
        preferredLanguage: i18n.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul",
      });
      router.replace("/");
    } catch (error) {
      setFormError(formatAuthError(error, t));
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.paper }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.ink }]}>
            {isRegister ? t("auth.titleRegister") : t("auth.titleLogin")}
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {isRegister ? t("auth.subtitleRegister") : t("auth.subtitleLogin")}
          </Text>
        </View>

        <Surface>
          {isRegister ? (
            <Field
              value={displayName}
              onChangeText={(value) => {
              setDisplayName(value);
              clearError();
            }}
              placeholder={t("auth.placeholders.displayName")}
              textContentType="name"
            />
          ) : null}
          <Field
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearError();
            }}
            placeholder={t("auth.placeholders.email")}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <View style={styles.passwordField}>
            <Field
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearError();
              }}
              placeholder={t("auth.placeholders.password")}
              secureTextEntry={!isPasswordVisible}
              textContentType="password"
              style={styles.passwordInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? t("auth.hidePassword") : t("auth.showPassword")}
              onPress={() => setPasswordVisible((isVisible) => !isVisible)}
              style={styles.passwordToggle}
            >
              {isPasswordVisible ? (
                <EyeOff color={palette.muted} size={20} />
              ) : (
                <Eye color={palette.muted} size={20} />
              )}
            </Pressable>
          </View>
          {isRegister ? <Text style={[styles.hint, { color: palette.muted }]}>{t("auth.passwordHint")}</Text> : null}
          {formError ? <Text style={[styles.error, { color: palette.coral }]}>{formError}</Text> : null}
          <Button
            label={isRegister ? t("auth.submitRegister") : t("auth.submitLogin")}
            icon={isRegister ? <UserPlus color={colors.surface} size={18} /> : <LogIn color={colors.surface} size={18} />}
            isLoading={authMutation.isPending}
            disabled={!isFormReady}
            onPress={submit}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRegister ? t("auth.switchToLogin") : t("auth.switchToRegister")}
            onPress={() => {
              clearError();
              setPasswordVisible(false);
              setMode(isRegister ? "login" : "register");
            }}
            style={styles.switcher}
          >
            <Text style={[styles.switchText, { color: palette.green }]}>
              {isRegister ? t("auth.switchToLogin") : t("auth.switchToRegister")}
            </Text>
          </Pressable>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function validateAuthForm(
  email: string,
  password: string,
  displayName: string,
  isRegister: boolean,
  t: TFunction,
) {
  if (!email || !password) {
    return t("auth.errors.required");
  }

  if (!email.includes("@")) {
    return t("auth.errors.invalidEmail");
  }

  if (isRegister && !displayName.trim()) {
    return t("auth.errors.displayNameRequired");
  }

  if (isRegister && !isPasswordPolicyReady(password)) {
    return t("auth.errors.passwordPolicy");
  }

  return null;
}

function isPasswordPolicyReady(password: string) {
  return password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

function formatAuthError(error: unknown, t: TFunction) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return t("auth.errors.invalidLogin");
    }

    const codes = getValidationCodes(error.details);

    if (codes.some((code) => code === "DuplicateEmail" || code === "DuplicateUserName")) {
      return t("auth.errors.duplicateEmail");
    }

    if (codes.some((code) => code.startsWith("Password"))) {
      return t("auth.errors.passwordPolicy");
    }

    if (codes.includes("InvalidEmail")) {
      return t("auth.errors.invalidEmail");
    }
  }

  return t("auth.errors.generic");
}

function getValidationCodes(details: unknown) {
  if (!details || typeof details !== "object" || !("errors" in details)) {
    return [];
  }

  const errors = (details as { errors?: Record<string, string[]> }).errors;
  return errors ? Object.keys(errors) : [];
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  error: {
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  passwordField: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 52,
  },
  passwordToggle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  switcher: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: {
    fontWeight: "800",
  },
});
