export function getDateInputToday(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isDateInputInPast(value: string, now = new Date()) {
  const dateValue = value.slice(0, 10);
  return isValidDateInput(dateValue) && dateValue < getDateInputToday(now);
}

export const PAST_RENEWAL_DATE_MESSAGE =
  "That date has already rolled by. Pick today or a future renewal date.";
