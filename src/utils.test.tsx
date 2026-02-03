import { describe, expect, test } from "vitest";
import {
  computeDurationMs,
  decodeBase64,
  formatDateTime,
  formatDuration,
  groupBy,
  parseDate,
  sortByNumber,
  sortByString,
} from "./utils";

describe("General application utility functions", () => {
  test("sortByString sorts an array of objects by a string key", () => {
    const dataAsc = [{ name: "banana" }, { name: "Apple" }, { name: "cherry" }];
    const sortedAsc = sortByString(dataAsc, (item) => item.name, true);

    const dataDesc = [
      { name: "banana" },
      { name: "Apple" },
      { name: "cherry" },
    ];
    const sortedDesc = sortByString(dataDesc, (item) => item.name, false);

    const dataCaseSensitive = [
      { name: "banana" },
      { name: "Apple" },
      { name: "cherry" },
    ];
    const sortedCaseSensitive = sortByString(
      dataCaseSensitive,
      (item) => item.name,
      true,
      true,
    );

    expect(JSON.stringify(sortedAsc), "Test sortByString ascending").toBe(
      JSON.stringify([
        { name: "Apple" },
        { name: "banana" },
        { name: "cherry" },
      ]),
    );
    expect(JSON.stringify(sortedDesc), "Test sortByString descending").toBe(
      JSON.stringify([
        { name: "cherry" },
        { name: "banana" },
        { name: "Apple" },
      ]),
    );
    expect(
      JSON.stringify(sortedCaseSensitive),
      "Test sortByString case sensitive",
    ).toBe(
      JSON.stringify([
        { name: "Apple" },
        { name: "banana" },
        { name: "cherry" },
      ]),
    );
  });

  test("sortByNumber sorts an array of objects by a number key", () => {
    const dataAsc = [
      { value: 10 },
      { value: undefined },
      { value: 5 },
      { value: 20 },
    ];
    const sortedAsc = sortByNumber(dataAsc, (item) => item.value);

    const dataDesc = [
      { value: 10 },
      { value: undefined },
      { value: 5 },
      { value: 20 },
    ];
    const sortedDesc = sortByNumber(dataDesc, (item) => item.value, false);

    expect(JSON.stringify(sortedAsc), "Test sortByNumber ascending").toBe(
      JSON.stringify([
        { value: 5 },
        { value: 10 },
        { value: 20 },
        { value: undefined },
      ]),
    );
    expect(JSON.stringify(sortedDesc), "Test sortByNumber descending").toBe(
      JSON.stringify([
        { value: 20 },
        { value: 10 },
        { value: 5 },
        { value: undefined },
      ]),
    );
  });

  test("Test groupBy groups an array of objects by a key", () => {
    const data = [
      { category: "fruit", name: "apple" },
      { category: "vegetable", name: "carrot" },
      { category: "fruit", name: "banana" },
      { category: "vegetable", name: "lettuce" },
    ];
    const grouped = groupBy(data, (item) => item.category);

    expect(JSON.stringify(grouped), "Test groupBy").toBe(
      JSON.stringify({
        fruit: [
          { category: "fruit", name: "apple" },
          { category: "fruit", name: "banana" },
        ],
        vegetable: [
          { category: "vegetable", name: "carrot" },
          { category: "vegetable", name: "lettuce" },
        ],
      }),
    );
  });

  test("parseDate handles undefined, invalid and valid dates", () => {
    expect(parseDate(undefined)).toBeUndefined();
    expect(parseDate("not-a-date")).toBeUndefined();
    const d = parseDate("2020-01-02T03:04:05.000Z");
    expect(d).toBeInstanceOf(Date);
    expect(d!.toISOString()).toBe("2020-01-02T03:04:05.000Z");
  });

  test("formatDateTime produces expected outputs for empty/invalid/valid", () => {
    expect(formatDateTime(undefined, true)).toBe("-");
    expect(formatDateTime(undefined, false)).toBe("—");
    // invalid date returns the original value
    expect(formatDateTime("not-a-date", false)).toBe("not-a-date");
    const formatted = formatDateTime("2020-01-02T03:04:05.000Z");
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });

  test("computeDurationMs returns undefined without start, difference with start/end and clamps negative to 0", () => {
    expect(computeDurationMs(undefined, undefined)).toBeUndefined();
    const start = "2020-01-01T00:00:00.000Z";
    const end = "2020-01-01T00:00:01.500Z"; // 1500ms
    expect(computeDurationMs(start, end)).toBe(1500);
    // end before start -> clamp to 0
    const earlyEnd = "2019-12-31T23:59:59.000Z";
    expect(computeDurationMs(start, earlyEnd)).toBe(0);
  });

  test("formatDuration uses millis format under 10s and rounds/minutes above, and includes hours when long", () => {
    expect(formatDuration(undefined)).toBe("—");
    expect(formatDuration(1234)).toBe("1.234s");
    // 65 seconds -> 1m 5s
    expect(formatDuration(65000)).toBe("1m 5s");
    // rounding of total seconds
    expect(formatDuration(10049)).toBe("0m 10s"); // 10049ms -> ~10s after rounding

    // hours formatting
    expect(formatDuration(3600000)).toBe("1h 0m 0s"); // exactly one hour
    expect(formatDuration(3661000)).toBe("1h 1m 1s"); // 1h 1m 1s
  });

  test("decodeBase64 decodes valid input and handles invalid/undefined", () => {
    expect(decodeBase64(undefined)).toBeUndefined();
    expect(decodeBase64("SGVsbG8=")).toBe("Hello");
    expect(decodeBase64("not-base64")).toBe(undefined);
  });
});
