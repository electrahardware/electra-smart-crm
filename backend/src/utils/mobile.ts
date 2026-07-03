/**
 * Normalizes a value into a valid 10-digit Indian mobile number.
 *
 * Removes country code prefixes (+91 / 91), spaces, brackets,
 * dashes and all non-digit characters.
 *
 * Returns a valid 10-digit Indian mobile number
 * starting with 6, 7, 8 or 9.
 *
 * Returns null if invalid.
 */
export function normalizeIndianMobile(
  value: string
): string | null {
  if (!value) return null;

  let digits = value.trim().replace(/\D/g, "");

  // Remove India country code
  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  // Keep only last 10 digits if extra digits remain
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return null;
  }

  return digits;
}

/**
 * Splits one or more mobile numbers into
 * primary and secondary mobile numbers.
 *
 * Supported separators:
 * /
 * ,
 * ;
 * |
 * newline
 * spaces
 *
 * Duplicate and invalid numbers are ignored.
 * Maximum two numbers are returned.
 */
export function splitMobileNumbers(value: string): {
  primaryMobile: string | null;
  secondaryMobile: string | null;
} {
  if (!value.trim()) {
    return {
      primaryMobile: null,
      secondaryMobile: null,
    };
  }

  const uniqueNumbers = new Set<string>();

  const parts = value
    .split(/[\/,;|\s\n\r]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const mobile = normalizeIndianMobile(part);

    if (mobile) {
      uniqueNumbers.add(mobile);
    }

    if (uniqueNumbers.size === 2) {
      break;
    }
  }

  const mobiles = [...uniqueNumbers];

  return {
    primaryMobile: mobiles[0] ?? null,
    secondaryMobile: mobiles[1] ?? null,
  };
}