import { Trophy } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { Button, Field, Surface } from "../../../components/primitives";
import { ApiError } from "../../../services/apiClient";
import { useCreateChallenge } from "../../../services/queries";
import { colors } from "../../../theme/theme";
import { socialStyles as styles } from "../SocialScreen.styles";

type Visibility = "invite_only" | "public";

export function CreateChallengeCard() {
  const { t } = useTranslation();
  const createChallenge = useCreateChallenge();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("invite_only");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canCreate = Boolean(title.trim()) && !createChallenge.isPending;

  function clearMessages() {
    setFeedback(null);
    setError(null);
  }

  async function submit() {
    if (!canCreate) {
      return;
    }

    clearMessages();

    try {
      const now = new Date();
      const endAt = new Date(now);
      endAt.setDate(endAt.getDate() + 7);

      const challenge = await createChallenge.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        startAt: now.toISOString(),
        endAt: endAt.toISOString(),
        visibility,
      });

      setTitle("");
      setDescription("");
      setVisibility("invite_only");
      setFeedback(
        challenge.inviteCode
          ? t("social.challengeCreatedWithCode", { code: challenge.inviteCode })
          : t("social.challengeCreated"),
      );
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : t("social.challengeError"));
    }
  }

  return (
    <Surface tone="green">
      <View style={styles.cardTitleRow}>
        <Trophy color={colors.green} size={20} />
        <Text style={styles.cardTitle}>{t("social.createTitle")}</Text>
      </View>
      <Text style={styles.copy}>{t("social.createCopy")}</Text>

      <Text style={styles.label}>{t("social.challengeName")}</Text>
      <Field
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          clearMessages();
        }}
        placeholder={t("social.challengeNamePlaceholder")}
        autoCapitalize="sentences"
      />

      <Text style={styles.label}>{t("social.challengeDescription")}</Text>
      <Field
        value={description}
        onChangeText={(value) => {
          setDescription(value);
          clearMessages();
        }}
        placeholder={t("social.challengeDescriptionPlaceholder")}
        autoCapitalize="sentences"
        multiline
        style={styles.textArea}
      />

      <Text style={styles.label}>{t("social.visibility")}</Text>
      <View style={styles.segmentedRow}>
        <VisibilityOption
          label={t("social.inviteOnly")}
          isSelected={visibility === "invite_only"}
          onPress={() => {
            setVisibility("invite_only");
            clearMessages();
          }}
        />
        <VisibilityOption
          label={t("social.public")}
          isSelected={visibility === "public"}
          onPress={() => {
            setVisibility("public");
            clearMessages();
          }}
        />
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={t("social.createChallenge")}
        loadingLabel={t("social.creatingChallenge")}
        disabled={!canCreate}
        isLoading={createChallenge.isPending}
        onPress={submit}
      />
    </Surface>
  );
}

function VisibilityOption({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.segment, isSelected && styles.segmentSelected]}
    >
      <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>{label}</Text>
    </Pressable>
  );
}
