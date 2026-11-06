import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { fromLocalInput, toLocalInput } from "./localTime";

describe("timestamps in local time", () => {
  beforeAll(() => {
    vi.stubEnv("TZ", "Europe/Amsterdam");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("shows a UTC timestamp in the user's time zone, summer time included", () => {
    expect(toLocalInput("2026-01-15T08:30:00Z")).toBe("2026-01-15T09:30");
    expect(toLocalInput("2026-07-01T10:00:00.000Z")).toBe("2026-07-01T12:00");
  });

  it("saves the typed local time as UTC", () => {
    expect(fromLocalInput("2026-01-15T09:30:00")).toBe("2026-01-15T08:30:00.000Z");
    expect(fromLocalInput("2026-07-01T12:00")).toBe("2026-07-01T10:00:00.000Z");
  });

  it("clears the field for empty or broken input", () => {
    expect(fromLocalInput("")).toBeUndefined();
    expect(toLocalInput("not a date")).toBe("");
  });
});
