/**
 * Normalize an Indian mobile number.
 *
 * Examples:
 * +91 9876543210
 * 91-9876543210
 * (98765)43210
 * 98765 43210
 *
 * Returns a valid 10 digit mobile number or null.
 */
export function normalizeIndianMobile(
  value: string
): string | null {
  if (!value) return null;

  let digits = value.trim().replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return null;
  }

  return digits;
}

/**
 * Split multiple mobile numbers.
 *
 * Supported separators:
 * /
 * ,
 * ;
 * |
 * newline
 * spaces
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

  const unique = new Set<string>();

  const parts = value
    .split(/[\/,;|\s\r\n]+/)
    .map((x) => x.trim())
    .filter(Boolean);

  for (const part of parts) {
    const mobile = normalizeIndianMobile(part);

    if (mobile) {
      unique.add(mobile);
    }

    if (unique.size === 2) {
      break;
    }
  }

  const mobiles = [...unique];

  return {
    primaryMobile: mobiles[0] ?? null,
    secondaryMobile: mobiles[1] ?? null,
  };
}