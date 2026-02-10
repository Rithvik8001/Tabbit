type DateOnlyParts = {
  year: number;
  month: number;
  day: number;
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOnly(value: string): DateOnlyParts | null {
  const trimmed = value.trim();
  const match = DATE_ONLY_PATTERN.exec(trimmed);

  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const normalized = new Date(Date.UTC(year, month - 1, day));

  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() + 1 !== month ||
    normalized.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function isValidDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

export function formatDateOnly(
  value: string,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US",
): string {
  const parsed = parseDateOnly(value);

  if (!parsed) {
    return value;
  }

  const normalized = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day),
  );

  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: "UTC",
  }).format(normalized);
}
