const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DISPLAY_NAME_LENGTH = 50;

export function normalizeDisplayName(displayName: string) {
  return displayName.trim();
}

export function isValidDisplayName(displayName: string) {
  const normalized = normalizeDisplayName(displayName);
  return (
    normalized.length >= 1 && normalized.length <= MAX_DISPLAY_NAME_LENGTH
  );
}

export function getDisplayNameValidationMessage(displayName: string) {
  const normalized = normalizeDisplayName(displayName);

  if (normalized.length === 0) {
    return "Username is required.";
  }

  if (normalized.length > MAX_DISPLAY_NAME_LENGTH) {
    return "Username must be 50 characters or fewer.";
  }

  return null;
}

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}
