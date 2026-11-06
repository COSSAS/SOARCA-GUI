type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Rect = Pick<DOMRect, "left" | "right">;

const VIEWPORT_MARGIN = 8;
/** Space between a menu and its submenu. */
export const SUBMENU_GAP = 4;

const clamp = (value: number, size: number, viewportSize: number) =>
  Math.max(
    VIEWPORT_MARGIN,
    Math.min(value, viewportSize - size - VIEWPORT_MARGIN),
  );

/** Opens the menu at the pointer, shifted to stay inside the viewport. */
export const placeContextMenu = (point: Point, menu: Size, viewport: Size) => ({
  left: clamp(point.x, menu.width, viewport.width),
  top: clamp(point.y, menu.height, viewport.height),
});

/**
 * Places a submenu just beside the parent menu: on the right when it fits,
 * otherwise on the left, or on the roomier side when neither fits.
 * `top` is where the submenu's top edge goes so its first item lines up with the trigger.
 * Only the top is shifted to stay inside the viewport, so it never covers the parent.
 */
export const placeSubmenu = (
  parent: Rect,
  top: number,
  submenu: Size,
  viewport: Size,
) => {
  const roomRight =
    viewport.width - VIEWPORT_MARGIN - parent.right - SUBMENU_GAP;
  const roomLeft = parent.left - VIEWPORT_MARGIN - SUBMENU_GAP;
  const openRight = roomRight >= submenu.width || roomRight >= roomLeft;
  return {
    left: openRight
      ? parent.right + SUBMENU_GAP
      : parent.left - submenu.width - SUBMENU_GAP,
    top: clamp(top, submenu.height, viewport.height),
  };
};
