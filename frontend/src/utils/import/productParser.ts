/**
 * Converts a product cell into a unique string array.
 *
 * Supported separators:
 * ,
 * /
 * ;
 * |
 * newline
 */

export function parseProducts(value: string): string[] {
  if (!value.trim()) {
    return [];
  }

  const unique = new Set<string>();

  const parts = value
    .split(/[\/,;|\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  for (const part of parts) {
    const key = part.toLowerCase();

    if (!unique.has(key)) {
      unique.add(key);
    }
  }

  return [...unique].map((key) =>
    parts.find(
      (item) => item.toLowerCase() === key
    )!
  );
}