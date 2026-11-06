import type { ExtensionDefinition, Playbook, Step } from "@/types";

/**
 * The CACAO Layout extension, so other CACAO tools keep the layout made here.
 * https://github.com/oasis-tcs/cacao/tree/master/Extensions/layout
 */
export const LAYOUT_EXTENSION_ID =
  "extension-definition--418ee24c-9cb1-46d9-afa5-309e01aabc7f";

const LAYOUT_EXTENSION_DEFINITION: ExtensionDefinition = {
  type: "extension-definition",
  name: "CACAO Layout",
  description: "Extension definition for diagramming CACAO playbooks.",
  created_by: "identity--5abe695c-7bd5-4c31-8824-2528696cdbf1",
  schema:
    "https://github.com/oasis-tcs/cacao/tree/master/Extensions/layout/schemas/layout.json",
  version: "1.0.0",
  external_references: [
    {
      name: "CACAO Layout Specification.",
      description: "Specification for diagramming CACAO Playbooks graphically.",
      url: "https://docs.oasis-open.org/cacao/layout/v1.0/layout-v1.0.html",
    },
  ],
};

/** The midpoint of a step, in pixels from the top-left corner of the canvas. */
export type Position = { x: number; y: number };

type Coordinates = Position & { outgoing_connections?: unknown[] };

type LayoutExtension = { type: "layout"; coordinates?: Coordinates };

const readLayout = (step: Step): Partial<LayoutExtension> | undefined => {
  const value = step.step_extensions?.[LAYOUT_EXTENSION_ID];
  return value && typeof value === "object"
    ? (value as Partial<LayoutExtension>)
    : undefined;
};

/** The stored midpoint of a step, if it has one. */
export const getStoredPosition = (step: Step): Position | undefined => {
  const { x, y } = readLayout(step)?.coordinates ?? {};
  return typeof x === "number" && typeof y === "number" ? { x, y } : undefined;
};

/**
 * Stores the midpoints of steps as whole pixels and adds the extension definition to the playbook.
 * Other fields of the layout object are kept. The outgoing connections of a moved
 * step are cleared because their paths no longer fit.
 */
export const setPositions = (
  playbook: Playbook,
  positions: Record<string, Position>,
): Playbook => {
  const workflow = { ...playbook.workflow };

  for (const [stepId, position] of Object.entries(positions)) {
    const step = workflow[stepId];
    if (!step) continue;

    const x = Math.round(position.x);
    const y = Math.round(position.y);
    const stored = getStoredPosition(step);
    if (stored?.x === x && stored.y === y) continue;

    const layout = readLayout(step);
    const extension: LayoutExtension = {
      ...layout,
      type: "layout",
      coordinates: {
        ...layout?.coordinates,
        x,
        y,
        outgoing_connections: [],
      },
    };
    workflow[stepId] = {
      ...step,
      step_extensions: {
        ...step.step_extensions,
        [LAYOUT_EXTENSION_ID]: extension,
      },
    };
  }

  return {
    ...playbook,
    workflow,
    extension_definitions: {
      ...playbook.extension_definitions,
      [LAYOUT_EXTENSION_ID]:
        playbook.extension_definitions?.[LAYOUT_EXTENSION_ID] ??
        LAYOUT_EXTENSION_DEFINITION,
    },
  };
};
