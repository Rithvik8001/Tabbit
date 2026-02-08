import { Button } from "@/design/primitives/button";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
  visualStyle?: "default" | "premiumAuth";
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  visualStyle = "default",
}: PrimaryButtonProps) {
  const tone = visualStyle === "premiumAuth" ? "accent" : "neutral";
  const mappedVariant = variant === "secondary" ? "soft" : "solid";

  return (
    <Button
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      variant={mappedVariant}
      tone={tone}
      size="lg"
    />
  );
}
