import { Share2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share, Text, View } from "react-native";
import { Button, Surface } from "../../../components/primitives";
import { ApiError } from "../../../services/apiClient";
import { useCreateShareCard, useShareCards } from "../../../services/queries";
import { ShareCard } from "../../../services/types";
import { colors } from "../../../theme/theme";
import { socialStyles as styles } from "../SocialScreen.styles";

export function ShareProgressCard() {
  const { t } = useTranslation();
  const shareCards = useShareCards();
  const createShareCard = useCreateShareCard();
  const [latestCard, setLatestCard] = useState<ShareCard | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visibleCard = latestCard ?? shareCards.data?.[0] ?? null;

  async function createCard() {
    setFeedback(null);
    setError(null);

    try {
      const card = await createShareCard.mutateAsync({
        type: "progress",
        targetType: "progress",
        targetId: null,
        title: t("social.progressShareDefaultTitle"),
        subtitle: t("social.progressShareDefaultSubtitle"),
      });

      setLatestCard(card);
      setFeedback(t("social.shareCardReady"));
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : t("social.shareCardError"));
    }
  }

  async function shareCard() {
    if (!visibleCard) {
      return;
    }

    try {
      await Share.share({
        message: `${visibleCard.title}\n${visibleCard.subtitle}\n${visibleCard.deepLink}`,
      });
    } catch {
      setError(t("social.shareActionError"));
    }
  }

  return (
    <Surface tone="coral">
      <View style={styles.cardTitleRow}>
        <Share2 color={colors.coral} size={20} />
        <Text style={styles.cardTitle}>{t("social.progressShareTitle")}</Text>
      </View>
      <Text style={styles.copy}>{t("social.progressShareCopy")}</Text>

      {visibleCard ? (
        <View style={styles.linkBox}>
          <Text style={styles.label}>{visibleCard.title}</Text>
          <Text style={styles.copy}>{visibleCard.subtitle}</Text>
          <Text style={styles.linkText}>{visibleCard.deepLink}</Text>
        </View>
      ) : (
        <Text style={styles.copy}>{t("social.noShareCards")}</Text>
      )}

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={t("social.createShareCard")}
        loadingLabel={t("social.creatingShareCard")}
        disabled={createShareCard.isPending}
        isLoading={createShareCard.isPending}
        onPress={createCard}
      />
      {visibleCard ? <Button label={t("social.shareAction")} variant="secondary" onPress={shareCard} /> : null}
    </Surface>
  );
}
