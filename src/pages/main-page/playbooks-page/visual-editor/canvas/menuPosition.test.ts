import { describe, expect, it } from "vitest";

import { placeContextMenu, placeSubmenu, SUBMENU_GAP } from "./menuPosition";

const viewport = { width: 1000, height: 600 };
const submenu = { width: 200, height: 300 };

describe("placeContextMenu", () => {
  it("opens at the pointer when it fits", () => {
    expect(
      placeContextMenu(
        { x: 100, y: 50 },
        { width: 200, height: 100 },
        viewport,
      ),
    ).toEqual({ left: 100, top: 50 });
  });

  it("shifts back inside the viewport near its edges", () => {
    expect(
      placeContextMenu(
        { x: 950, y: 580 },
        { width: 200, height: 100 },
        viewport,
      ),
    ).toEqual({ left: 792, top: 492 });
  });
});

describe("placeSubmenu", () => {
  it("opens to the right of the parent menu when there is room", () => {
    const parent = { left: 100, right: 300 };
    expect(placeSubmenu(parent, 80, submenu, viewport)).toEqual({
      left: 300 + SUBMENU_GAP,
      top: 80,
    });
  });

  it("flips to the left of the parent menu near the right edge", () => {
    const parent = { left: 700, right: 900 };
    expect(placeSubmenu(parent, 80, submenu, viewport).left).toBe(
      500 - SUBMENU_GAP,
    );
  });

  it("uses the roomier side when neither side fits", () => {
    const narrow = { width: 500, height: 600 };
    const wide = { width: 300, height: 100 };
    const nearRight = { left: 200, right: 400 };
    const nearLeft = { left: 50, right: 250 };
    expect(placeSubmenu(nearRight, 0, wide, narrow).left).toBe(
      -100 - SUBMENU_GAP,
    );
    expect(placeSubmenu(nearLeft, 0, wide, narrow).left).toBe(
      250 + SUBMENU_GAP,
    );
  });

  it("moves up to stay in the viewport without overlapping the parent", () => {
    const parent = { left: 100, right: 300 };
    const position = placeSubmenu(parent, 500, submenu, viewport);
    expect(position).toEqual({ left: 300 + SUBMENU_GAP, top: 292 });
  });
});
