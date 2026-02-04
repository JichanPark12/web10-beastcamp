export function formatToKstString(date: Date): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;

  const kstOffset = 9 * 60; // +9 hours
  const kstDate = new Date(utc + kstOffset * 60 * 1000);

  const iso = kstDate.toISOString().replace('Z', '');

  return `${iso}+09:00`;
}
