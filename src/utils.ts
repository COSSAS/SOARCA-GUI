// Consts

/**
 * URL to the SOARCA documentation.
 */
export const SOARCA_DOC_URL = "https://cossas.github.io/SOARCA/docs/";

/**
 * Application paths used in routing.
 */
export const PATHS = {
  BASE: "/",
  DASHBOARD: "/dashboard",
  PLAYBOOKS: {
    BASE: "/playbooks",
    DETAIL: "/playbooks/:playbookId",
    EDIT: "/playbooks/:playbookId/edit",
    NEW: "/playbooks/new",
  },
  MONITORING: {
    BASE: "/monitoring",
    DETAIL: "/monitoring/:executionId",
  },
  FINS: {
    BASE: "/fins",
    DETAIL: "/fins/:finId",
  },
  SETTINGS: "/settings",
  LOGIN: "/login",
  NOT_FOUND: "/are-you-lost",
};

// Sorters

/**
 * Sort an array of objects by a string key.
 * @param array - Array of objects to sort
 * @param ascending - Whether to sort in ascending order, default is true
 * @param caseSensitive - Whether the sort should be case sensitive, default is false
 * @param keyExtractor - Function to extract the string key from each object
 * @returns The original array sorted in place
 * @example
 * sortByString(users, user => user.name, true, false);
 */
export const sortByString = <T>(
  array: T[],
  keyExtractor: (item: T) => string,
  ascending: boolean = true,
  caseSensitive: boolean = false,
): T[] => {
  return array.sort((a, b) => {
    const keyA = caseSensitive
      ? keyExtractor(a)
      : keyExtractor(a).toLowerCase();
    const keyB = caseSensitive
      ? keyExtractor(b)
      : keyExtractor(b).toLowerCase();
    if (keyA < keyB) return ascending ? -1 : 1;
    if (keyA > keyB) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * Sort an array of objects by a number key.
 * @param array - Array of objects to sort
 * @param ascending - Whether to sort in ascending order, default is true
 * @param keyExtractor - Function to extract the number key from each object
 * @returns The original array sorted in place
 * @example
 * sortByNumber(products, product => product.price, false);
 */
export const sortByNumber = <T>(
  array: T[],
  keyExtractor: (item: T) => number | undefined,
  ascending: boolean = true,
): T[] => {
  return array.sort((a, b) => {
    const keyA = keyExtractor(a);
    const keyB = keyExtractor(b);
    if (keyA === undefined && keyB === undefined) return 0;
    if (keyA === undefined) return 1;
    if (keyB === undefined) return -1;
    if (keyA < keyB) return ascending ? -1 : 1;
    if (keyA > keyB) return ascending ? 1 : -1;
    return 0;
  });
};

// Grouping

/**
 * Group an array of objects by a key.
 * @param array - Array of objects to group
 * @param keyExtractor - Function to extract the key from each object
 * @returns An object where the keys are the extracted keys and the values are arrays of objects that share that key
 * @example
 * groupBy(orders, order => order.status);
 */
export const groupBy = <T, K extends PropertyKey>(
  array: T[],
  keyExtractor: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce(
    (result, item) => {
      const key = keyExtractor(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    },
    {} as Record<K, T[]>,
  );
};

// Formatting / parsing

/**
 * Parse a date string into a Date object.
 * @param value - The date string to parse
 * @returns A Date object or undefined if the input is invalid
 * @example
 * parseDate("2023-01-01T12:00:00Z"); // Date object
 * parseDate("invalid-date"); // undefined
 */
export function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Format a date string into a GB format date.
 * @param value - The date string to format
 * @param allowEmpty - Whether to allow empty values and return "-"
 * @returns A formatted date string or "-" if empty and allowed
 * @example
 * formatDateTime("2023-01-01T12:00:00Z"); // "01/01/2023, 12:00:00"
 * formatDateTime("", true); // "-"
 */
export function formatDateTime(value?: string, allowEmpty = false): string {
  if (allowEmpty && !value) return "-";
  const d = parseDate(value);
  if (!d) return value || "—";
  return d.toLocaleString("en-GB", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

/**
 * Compute the duration in milliseconds between two date strings.
 * @param started - The start date string
 * @param ended - The end date string
 * @returns The duration in milliseconds or undefined if start date is invalid
 * @example
 * computeDurationMs("2023-01-01T12:00:00Z", "2023-01-01T12:05:00Z"); // 300000
 * computeDurationMs("2023-01-01T12:00:00Z"); // duration from start to now
 */
export function computeDurationMs(
  started?: string,
  ended?: string,
): number | undefined {
  if (!started) return undefined;

  const start = parseDate(started);
  const finish = ended ? parseDate(ended) : new Date();

  return Math.max(0, finish!.getTime() - start!.getTime());
}

/**
 * Format a duration given in milliseconds into a hh.mm.ss string depending on the length.
 * @param durationMs - Duration in milliseconds
 * @returns Formatted duration string
 * @example
 * formatDuration(12345); // "12.345s"
 * formatDuration(654321); // "10m 54s"
 * formatDuration(3661000); // "1h 1m 1s"
 */
export function formatDuration(durationMs?: number): string {
  if (durationMs === undefined) return "—";
  if (durationMs < 10_000) return `${(durationMs / 1000).toFixed(3)}s`;
  const totalSec = Math.round(durationMs / 1000);

  // include hours when duration is at least one hour
  if (totalSec >= 3600) {
    const h = Math.floor(totalSec / 3600);
    const rem = totalSec % 3600;
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    return `${h}h ${m}m ${s}s`;
  }

  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

/**
 * Decode a base64 encoded string.
 * @param input - The base64 encoded string
 * @returns The decoded string or undefined if input is undefined
 * @example
 * decodeBase64("SGVsbG8gd29ybGQ="); // "Hello world"
 */
export function decodeBase64(input?: string): string | undefined {
  if (!input) return undefined;
  try {
    return atob(input);
  } catch {
    return undefined;
  }
}
