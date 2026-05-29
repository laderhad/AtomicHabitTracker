import { AlertCircle, CheckCircle2 } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../../../theme/theme";
import { todayStyles as styles } from "../TodayScreen.styles";

type CheckInFeedbackBannerProps = {
  toastKey: number;
  tone: "success" | "error";
  message: string;
  onDismiss: () => void;
};

export function CheckInFeedbackBanner({ toastKey, tone, message, onDismiss }: CheckInFeedbackBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-88)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isSuccess = tone === "success";

  useEffect(() => {
    translateY.setValue(-88);
    opacity.setValue(0);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2200),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -88,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onDismiss();
      }
    });

    return () => animation.stop();
  }, [onDismiss, opacity, toastKey, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.feedbackToastLayer,
        {
          top: insets.top + spacing.md,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Animated.View style={[styles.feedbackToast, isSuccess ? styles.feedbackSuccess : styles.feedbackError]}>
        {isSuccess ? (
          <CheckCircle2 color={colors.green} size={18} />
        ) : (
          <AlertCircle color={colors.coral} size={18} />
        )}
        <Text style={[styles.feedbackText, isSuccess ? styles.feedbackSuccessText : styles.feedbackErrorText]}>
          {message}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
