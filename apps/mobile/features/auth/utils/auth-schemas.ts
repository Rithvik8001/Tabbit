import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Username is required.")
      .max(50, "Username must be 50 characters or fewer."),
    email: z.email("Enter a valid email address.").trim(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function parseFormErrors(
  result: { success: true } | { success: false; error: z.ZodError },
): Record<string, string> {
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
