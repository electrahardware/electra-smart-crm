export function formatDate(
  value?: string | Date | null
): string {

  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;

}

export function formatDateTime(
  value?: string | Date | null
): string {

  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "-";

  const formattedDate = formatDate(date);

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${formattedDate} ${hours}:${minutes}`;

}