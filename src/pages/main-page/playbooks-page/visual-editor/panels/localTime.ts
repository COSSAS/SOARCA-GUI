const pad = (n: number) => String(n).padStart(2, "0");

/** A UTC timestamp as the user's local clock time, for a datetime-local input. */
export const toLocalInput = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

/** The local time typed in a datetime-local input, as a UTC timestamp. */
export const fromLocalInput = (text: string): string | undefined => {
  if (!text) return undefined;
  // Without an offset, Date reads a date-time string as local time.
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};
