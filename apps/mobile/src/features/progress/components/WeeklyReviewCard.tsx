import { ClipboardCheck, RefreshCw } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Button, Field, Surface } from "../../../components/primitives";
import { ApiError } from "../../../services/apiClient";
import { useCurrentWeeklyReview, useUpsertWeeklyReview } from "../../../services/queries";
import { UpsertWeeklyReviewInput, WeeklyReview } from "../../../services/types";
import { colors } from "../../../theme/theme";
import { weeklyReviewStyles as styles } from "./WeeklyReviewCard.styles";

const scoreOptions = [25, 50, 75, 100];

type WeeklyReviewDraft = UpsertWeeklyReviewInput;

const emptyDraft: WeeklyReviewDraft = {
  consistencyScore: null,
  whatWorked: "",
  whatWasHard: "",
  adjustment: "",
  mood: "",
};

export function WeeklyReviewCard() {
  const { t, i18n } = useTranslation();
  const reviewQuery = useCurrentWeeklyReview();
  const upsertReview = useUpsertWeeklyReview();
  const [draft, setDraft] = useState<WeeklyReviewDraft>(emptyDraft);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const moodOptions = useMemo(
    () => [
      t("review.moods.steady"),
      t("review.moods.focused"),
      t("review.moods.stretched"),
    ],
    [t],
  );

  useEffect(() => {
    if (!reviewQuery.data) {
      return;
    }

    setDraft(toDraft(reviewQuery.data.review));
    setFeedback(null);
    setError(null);
  }, [reviewQuery.data?.review?.updatedAt, reviewQuery.data?.weekStartOn]);

  const hasContent =
    draft.consistencyScore !== null ||
    Boolean(draft.whatWorked.trim()) ||
    Boolean(draft.whatWasHard.trim()) ||
    Boolean(draft.adjustment.trim()) ||
    Boolean(draft.mood.trim());
  const canSave = Boolean(reviewQuery.data?.weekStartOn) && hasContent && !upsertReview.isPending;

  function patchDraft(update: Partial<WeeklyReviewDraft>) {
    setDraft((current) => ({ ...current, ...update }));
    setFeedback(null);
    setError(null);
  }

  async function submit() {
    if (!reviewQuery.data?.weekStartOn || !canSave) {
      return;
    }

    try {
      await upsertReview.mutateAsync({
        weekStartOn: reviewQuery.data.weekStartOn,
        input: normalizeDraft(draft),
      });
      setFeedback(t("review.saved"));
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : t("review.error"));
    }
  }

  if (reviewQuery.isLoading) {
    return (
      <Surface tone="green">
        <ActivityIndicator color={colors.green} />
      </Surface>
    );
  }

  if (reviewQuery.error) {
    return (
      <Surface tone="green">
        <View style={styles.titleRow}>
          <ClipboardCheck color={colors.green} size={20} />
          <Text style={styles.title}>{t("review.title")}</Text>
        </View>
        <Text style={styles.copy}>{t("review.error")}</Text>
        <Button
          label={t("common.retry")}
          variant="secondary"
          icon={<RefreshCw color={colors.green} size={18} />}
          onPress={() => reviewQuery.refetch()}
        />
      </Surface>
    );
  }

  const weekRange = reviewQuery.data
    ? formatWeekRange(reviewQuery.data.weekStartOn, reviewQuery.data.weekEndOn, i18n.language)
    : "";
  const hasSavedReview = Boolean(reviewQuery.data?.review);

  return (
    <Surface tone="green">
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <ClipboardCheck color={colors.green} size={20} />
            <Text style={styles.title}>{t("review.title")}</Text>
          </View>
          <Text style={styles.copy}>{t("review.subtitle")}</Text>
        </View>
        {weekRange ? <Text style={styles.range}>{weekRange}</Text> : null}
      </View>

      <Text style={styles.copy}>{hasSavedReview ? t("review.savedState") : t("review.prompt")}</Text>

      <Text style={styles.label}>{t("review.scoreLabel")}</Text>
      <View style={styles.scoreRow}>
        {scoreOptions.map((score) => {
          const isSelected = draft.consistencyScore === score;

          return (
            <Pressable
              key={score}
              accessibilityRole="button"
              accessibilityLabel={`${t("review.scoreLabel")} ${score}`}
              onPress={() => patchDraft({ consistencyScore: score })}
              style={[styles.scoreChip, isSelected && styles.scoreChipSelected]}
            >
              <Text style={[styles.scoreText, isSelected && styles.scoreTextSelected]}>%{score}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>{t("review.whatWorked")}</Text>
      <Field
        value={draft.whatWorked}
        onChangeText={(value) => patchDraft({ whatWorked: value })}
        placeholder={t("review.placeholders.whatWorked")}
        multiline
        autoCapitalize="sentences"
        style={styles.textArea}
      />

      <Text style={styles.label}>{t("review.whatWasHard")}</Text>
      <Field
        value={draft.whatWasHard}
        onChangeText={(value) => patchDraft({ whatWasHard: value })}
        placeholder={t("review.placeholders.whatWasHard")}
        multiline
        autoCapitalize="sentences"
        style={styles.textArea}
      />

      <Text style={styles.label}>{t("review.adjustment")}</Text>
      <Field
        value={draft.adjustment}
        onChangeText={(value) => patchDraft({ adjustment: value })}
        placeholder={t("review.placeholders.adjustment")}
        multiline
        autoCapitalize="sentences"
        style={styles.textArea}
      />

      <Text style={styles.label}>{t("review.moodLabel")}</Text>
      <View style={styles.moodRow}>
        {moodOptions.map((mood) => {
          const isSelected = draft.mood === mood;

          return (
            <Pressable
              key={mood}
              accessibilityRole="button"
              accessibilityLabel={mood}
              onPress={() => patchDraft({ mood })}
              style={[styles.moodChip, isSelected && styles.moodChipSelected]}
            >
              <Text style={[styles.moodText, isSelected && styles.moodTextSelected]}>{mood}</Text>
            </Pressable>
          );
        })}
      </View>

      {feedback ? <Text style={styles.message}>{feedback}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={t("review.save")}
        loadingLabel={t("review.saving")}
        disabled={!canSave}
        isLoading={upsertReview.isPending}
        onPress={submit}
      />
    </Surface>
  );
}

function toDraft(review: WeeklyReview | null): WeeklyReviewDraft {
  if (!review) {
    return emptyDraft;
  }

  return {
    consistencyScore: review.consistencyScore,
    whatWorked: review.whatWorked,
    whatWasHard: review.whatWasHard,
    adjustment: review.adjustment,
    mood: review.mood,
  };
}

function normalizeDraft(draft: WeeklyReviewDraft): WeeklyReviewDraft {
  return {
    consistencyScore: draft.consistencyScore,
    whatWorked: draft.whatWorked.trim(),
    whatWasHard: draft.whatWasHard.trim(),
    adjustment: draft.adjustment.trim(),
    mood: draft.mood.trim(),
  };
}

function formatWeekRange(weekStartOn: string, weekEndOn: string, culture: string) {
  const formatter = new Intl.DateTimeFormat(culture, {
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(toLocalDate(weekStartOn))} - ${formatter.format(toLocalDate(weekEndOn))}`;
}

function toLocalDate(value: string) {
  return new Date(`${value}T12:00:00`);
}
