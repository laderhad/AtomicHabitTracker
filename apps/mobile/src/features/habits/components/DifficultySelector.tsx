import { useTranslation } from "react-i18next";
import { Difficulty, OptionalDifficulty, difficultyOptions } from "../types";
import { Chip, SegmentedLabel } from "./SegmentedControls";

export function DifficultySelector({
  value,
  onChange,
}: {
  value: OptionalDifficulty;
  onChange: (difficulty: Difficulty) => void;
}) {
  const { t } = useTranslation();

  return (
    <SegmentedLabel label={t("habitForm.difficulty")}>
      {difficultyOptions.map((difficulty) => (
        <Chip
          key={difficulty}
          label={t(`habitForm.${difficulty}`)}
          selected={value === difficulty}
          onPress={() => onChange(difficulty)}
        />
      ))}
    </SegmentedLabel>
  );
}
