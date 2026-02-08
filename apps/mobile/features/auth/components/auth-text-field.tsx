import type { TextInputProps } from "react-native";

import { TextField } from "@/design/primitives/text-field";

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function AuthTextField({ label, error, ...props }: AuthTextFieldProps) {
  const required = label.toLowerCase().includes("username");

  return <TextField label={label} required={required} error={error} {...props} />;
}
