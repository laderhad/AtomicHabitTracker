import { ReactNode } from "react";
import { Button } from "../../../components/primitives";

type PrimaryButtonProps = {
  label: string;
  loadingLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
};

export function PrimaryButton({ label, loadingLabel, icon, disabled, isLoading, onPress }: PrimaryButtonProps) {
  return (
    <Button
      label={label}
      loadingLabel={loadingLabel}
      icon={icon}
      disabled={disabled}
      isLoading={isLoading}
      onPress={onPress}
    />
  );
}
