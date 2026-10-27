export type TogetherParts = {
  years: string;
  months: string;
  days: string;
  hours: string;
};

export type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

function addMonths(date: Date, monthsToAdd: number) {
  const next = new Date(date);
  const originalDay = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + monthsToAdd);
  const lastDayOfTargetMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate();
  next.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  return next;
}

export function getTogetherParts(now: Date | null, start: Date): TogetherParts {
  if (!now) {
    return { years: "--", months: "--", days: "--", hours: "--" };
  }

  if (now.getTime() <= start.getTime()) {
    return { years: "00", months: "00", days: "00", hours: "00" };
  }

  let cursor = new Date(start);
  let years = 0;
  let months = 0;

  for (;;) {
    const next = new Date(cursor);
    next.setFullYear(next.getFullYear() + 1);
    if (next.getTime() > now.getTime()) break;
    years += 1;
    cursor = next;
  }

  for (;;) {
    const next = addMonths(cursor, 1);
    if (next.getTime() > now.getTime()) break;
    months += 1;
    cursor = next;
  }

  const remainingMs = now.getTime() - cursor.getTime();
  const days = Math.floor(remainingMs / 86400000);
  const hours = Math.floor((remainingMs % 86400000) / 3600000);

  return { years: pad(years), months: pad(months), days: pad(days), hours: pad(hours) };
}

export function getCountdownParts(
  now: Date | null,
  target: Date | null,
): CountdownParts {
  if (!now || !target) {
    return { days: "--", hours: "--", minutes: "--", seconds: "--" };
  }

  const remainingMs = Math.max(target.getTime() - now.getTime(), 0);

  return {
    days: pad(Math.floor(remainingMs / 86400000)),
    hours: pad(Math.floor((remainingMs % 86400000) / 3600000)),
    minutes: pad(Math.floor((remainingMs % 3600000) / 60000)),
    seconds: pad(Math.floor((remainingMs % 60000) / 1000)),
  };
}
