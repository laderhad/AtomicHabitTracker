import { useTranslation } from "react-i18next";
import { BehaviorType, OptionalBehaviorType, behaviorTypeOptions } from "../types";
import { Chip, SegmentedLabel } from "./SegmentedControls";

export function BehaviorTypeSelector({
  value,
  onChange,
}: {
  value: OptionalBehaviorType;
  onChange: (behaviorType: BehaviorType) => void;
}) {
  const { t } = useTranslation();

  return (
    <SegmentedLabel label={t("habitForm.behaviorType")}>
      {behaviorTypeOptions.map((behaviorType) => (
        <Chip
          key={behaviorType}
          label={t(`habitForm.${behaviorType}`)}
          selected={value === behaviorType}
          onPress={() => onChange(behaviorType)}
        />
      ))}
    </SegmentedLabel>
  );
}
