export type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

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
