import { RefreshCw, UsersRound } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { Button, Surface } from "../../../components/primitives";
import { useChallenges, useJoinChallenge } from "../../../services/queries";
import { Challenge } from "../../../services/types";
import { colors } from "../../../theme/theme";
import { socialStyles as styles } from "../SocialScreen.styles";

export function ChallengeList() {
  const { t, i18n } = useTranslation();
  const challenges = useChallenges();
  const joinChallenge = useJoinChallenge();

  return (
    <Surface>
      <View style={styles.rowBetween}>
        <View style={styles.cardTitleRow}>
          <UsersRound color={colors.blue} size={20} />
          <Text style={styles.cardTitle}>{t("social.challengeListTitle")}</Text>
        </View>
        {challenges.isFetching ? <ActivityIndicator color={colors.green} /> : null}
      </View>

      {challenges.isLoading ? <ActivityIndicator color={colors.green} /> : null}

      {challenges.data?.length ? (
        challenges.data.map((challenge) => (
          <ChallengeRow
            key={challenge.id}
            challenge={challenge}
            culture={i18n.language}
            isJoining={joinChallenge.isPending}
            onJoin={() => joinChallenge.mutate({ challengeId: challenge.id, inviteCode: challenge.inviteCode })}
          />
        ))
      ) : challenges.isFetched ? (
        <Text style={styles.copy}>{t("social.noChallenges")}</Text>
      ) : null}

      {challenges.error ? (
        <Button
          label={t("common.retry")}
          variant="secondary"
          icon={<RefreshCw color={colors.green} size={18} />}
          onPress={() => challenges.refetch()}
        />
      ) : null}
    </Surface>
  );
}

function ChallengeRow({
  challenge,
  culture,
  isJoining,
  onJoin,
}: {
  challenge: Challenge;
  culture: string;
  isJoining: boolean;
  onJoin: () => void;
}) {
  const { t } = useTranslation();
  const isParticipant = Boolean(challenge.currentUserRole);
  const visibilityLabel =
    challenge.visibility === "public" ? t("social.publicLabel") : t("social.inviteOnlyLabel");

  return (
    <View style={styles.challengeCard}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.cardTitle}>{challenge.title}</Text>
          <Text style={styles.challengeMeta}>
            {visibilityLabel} · {t("social.participants", { count: challenge.participantCount })}
          </Text>
        </View>
        <Text style={styles.challengeMeta}>{formatDate(challenge.endAt, culture)}</Text>
      </View>

      {challenge.description ? <Text style={styles.copy}>{challenge.description}</Text> : null}

      {challenge.inviteCode ? (
        <Text style={styles.inviteCode}>{t("social.inviteCode", { code: challenge.inviteCode })}</Text>
      ) : null}

      {isParticipant ? (
        <Text style={styles.feedback}>
          {challenge.currentUserRole === "owner" ? t("social.owner") : t("social.member")}
        </Text>
      ) : challenge.visibility === "public" ? (
        <Button
          label={t("social.join")}
          loadingLabel={t("social.joining")}
          variant="secondary"
          disabled={isJoining}
          isLoading={isJoining}
          onPress={onJoin}
        />
      ) : null}
    </View>
  );
}

function formatDate(value: string, culture: string) {
  return new Intl.DateTimeFormat(culture, {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}
