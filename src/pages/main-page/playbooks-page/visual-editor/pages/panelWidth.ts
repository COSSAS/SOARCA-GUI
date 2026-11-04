export type Side = "left" | "right";

// Side panels grow with wide screens, within these limits.
export const PANEL_WIDTH = {
  left: "clamp(12rem, 14vw, 18rem)",
  right: "clamp(24rem, 26vw, 36rem)",
};

export const panelWidth = (side: Side, collapsed: boolean) =>
  collapsed ? "2.5rem" : PANEL_WIDTH[side];