function addMonthsClamped(date: Date, months: number) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const firstOfTargetMonth = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(
    Date.UTC(firstOfTargetMonth.getUTCFullYear(), firstOfTargetMonth.getUTCMonth() + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      firstOfTargetMonth.getUTCFullYear(),
      firstOfTargetMonth.getUTCMonth(),
      Math.min(day, lastDay),
    ),
  );
}

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

export function getNextRenewalDate(
  renewalDate: string,
  billingCycle: string,
  now = new Date(),
) {
  let nextDate = new Date(renewalDate);
  if (Number.isNaN(nextDate.getTime())) return renewalDate;

  nextDate = new Date(
    Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), nextDate.getUTCDate()),
  );
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  while (nextDate.getTime() < today) {
    nextDate = addMonthsClamped(nextDate, billingCycle === "yearly" ? 12 : 1);
  }

  return nextDate.toISOString();
}

export function getDaysUntil(date: string, now = new Date()) {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const targetDay = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  return Math.round((targetDay - today) / 86_400_000);
}
