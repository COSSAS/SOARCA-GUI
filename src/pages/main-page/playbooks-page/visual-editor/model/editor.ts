import type { Playbook } from "@/types";

import type { Position } from "./coordinates";
import type { Link } from "./rules";

/** Applies one of the pure edits from edits.ts: `edit((p) => removeSteps(p, [id]))`. */
export type EditPlaybook = (change: (playbook: Playbook) => Playbook) => void;

/** What the canvas needs to edit a playbook. */
export type CanvasEditor = {
  edit: EditPlaybook;
  selectedIds: string[];
  onSelect: (stepIds: string[]) => void;
  /** Adds a step; with `from`, also links that port of another step to it. */
  onAddStep: (
    type: string,
    position: Position,
    from?: Omit<Link, "target">,
  ) => void;
  onAutoLayout: () => void;
  onDuplicateStep: (stepId: string) => void;
};
