export function convertDateToCron(date: Date): string {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-indexed in JS
  const dayOfWeek = date.getDay();

  // Return the cron format string
  return `${minutes} ${hours} ${dayOfMonth} ${month} *`;
}
